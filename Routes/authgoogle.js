const express = require('express');
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const Employee = require('../Models/Employee');
const mongoose = require('mongoose');
const Owner = mongoose.model("Owner");  // Import Owner model
const { google } = require('googleapis');
const GoogleAuth = require('../Models/GoogleAuth');
const RequireLogin = require('../Middleware/requireLogin');
const cors = require('cors');

// Set up Google OAuth2 credentials
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Update the Google auth status check route
router.get('/google/status', RequireLogin, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not properly authenticated' });
    }

    // Check if user is owner
    const isOwner = req.user.role === 'Owner';
    console.log(`Checking auth status for ${isOwner ? 'owner' : 'employee'}`);
    
    if (isOwner) {
      // Owner authentication status check
      const owner = await Owner.findById(req.user._id).populate('googleAuth');
      
      if (!owner) {
        console.log(`No owner found with ID: ${req.user._id}`);
        return res.status(404).json({ error: 'Owner not found' });
      }
      
      if (owner.googleAuth && owner.googleAuth.tokens && owner.googleAuth.tokens.access_token) {
        console.log(`Owner is authenticated with Google Calendar`);
        res.json({ isAuthorized: true });
      } else {
        console.log(`Owner is NOT authenticated with Google Calendar`);
        res.json({ isAuthorized: false });
      }
    } else {
      // Employee authentication status check (existing code)
      const userId = req.user.employeeId || req.user._id.toString();
      
      const employee = await Employee.findOne({
        $or: [
          { employeeId: userId },
          { _id: userId }
        ]
      }).populate('googleAuth');
      
      if (!employee) {
        console.log(`No employee found with ID: ${userId}`);
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      if (employee.googleAuth && employee.googleAuth.tokens && employee.googleAuth.tokens.access_token) {
        console.log(`Employee ${userId} is authenticated with Google Calendar`);
        res.json({ isAuthorized: true });
      } else {
        console.log(`Employee ${userId} is NOT authenticated with Google Calendar`);
        res.json({ isAuthorized: false });
      }
    }
  } catch (error) {
    console.error('Error checking Google auth status:', error);
    res.status(500).json({ error: 'Failed to check authentication status' });
  }
});

router.get('/google/auth', RequireLogin, (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not properly authenticated' });
    }

    // Check if user is owner
    const isOwner = req.user.role === 'Owner';
    const userId = isOwner ? req.user._id.toString() : (req.user.employeeId || req.user._id.toString());
    
    console.log(`Generating auth URL for ${isOwner ? 'owner' : 'employee'}: ${userId}`);

    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    // Add user type to state for callback handling
    const stateData = JSON.stringify({
      id: userId,
      isOwner: isOwner
    });
    
    const stateParam = encodeURIComponent(stateData);
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent', // Force to get refresh_token every time
      state: stateParam, // Include user type and ID
      include_granted_scopes: true,
      response_type: 'code'
    });

    console.log(`Auth URL generated for ${isOwner ? 'owner' : 'employee'}`);
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authentication URL' });
  }
});

router.get('/google/callback', async (req, res) => {
  console.log('Google callback received');
  console.log('Full request query:', JSON.stringify(req.query));
  
  const { code, state, error } = req.query;
  
  if (error) {
    console.error(`Google returned error: ${error}`);
    return res.redirect(`${process.env.FRONTEND_URL}/calendar/error?message=Google_Error:${encodeURIComponent(error)}`);
  }
  
  if (!code) {
    console.error("No authorization code provided in callback");
    return res.redirect(`${process.env.FRONTEND_URL}/calendar/error?message=No_authorization_code`);
  }
  
  // Parse state parameter
  let userId, isOwner = false;
  
  try {
    if (state) {
      try {
        // Try to parse as JSON first (new format)
        const stateData = JSON.parse(decodeURIComponent(state));
        userId = stateData.id;
        isOwner = !!stateData.isOwner;
        console.log(`Parsed state data: userId=${userId}, isOwner=${isOwner}`);
      } catch (e) {
        // Fall back to old format (just userId)
        userId = decodeURIComponent(state);
        isOwner = false;
        console.log(`Using legacy state format: userId=${userId}`);
      }
    } else if (req.session && req.session.lastUserId) {
      // Last resort fallback
      userId = req.session.lastUserId;
      isOwner = false;
      console.log(`Using fallback userId from session: ${userId}`);
    } else {
      return res.redirect(`${process.env.FRONTEND_URL}/calendar/error?message=Missing_state_parameter`);
    }
    
    // Exchange authorization code for tokens
    console.log("Exchanging code for tokens...");
    const { tokens } = await oauth2Client.getToken(code);
    console.log("Tokens received successfully");
    
    if (isOwner) {
      // Handle owner authentication
      const owner = await Owner.findById(userId);
      
      if (!owner) {
        console.error(`No owner found with ID: ${userId}`);
        return res.redirect(`${process.env.FRONTEND_URL}/calendar/error?message=Owner_not_found`);
      }
      
      // Save tokens for owner
      let authRecord = await GoogleAuth.findOne({ userId: owner._id });
      
      if (authRecord) {
        console.log(`Updating existing auth record for owner`);
        authRecord.tokens = tokens;
        authRecord.lastUpdated = Date.now();
        await authRecord.save();
      } else {
        console.log(`Creating new auth record for owner`);
        authRecord = new GoogleAuth({
          userId: owner._id,
          tokens: tokens
        });
        await authRecord.save();
      }
      
      // Update owner with auth reference
      owner.googleAuth = authRecord._id;
      await owner.save();
      console.log(`Updated owner with googleAuth reference: ${authRecord._id}`);
    } else {
      // Handle employee authentication (existing code)
      const employee = await Employee.findOne({ 
        $or: [
          { _id: userId },
          { employeeId: userId }
        ]
      });
      
      if (!employee) {
        console.error(`No employee found with ID: ${userId}`);
        return res.redirect(`${process.env.FRONTEND_URL}/calendar/error?message=User_not_found`);
      }
      
      // Save tokens for employee
      let authRecord = await GoogleAuth.findOne({ userId: employee._id });
      
      if (authRecord) {
        console.log(`Updating existing auth record for employee: ${userId}`);
        authRecord.tokens = tokens;
        authRecord.lastUpdated = Date.now();
        await authRecord.save();
      } else {
        console.log(`Creating new auth record for employee: ${userId}`);
        authRecord = new GoogleAuth({
          userId: employee._id,
          tokens: tokens
        });
        await authRecord.save();
      }
      
      // Update employee
      employee.googleAuth = authRecord._id;
      await employee.save();
      console.log(`Updated employee with googleAuth reference: ${authRecord._id}`);
    }
    
    console.log("Authentication successful, redirecting to success page");
    res.redirect(`${process.env.FRONTEND_URL}/calendar/success`);
  } catch (error) {
    console.error('Error during Google authentication:', error);
    const errorMsg = encodeURIComponent(error.message || 'Unknown error');
    res.redirect(`${process.env.FRONTEND_URL}/calendar/error?message=${errorMsg}`);
  }
});

// Revoke Google Calendar access
router.post('/google/revoke', RequireLogin, async (req, res) => {
  if (!req.user) {
    return res.status(400).json({ error: 'User not properly authenticated' });
  }

  // Check if user is owner
  const isOwner = req.user.role === 'Owner';
  const userId = isOwner ? req.user._id : req.user.employeeId;
  
  console.log(`Revoking Google access for ${isOwner ? 'owner' : 'employee'}: ${userId}`);
  
  try {
    let authRecord;
    
    if (isOwner) {
      // Handle owner revocation
      const owner = await Owner.findById(userId).populate('googleAuth');
      
      if (!owner || !owner.googleAuth) {
        return res.status(400).json({ error: 'No Google authorization found for this owner' });
      }
      
      authRecord = owner.googleAuth;
      
      // Remove the reference from owner
      owner.googleAuth = undefined;
      await owner.save();
    } else {
      // Handle employee revocation
      const employee = await Employee.findOne({ 
        $or: [
          { _id: userId },
          { employeeId: userId }
        ]
      }).populate('googleAuth');
      
      if (!employee || !employee.googleAuth) {
        return res.status(400).json({ error: 'No Google authorization found for this employee' });
      }
      
      authRecord = employee.googleAuth;
      
      // Remove the reference from employee
      employee.googleAuth = undefined;
      await employee.save();
    }
    
    if (authRecord && authRecord.tokens && authRecord.tokens.access_token) {
      // Get auth client
      const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
      auth.setCredentials(authRecord.tokens);
      
      // Revoke access
      await auth.revokeToken(authRecord.tokens.access_token);
      
      // Remove from database
      await GoogleAuth.deleteOne({ _id: authRecord._id });
      
      console.log(`Successfully revoked Google access`);
      res.json({ success: true, message: 'Google access revoked' });
    } else {
      console.log(`No valid Google authorization found`);
      res.status(400).json({ error: 'No valid Google authorization found' });
    }
  } catch (error) {
    console.error('Error revoking Google auth:', error);
    res.status(500).json({ error: 'Failed to revoke authentication' });
  }
});

module.exports = router;
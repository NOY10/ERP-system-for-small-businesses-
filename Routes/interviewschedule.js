const express = require('express');
const router = express.Router();
const Meeting = require('../Models/Meeting');
const Employee = require('../Models/Employee');
const RequireLogin = require('../Middleware/requireLogin');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { 
  createGoogleMeetEvent, 
  notifyParticipants 
} = require('./utils/googleAuth');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Schedule an interview meeting with an external candidate
 * Path: POST /schedule-interview
 */
router.post('/', RequireLogin, async (req, res) => {
  try {
    const { title, description, date, startTime, endTime, intervieweeEmail, includeOwner } = req.body;
    
    // Check user authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'User authentication missing' });
    }
    
    // Validate required fields
    if (!title || !date || !startTime || !endTime || !intervieweeEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create a virtual participant for the interviewee
    const intervieweeId = `EXT-${Date.now()}`; // External user ID format
    
    // Create meeting object
    const newInterview = new Meeting({
      title,
      description: description || '',
      date,
      startTime,
      endTime,
      participants: [intervieweeId],
      organizer: req.user.employeeId || req.user._id,
      status: 'pending',
      includeOwner: includeOwner || false,
      isInterview: true, // Mark this as an interview type meeting
      intervieweeEmail // Store the interviewee's email
    });
    
    // Save the interview meeting
    await newInterview.save();
    
    // Send email notification to the interviewee
    const emailContent = {
      from: process.env.EMAIL_USER,
      to: intervieweeEmail,
      subject: `Interview Invitation: ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Interview Invitation</h2>
          <p>You have been invited for an interview:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
            ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
          </div>
          <p>You will receive a confirmation email with a meeting link once the interview is confirmed.</p>
          <p>If you have any questions, please reply to this email.</p>
          <p style="margin-top: 20px; font-size: 12px; color: #777;">This is an automated message, please do not reply directly.</p>
        </div>
      `
    };
    
    await transporter.sendMail(emailContent);
    
    res.status(201).json({
      success: true,
      meeting: newInterview
    });
  } catch (error) {
    console.error('Error scheduling interview:', error);
    res.status(500).json({ error: 'Failed to schedule interview', details: error.message });
  }
});

/**
 * Approve an interview meeting
 * Path: PUT /approve-interview/:interviewId
 */
router.put('/approve/:interviewId', RequireLogin, async (req, res) => {
  try {
    // Only allow managers, HR, or owners to approve interviews
    if (!['Accounts', 'HR', 'Owner'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized action' });
    }
    
    const interviewId = req.params.interviewId;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({ error: 'Invalid interview ID format' });
    }

    // Check if user is owner
    const isOwner = req.user.role === 'Owner';
    const userId = isOwner ? req.user._id : req.user.employeeId;
    
    // Find the interview meeting
    const interview = await Meeting.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    
    // Verify it's an interview type meeting
    if (!interview.isInterview) {
      return res.status(400).json({ error: 'Not an interview type meeting' });
    }
    
    // Add company employees participating in the interview
    const interviewers = [];
    
    // Always add the organizer as a participant
    const organizer = await Employee.findOne(
      { employeeId: interview.organizer },
      'email name'
    );
    
    if (organizer) {
      interviewers.push({
        email: organizer.email,
        name: organizer.name
      });
    }
    
    // Find owner to include in notifications if requested
    if (interview.includeOwner) {
      const Owner = mongoose.model('Owner');
      const owner = await Owner.findOne({}, 'email name');
      
      if (owner) {
        interviewers.push({
          email: owner.email,
          name: owner.name,
          isOwner: true
        });
      }
    }
    
    // Add interviewee - Make sure they're included in Google Calendar event
    interviewers.push({
      email: interview.intervieweeEmail,
      isExternal: true
    });
    
    // Create Google Meet link
    const meetResult = await createGoogleMeetEvent(
      interview, 
      interviewers, 
      userId,
      isOwner
    );
    
    // Update interview status and link
    interview.status = 'confirmed';
    interview.meetLink = meetResult.meetLink;
    interview.googleEventId = meetResult.googleEventId;
    interview.approvedBy = isOwner ? 'OWNER' : userId;
    interview.approvedAt = new Date();
    await interview.save();
    
    // Now use the modified notifyParticipants function to send notifications
    // The function will automatically include the intervieweeEmail from the meeting
    await notifyParticipants(interview, interviewers, userId, isOwner);
    
    res.json({
      success: true,
      interview
    });
  } catch (error) {
    console.error('Error approving interview:', error);
    res.status(500).json({ error: 'Failed to approve interview', details: error.message });
  }
});

/**
 * Reject an interview
 */
router.put('/reject/:interviewId', RequireLogin, async (req, res) => {
  try {
    // Only allow managers, HR, or owners to reject interviews
    if (!['Accounts', 'HR', 'Owner'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized action' });
    }
    
    const interviewId = req.params.interviewId;
    const { reason } = req.body;
    
    // Find the interview
    const interview = await Meeting.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    
    // Verify it's an interview type meeting
    if (!interview.isInterview) {
      return res.status(400).json({ error: 'Not an interview type meeting' });
    }
    
    // Update interview status
    interview.status = 'rejected';
    interview.rejectionReason = reason || '';
    interview.rejectedBy = req.user.employeeId;
    interview.rejectedAt = new Date();
    await interview.save();
    
    // Send rejection email to the interviewee
    const emailContent = {
      from: process.env.EMAIL_USER,
      to: interview.intervieweeEmail,
      subject: `Interview Update: ${interview.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Interview Status Update</h2>
          <p>We regret to inform you that the scheduled interview has been cancelled:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Title:</strong> ${interview.title}</p>
            <p><strong>Date:</strong> ${new Date(interview.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${interview.startTime} - ${interview.endTime}</p>
          </div>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>If you have any questions, please contact our HR department.</p>
          <p style="margin-top: 20px; font-size: 12px; color: #777;">This is an automated message, please do not reply directly.</p>
        </div>
      `
    };
    
    await transporter.sendMail(emailContent);
    
    res.json({
      success: true,
      interview
    });
  } catch (error) {
    console.error('Error rejecting interview:', error);
    res.status(500).json({ error: 'Failed to reject interview' });
  }
});

module.exports = router;
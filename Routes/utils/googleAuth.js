// FILE: routes/utils/googleCalendarHelpers.js
const { google } = require('googleapis');
const Employee = require('../../Models/Employee');
const nodemailer = require('nodemailer');
const OAuth2 = google.auth.OAuth2;
const ical = require('ical-generator');
const mongoose = require('mongoose'); // Add this line
const dns = require('dns'); // Add this at the top of the file

/**
 * CCreate a Google Calendar event for a meeting
 * @param {Object} meeting - The meeting object
 * @param {Array} participants - Array of participant objects with emails
 * @param {String} organizerId - ID of the user creating the event
 * @returns {Object} - Event details including meetLink
 */
async function createMockMeetEvent(meeting, participants) {
  try {
    // Generate a mock Google Meet link with proper format xxx-yyyy-zzz
    // Generate three parts of a Google Meet code
    const part1 = Math.random().toString(36).substring(2, 5);
    const part2 = Math.random().toString(36).substring(2, 6);
    const part3 = Math.random().toString(36).substring(2, 5);
    
    // Format according to Google Meet standards: xxx-yyyy-zzz
    const meetCode = `${part1}-${part2}-${part3}`;
    const mockMeetLink = `https://meet.google.com/${meetCode}`;
    
    console.log(`Created mock Google Meet link: ${mockMeetLink} for meeting: ${meeting.title}`);
    console.log(`Would have invited ${participants.length} participants`);
    
    // Return mock event details
    return {
      meetLink: mockMeetLink,
      googleEventId: `mock-event-${meetCode}`
    };
  } catch (error) {
    console.error('Error creating mock Meet event:', error);
    throw error;
  }
}

/**
 * Create a Google Calendar event for a meeting
 * @param {Object} meeting - The meeting object
 * @param {Array} participants - Array of participant objects with emails
 * @param {String} organizerId - ID of the user creating the event
 * @returns {Object} - Event details including meetLink
 */
async function createGoogleMeetEvent(meeting, participants, userId, isOwner) {
  try {
    let authTokens;
    
    if (isOwner || userId === 'OWNER') {
      // Get owner's google auth
      const Owner = mongoose.model('Owner');
      
      // Find the owner by ID if userId is an ObjectId, otherwise find the first owner
      const ownerQuery = mongoose.Types.ObjectId.isValid(userId) 
        ? { _id: userId } 
        : {};
        
      console.log('Looking for owner with query:', ownerQuery);
      
      // Find the owner (there should be only one)
      const owner = await Owner.findOne(ownerQuery).populate('googleAuth');
      
      if (!owner) {
        console.error('No owner found');
        throw new Error('Owner not found in the database');
      }
      
      if (!owner.googleAuth || !owner.googleAuth.tokens) {
        console.error('Owner has no Google Calendar authentication');
        throw new Error('Owner not authenticated with Google Calendar');
      }
      
      console.log('Using owner Google auth for calendar');
      authTokens = owner.googleAuth.tokens;
    } else {
      // Get employee's google auth
      const employee = await Employee.findOne({
        $or: [
          { employeeId: userId },
          { _id: userId }
        ]
      }).populate('googleAuth');
      
      if (!employee) {
        console.error(`No employee found with ID: ${userId}`);
        throw new Error('Employee not found');
      }
      
      if (!employee.googleAuth || !employee.googleAuth.tokens) {
        console.error('Employee has no Google Calendar authentication');
        throw new Error('Employee not authenticated with Google Calendar');
      }
      
      console.log('Using employee Google auth for calendar');
      authTokens = employee.googleAuth.tokens;
    }
    
    // Continue with the rest of your function to create the event...
    // Employee has Google auth, proceed with creating real event
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    oauth2Client.setCredentials({
      access_token: authTokens.access_token,
      refresh_token: authTokens.refresh_token,
      expiry_date: authTokens.expiry_date
    });
    
    // The rest of the function remains the same...
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Format date and times for Google Calendar
    const startDateTime = new Date(`${meeting.date.toISOString().split('T')[0]}T${meeting.startTime}:00`);
    const endDateTime = new Date(`${meeting.date.toISOString().split('T')[0]}T${meeting.endTime}:00`);
    
    // Create attendees list from participants
    const attendees = participants.map(participant => {
      const email = participant.email || (typeof participant === 'object' ? participant.email : null);
      return {
        email: email,
        responseStatus: 'needsAction'
      };
    }).filter(att => att.email); // Filter out any without email
    
    // Create event with Google Meet conferencing
    const event = {
      summary: meeting.title,
      description: meeting.description,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Asia/Thimphu' // Use appropriate timezone
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Asia/Thimphu' // Use appropriate timezone
      },
      attendees,
      conferenceData: {
        createRequest: {
          requestId: meeting._id.toString(),
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    };
    
    console.log('Creating Google Calendar event with conferencing data...');
    
    // Insert the event with conferenceDataVersion=1 to create Meet link
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all'
    });
    
    console.log('Google Calendar event created successfully.');
    console.log('Conference data:', JSON.stringify(response.data.conferenceData, null, 2));
    
    // Check if we have conference data with a Meet link
    if (response.data.conferenceData && response.data.conferenceData.entryPoints) {
      const meetEntry = response.data.conferenceData.entryPoints.find(
        entry => entry.entryPointType === 'video'
      );
      
      if (meetEntry && meetEntry.uri) {
        console.log(`Real Google Meet link created: ${meetEntry.uri}`);
        return {
          meetLink: meetEntry.uri,
          googleEventId: response.data.id
        };
      }
    }
    
    // If we don't have a Meet link in the response, use the hangoutLink
    if (response.data.hangoutLink) {
      console.log(`Using hangoutLink: ${response.data.hangoutLink}`);
      return {
        meetLink: response.data.hangoutLink,
        googleEventId: response.data.id
      };
    }
    
    // If no conference link was created, fall back to mock
    console.warn('No conference link found in response, falling back to mock');
    return createMockMeetEvent(meeting, participants);
  } catch (error) {
    console.error('Error creating Google Meet event, falling back to mock:', error);
    return createMockMeetEvent(meeting, participants);
  }
}
/**
 * Update an existing Google Calendar event
 * @param {String} eventId - Google Calendar event ID
 * @param {Object} meeting - Updated meeting object
 * @param {Array} participants - Updated participants array
 * @param {String} userId - User ID making the update
 */
async function updateGoogleMeetEvent(eventId, meeting, participants, userId, isOwner = false) {
  try {
    // If it's a mock event, just return success
    if (eventId.startsWith('mock-event-')) {
      console.log(`Updating mock event: ${eventId}`);
      return true;
    }
    
    let authTokens;
    
    if (isOwner) {
      // Get owner's Google auth
      const Owner = mongoose.model('Owner');
      const owner = await Owner.findById(userId).populate('googleAuth');
      
      if (!owner?.googleAuth?.tokens) {
        console.log(`Owner has no Google auth, cannot update real event`);
        return true; 
      }
      
      authTokens = owner.googleAuth.tokens;
    } else {
      // Otherwise try to update real event with employee token
      const employee = await Employee.findOne({ 
        $or: [
          { employeeId: userId },
          { _id: userId }
        ]
      }).populate('googleAuth');
      
      if (!employee?.googleAuth?.tokens) {
        console.log(`Employee ${userId} has no Google auth, cannot update real event`);
        return true;
      }
      
      authTokens = employee.googleAuth.tokens;
    }
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    oauth2Client.setCredentials({
      access_token: authTokens.access_token,
      refresh_token: authTokens.refresh_token,
      expiry_date: authTokens.expiry_date
    });
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Format date and times
    const startDateTime = new Date(`${meeting.date.toISOString().split('T')[0]}T${meeting.startTime}:00`);
    const endDateTime = new Date(`${meeting.date.toISOString().split('T')[0]}T${meeting.endTime}:00`);
    
    // Create attendees list with proper email handling
    const attendees = participants.map(participant => {
      const email = participant.email || (typeof participant === 'object' ? participant.email : null);
      return {
        email: email,
        responseStatus: 'needsAction'
      };
    }).filter(att => att.email); // Filter out any without email
    
    // Get current event
    const currentEvent = await calendar.events.get({
      calendarId: 'primary',
      eventId
    });
    
    // Update event object
    const updatedEvent = {
      ...currentEvent.data,
      summary: meeting.title,
      description: meeting.description,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Asia/Kolkata'
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Asia/Kolkata'
      },
      attendees
    };
    
    // Update the event
    await calendar.events.update({
      calendarId: 'primary',
      eventId,
      resource: updatedEvent,
      sendUpdates: 'all'
    });
    
    return true;
  } catch (error) {
    console.error('Error updating Google Meet event:', error);
    return true; // Return true to avoid breaking the flow
  }
}

/**
 * Cancel a Google Calendar event
 * @param {String} eventId - Google Calendar event ID
 * @param {String} userId - User ID cancelling the event
 */
async function cancelGoogleMeetEvent(eventId, userId, isOwner = false) {
  try {
    // If it's a mock event, just return success
    if (eventId.startsWith('mock-event-')) {
      console.log(`Cancelling mock event: ${eventId}`);
      return true;
    }
    
    let authTokens;
    
    if (isOwner) {
      // Get owner's Google auth
      const Owner = mongoose.model('Owner');
      const owner = await Owner.findById(userId).populate('googleAuth');
      
      if (!owner?.googleAuth?.tokens) {
        console.log(`Owner has no Google auth, cannot cancel real event`);
        return true; 
      }
      
      authTokens = owner.googleAuth.tokens;
    } else {
      // Otherwise try to cancel real event with employee token
      const employee = await Employee.findOne({ 
        $or: [
          { employeeId: userId },
          { _id: userId }
        ]
      }).populate('googleAuth');
      
      if (!employee?.googleAuth?.tokens) {
        console.log(`Employee ${userId} has no Google auth, cannot cancel real event`);
        return true;
      }
      
      authTokens = employee.googleAuth.tokens;
    }
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    oauth2Client.setCredentials({
      access_token: authTokens.access_token,
      refresh_token: authTokens.refresh_token,
      expiry_date: authTokens.expiry_date
    });
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Delete the event
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all'
    });
    
    return true;
  } catch (error) {
    console.error('Error cancelling Google Meet event:', error);
    return true; // Return true to avoid breaking the flow
  }
}

/**
 * Send meeting details to participants via email
 * @param {Object} meeting - Meeting document
 * @param {Array} participants - Array of participant objects with email
 * @param {Boolean} isNewMeeting - Whether this is a new meeting notification or an update
 * @param {String} additionalEmail - Optional additional email to notify (e.g., interviewee)
 */
async function notifyParticipants(meeting, participants, userId, isOwner = false, additionalEmail = null) {
  try {
    console.log('Notifying participants about meeting:', meeting.title);
    
    // Prepare participants list including the additional email if provided
    let recipientList = [...(participants || [])];
    
    // For interviews, ensure we include the interviewee email
    if (meeting.isInterview && meeting.intervieweeEmail) {
      console.log('Adding interviewee email to notifications:', meeting.intervieweeEmail);
      if (!recipientList.some(p => p.email === meeting.intervieweeEmail)) {
        recipientList.push({ email: meeting.intervieweeEmail });
      }
    }
    
    // Add additional email if provided (for backward compatibility)
    if (additionalEmail) {
      console.log('Adding additional email recipient:', additionalEmail);
      if (!recipientList.some(p => p.email === additionalEmail)) {
        recipientList.push({ email: additionalEmail });
      }
    }
    
    console.log('Final participants list:', recipientList.map(p => p.email || p).join(', '));
    
    // Skip if no participants or no emails
    if (!recipientList || recipientList.length === 0) {
      console.log('No participants to notify after processing');
      return;
    }

    // Use the same email configuration as in employee.js which is working
    const dns = require('dns');
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Force DNS lookup to use IPv4
      lookup: (hostname, options, callback) => {
        dns.lookup(hostname, { family: 4 }, callback);
      },
    });

    // Format date and time for email
    const meetingDate = new Date(meeting.date);
    const formattedDate = meetingDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Email content based on meeting status
    let subject, htmlContent;
    
    if (meeting.status === 'confirmed') {
      subject = meeting.isInterview 
        ? `Interview Confirmed: ${meeting.title}` 
        : `Meeting Confirmed: ${meeting.title}`;
        
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3498db;">${meeting.isInterview ? 'Interview' : 'Meeting'} Confirmed: ${meeting.title}</h2>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${meeting.startTime} - ${meeting.endTime}</p>
          ${meeting.description ? `<p><strong>Description:</strong> ${meeting.description}</p>` : ''}
          
          <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #3498db;">
            <p style="margin: 0;"><strong>Google Meet Link:</strong></p>
            <p style="margin: 10px 0;">
              <a href="${meeting.meetLink}" style="display: inline-block; padding: 10px 15px; background-color: #3498db; color: white; text-decoration: none; border-radius: 4px;">
                Join ${meeting.isInterview ? 'Interview' : 'Meeting'}
              </a>
            </p>
            <p style="margin: 0; font-size: 0.9em; color: #666;">
              You can also copy this link: <span style="color: #3498db;">${meeting.meetLink}</span>
            </p>
          </div>
          
          <p>This event has been added to your Google Calendar.</p>
          <p>If you cannot attend this ${meeting.isInterview ? 'interview' : 'meeting'}, please contact the organizer.</p>
        </div>
      `;
    }
    // Keep your other status conditions as they are
    
    // Email options - using BCC for privacy
    const recipientEmails = recipientList
      .filter(p => p && p.email)
      .map(p => p.email);
    
    if (recipientEmails.length === 0) {
      console.log('No valid recipient emails found after filtering');
      return false;
    }
    
    console.log(`Sending email to ${recipientEmails.length} recipients`);
    
    const mailOptions = {
      from: `"${meeting.isInterview ? 'Interview' : 'Meeting'} Scheduler" <${process.env.EMAIL}>`,
      bcc: recipientEmails.join(','),
      subject: subject,
      html: htmlContent
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`${meeting.isInterview ? 'Interview' : 'Meeting'} notification sent:`, info.messageId);
    return true;
  } catch (error) {
    console.error(`Error sending ${meeting.isInterview ? 'interview' : 'meeting'} notifications:`, error);
    // Continue execution even if email fails
    return false;
  }
}

// Add this function before notifyParticipants
async function getOAuth2Client(userId, isOwner = false) {
  // Create a new OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  try {
    // Get the auth tokens based on user type
    let authTokens;
    
    if (isOwner || userId === 'OWNER') {
      // Find and use owner's tokens
      const Owner = mongoose.model('Owner');
      const owner = await Owner.findOne({}).populate('googleAuth');
      
      if (!owner || !owner.googleAuth || !owner.googleAuth.tokens) {
        // Fall back to service account or system default
        console.log('Owner Google auth not found, using system default');
        return oauth2Client; // Return unconfigured client as fallback
      }
      
      authTokens = owner.googleAuth.tokens;
    } else {
      // Find and use employee's tokens
      const employee = await Employee.findOne({
        $or: [
          { employeeId: userId },
          { _id: userId }
        ]
      }).populate('googleAuth');
      
      if (!employee || !employee.googleAuth || !employee.googleAuth.tokens) {
        // Fall back to service account or system default
        console.log('Employee Google auth not found, using system default');
        return oauth2Client; // Return unconfigured client as fallback
      }
      
      authTokens = employee.googleAuth.tokens;
    }
    
    // Set the credentials
    oauth2Client.setCredentials(authTokens);
    return oauth2Client;
  } catch (error) {
    console.error('Error getting OAuth2 client:', error);
    return oauth2Client; // Return unconfigured client as fallback
  }
}

module.exports = {
  createGoogleMeetEvent,
  updateGoogleMeetEvent,
  cancelGoogleMeetEvent,
  notifyParticipants
};
// googleCalendarService.js

// First, you'll need to set up OAuth2 authentication with Google
// and install the googleapis package: npm install googleapis

import { google } from 'googleapis';

// Your OAuth2 credentials from Google Developer Console
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

// Set credentials (this would typically be done after your user authenticates with Google)
const setAuthCredentials = (tokens) => {
  oauth2Client.setCredentials(tokens);
};

// Create the calendar service
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

/**
 * Creates a Google Calendar event with a Google Meet link
 * 
 * @param {Object} meetingData - Meeting details
 * @param {string} meetingData.title - Meeting title
 * @param {string} meetingData.date - Meeting date in YYYY-MM-DD format
 * @param {string} meetingData.time - Meeting time in HH:MM format
 * @param {number} meetingData.duration - Meeting duration in minutes
 * @param {Array<string>} meetingData.attendees - Array of attendee email addresses
 * @returns {Promise<string>} - The Google Meet URL
 */
export const createGoogleMeeting = async (meetingData) => {
  try {
    const { title, date, time, duration, attendees } = meetingData;
    
    // Parse date and time to create start and end times
    const [hour, minute] = time.split(':').map(Number);
    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
    
    // Format dates for Google Calendar API
    const startTime = startDateTime.toISOString();
    const endTime = endDateTime.toISOString();
    
    // Format attendees for Google Calendar API
    const formattedAttendees = attendees.map(email => ({ email }));
    
    // Create the event with conferencing data
    const event = {
      summary: title,
      start: {
        dateTime: startTime,
        timeZone: 'America/New_York', // Change to your timezone or make dynamic
      },
      end: {
        dateTime: endTime,
        timeZone: 'America/New_York', // Change to your timezone or make dynamic
      },
      attendees: formattedAttendees,
      conferenceData: {
        createRequest: {
          requestId: `meeting-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      }
    };
    
    // Insert the event into the calendar
    const response = await calendar.events.insert({
      calendarId: 'primary', // or specific calendar ID
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all' // Sends emails to attendees
    });
    
    // Get the Google Meet link from the response
    const meetLink = response.data.conferenceData?.entryPoints?.[0]?.uri;
    
    if (!meetLink) {
      throw new Error('Failed to generate Google Meet link');
    }
    
    return meetLink;
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    throw error;
  }
};

/**
 * Get all meetings for a user within a specific date range
 * 
 * @param {Date} startDate - Start date range
 * @param {Date} endDate - End date range
 * @returns {Promise<Array>} - Array of calendar events
 */
export const getMeetings = async (startDate, endDate) => {
  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    return response.data.items;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
};

/**
 * Update a meeting in Google Calendar
 * 
 * @param {string} eventId - The ID of the event to update
 * @param {Object} meetingData - Updated meeting details
 * @returns {Promise<Object>} - Updated event
 */
export const updateMeeting = async (eventId, meetingData) => {
  try {
    const { title, date, time, duration, attendees } = meetingData;
    
    // Get the existing event
    const event = await calendar.events.get({
      calendarId: 'primary',
      eventId,
    });
    
    // Parse date and time to create start and end times
    const [hour, minute] = time.split(':').map(Number);
    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
    
    // Format dates for Google Calendar API
    const startTime = startDateTime.toISOString();
    const endTime = endDateTime.toISOString();
    
    // Format attendees for Google Calendar API
    const formattedAttendees = attendees.map(email => ({ email }));
    
    // Update the event
    const updatedEvent = {
      ...event.data,
      summary: title,
      start: {
        dateTime: startTime,
        timeZone: 'America/New_York', // Change to your timezone
      },
      end: {
        dateTime: endTime,
        timeZone: 'America/New_York', // Change to your timezone
      },
      attendees: formattedAttendees,
    };
    
    // Send the update to Google Calendar
    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId,
      resource: updatedEvent,
      sendUpdates: 'all', // Sends emails to attendees
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
};

/**
 * Cancel/delete a meeting in Google Calendar
 * 
 * @param {string} eventId - The ID of the event to delete
 * @returns {Promise<void>}
 */
export const cancelMeeting = async (eventId) => {
  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all', // Sends cancellation emails to attendees
    });
  } catch (error) {
    console.error('Error canceling calendar event:', error);
    throw error;
  }
};
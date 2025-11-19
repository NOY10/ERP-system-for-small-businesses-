// FILE: routes/meeting.js
const express = require('express');
const router = express.Router();
const Meeting = require('../Models/Meeting');
const Employee = require('../Models/Employee');
const RequireLogin = require('../Middleware/requireLogin');
const mongoose = require('mongoose');
const { 
  createGoogleMeetEvent, 
  updateGoogleMeetEvent, 
  cancelGoogleMeetEvent, 
  notifyParticipants 
} = require('./utils/googleAuth');

/**
 * Helper function to validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} - Whether ID is valid
 */
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Create a new meeting
 * Path: POST /api/meeting/schedule
 */
// routes/meetings.js

router.post('/schedule', RequireLogin, async (req, res) => {
  console.log('Scheduling meeting:', req.body);
  console.log('participants', req.body.participants);
  try {
    const { title, description, date, startTime, endTime, participants, includeOwner } = req.body;
    
    // Debug log to see what's in req.user
    console.log('User attempting to schedule meeting:', {
      userId: req.user._id,
      employeeId: req.user.employeeId,
      name: req.user.name,
      role: req.user.role
    });
    
    // Check user authentication 
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'User authentication missing' });
    }
    
    // Validate required fields
    if (!title || !date || !startTime || !endTime || !participants || participants.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Defensive: ensure participants are employeeId strings
    const validParticipants = await Employee.find({ employeeId: { $in: participants } }, 'employeeId');
    const participantIds = validParticipants.map(e => e.employeeId);
    
    // Create meeting object with owner include flag
    const newMeeting = new Meeting({
      title,
      description: description || '',
      date,
      startTime,
      endTime,
      participants: participantIds,
      organizer: req.user.employeeId || req.user._id, // Handle owner case
      status: 'pending',
      includeOwner: includeOwner || false // Store whether owner should be included
    });
    
    // Save the meeting
    await newMeeting.save();
    
    res.status(201).json({
      success: true,
      meeting: newMeeting
    });
  } catch (error) {
    console.error('Error scheduling meeting:', error);
    res.status(500).json({ error: 'Failed to schedule meeting', details: error.message });
  }
});
/**
 * Get all meetings for a user
 * Path: GET /api/meeting
 */
router.get('/', RequireLogin, async (req, res) => {
  try {
    let query;
    
    // Different query depending on if user is Owner or regular Employee
    if (req.user.role === 'Owner') {
      // For Owner, show all meetings or those where includeOwner is true
      query = {
        $or: [
          { includeOwner: true },
          { organizer: req.user._id }
        ]
      };
    } else {
      // For regular employees, show meetings they're participating in
      query = {
        $or: [
          { participants: req.user.employeeId },
          { organizer: req.user.employeeId }
        ]
      };
    }
    
    // Find meetings based on the query
    const meetings = await Meeting.find(query).sort({ date: 1, startTime: 1 });
    
    // Populate participant details
    const populatedMeetings = await Promise.all(meetings.map(async (meeting) => {
      const meetingObj = meeting.toObject();
      
      // Get participant details - handle both internal employees and external interviewees
      let participantDetails = [];
      
      if (meeting.isInterview && meeting.intervieweeEmail) {
        // For interviews, create a virtual participant for the interviewee
        participantDetails = [{
          id: 'external-interviewee',
          employeeId: 'external-interviewee',
          name: 'External Candidate',
          email: meeting.intervieweeEmail,
          isExternal: true
        }];
      } else {
        // For regular meetings, get actual employee details
        participantDetails = await Employee.find(
          { employeeId: { $in: meeting.participants } },
          'employeeId name email profileImage'
        );
      }
      
      // Get organizer details - handle both employee and owner organizers
      let organizer;
      if (meeting.organizer && meeting.organizer.includes('EMP')) {
        // If organizer is an employee
        organizer = await Employee.findOne(
          { employeeId: meeting.organizer },
          'employeeId name email profileImage'
        );
      } else {
        // If organizer might be an owner
        const Owner = mongoose.model('Owner');
        organizer = await Owner.findOne(
          { _id: meeting.organizer },
          'name email profileImage'
        );
        
        if (organizer) {
          organizer = {
            ...organizer.toObject(),
            role: 'Owner'
          };
        }
      }
      
      return {
        ...meetingObj,
        participants: participantDetails,
        organizer,
        isInterview: meetingObj.isInterview || false
      };
    }));
    
    res.json({ success: true, meetings: populatedMeetings });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

/**
 * Get a specific meeting by ID
 * Path: GET /api/meeting/:meetingId
 */
router.get('/:meetingId', RequireLogin, async (req, res) => {
  try {
    const meetingId = req.params.meetingId;
    
    // Validate ObjectId format to prevent casting errors
    if (!isValidObjectId(meetingId)) {
      return res.status(400).json({ error: 'Invalid meeting ID format' });
    }
    
    // Find the meeting
    const meeting = await Meeting.findById(meetingId);
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    // Check if user is authorized to view this meeting
    if (
      !meeting.participants.includes(req.user.employeeId) &&
      meeting.organizer !== req.user.employeeId &&
      !['HR', 'Owner', 'Manager'].includes(req.user.role)
    ) {
      return res.status(403).json({ error: 'Not authorized to view this meeting' });
    }
    
    // Get participant details
    const participantDetails = await Employee.find(
      { employeeId: { $in: meeting.participants } },
      'employeeId name email profileImage'
    );
    
    // Get organizer details
    const organizer = await Employee.findOne(
      { employeeId: meeting.organizer },
      'employeeId name email profileImage'
    );
    
    const meetingObj = meeting.toObject();
    
    res.json({
      success: true,
      meeting: {
        ...meetingObj,
        participants: participantDetails,
        organizer
      }
    });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({ error: 'Failed to fetch meeting' });
  }
});

/**
 * Get pending meeting requests (for approval)
 * Path: GET /api/meeting/status/pending
 * IMPORTANT: This route must come before /:meetingId to avoid path conflict
 */
router.get('/status/pending', RequireLogin, async (req, res) => {
  try {
    // Only allow managers, HR, or owners to view pending meetings
    if (!['Accounts', 'HR', 'Owner'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    // Find pending meetings
    const pendingMeetings = await Meeting.find({ status: 'pending' })
      .sort({ date: 1, startTime: 1 });

    // Populate participant and organizer details
    const populatedMeetings = await Promise.all(pendingMeetings.map(async (meeting) => {
      const meetingObj = meeting.toObject();

      // Defensive: ensure participants is an array of strings
      let participantDetails = [];
      if (Array.isArray(meeting.participants) && meeting.participants.length > 0) {
        participantDetails = await Employee.find(
          { employeeId: { $in: meeting.participants } },
          'employeeId name email profileImage'
        );
      }

      // Defensive: ensure organizer is a string
      let organizer = null;
      if (typeof meeting.organizer === 'string' && meeting.organizer.length > 0) {
        organizer = await Employee.findOne(
          { employeeId: meeting.organizer },
          'employeeId name email profileImage'
        );
      }

      return {
        ...meetingObj,
        participants: participantDetails,
        organizer
      };
    }));

    res.json({ success: true, meetings: populatedMeetings });
  } catch (error) {
    console.error('Error fetching pending meetings:', error);
    res.status(500).json({ error: 'Failed to fetch pending meetings' });
  }
});

/**
 * Update a meeting
 * Path: PUT /api/meeting/:meetingId
 */
router.put('/:meetingId', RequireLogin, async (req, res) => {
  try {
    const meetingId = req.params.meetingId;
    
    // Validate ObjectId format
    if (!isValidObjectId(meetingId)) {
      return res.status(400).json({ error: 'Invalid meeting ID format' });
    }
    
    const { title, description, date, startTime, endTime, participants } = req.body;
    
    // Find the meeting
    const meeting = await Meeting.findById(meetingId);
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    // Check if user is authorized to update this meeting
    if (
      meeting.organizer !== req.user.employeeId &&
      !['HR', 'Owner','Accounts'].includes(req.user.role)
    ) {
      return res.status(403).json({ error: 'Not authorized to update this meeting' });
    }
    
    // Update meeting fields
    if (title) meeting.title = title;
    if (description !== undefined) meeting.description = description;
    if (date) meeting.date = date;
    if (startTime) meeting.startTime = startTime;
    if (endTime) meeting.endTime = endTime;
    if (participants && participants.length > 0) meeting.participants = participants;
    
    // If meeting is already confirmed and calendar details changed, update Google Calendar
    if (
      meeting.status === 'confirmed' && 
      meeting.googleEventId &&
      (date || startTime || endTime || participants)
    ) {
      // Get participants details for Google Meet
      const updatedParticipants = await Employee.find(
        { employeeId: { $in: meeting.participants } },
        'email'
      );
      
      // Update Google Calendar event
      await updateGoogleMeetEvent(
        meeting.googleEventId,
        meeting,
        updatedParticipants,
        req.user.employeeId
      );
      
      // Notify participants of the update
      await notifyParticipants(meeting, updatedParticipants);
    }
    
    // Save the meeting
    await meeting.save();
    
    res.json({
      success: true,
      meeting
    });
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ error: 'Failed to update meeting' });
  }
});

/**
 * Approve a meeting
 * Path: PUT /api/meeting/approve/:meetingId
 */
router.put('/approve/:meetingId', RequireLogin, async (req, res) => {
  try {
    // Only allow managers, HR, or owners to approve meetings
    if (!['Accounts', 'HR', 'Owner'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized action' });
    }
    
    const meetingId = req.params.meetingId;
    
    // Validate ObjectId format
    if (!isValidObjectId(meetingId)) {
      return res.status(400).json({ error: 'Invalid meeting ID format' });
    }

    // Check if user is owner
    const isOwner = req.user.role === 'Owner';
    const userId = isOwner ? req.user._id : req.user.employeeId;
    
    // Log the approving user for debugging
    console.log('Authenticated user:', {
      id: req.user._id,
      employeeId: req.user.employeeId,
      email: req.user.email,
      role: req.user.role,
      isOwner: isOwner
    });
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated properly' });
    }
    
    // Find the meeting
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
  
    if (!meeting.participants?.length) {
      return res.status(400).json({ error: 'No participants in meeting' });
    }
    
    // Get participants details for Google Meet
    const participants = await Employee.find(
      { employeeId: { $in: meeting.participants } },
      'email'
    );
    
    // Find owner to include in notifications
    const Owner = mongoose.model('Owner');
    const owner = await Owner.findOne({}, 'email name');
    
    // Add owner to notification recipients if they're not the approver or if includeOwner is true
    const allRecipients = [...participants];
    if (owner && (meeting.includeOwner || !isOwner)) {
      allRecipients.push({
        email: owner.email,
        name: owner.name,
        isOwner: true
      });
    }
    
    // Create Google Meet link - make sure to pass isOwner
    const meetResult = await createGoogleMeetEvent(
      meeting, 
      participants, 
      userId,
      isOwner
    );
    
    // Update meeting status and link
    meeting.status = 'confirmed';
    meeting.meetLink = meetResult.meetLink;
    meeting.googleEventId = meetResult.googleEventId;
    meeting.approvedBy = isOwner ? 'OWNER' : userId;
    meeting.approvedAt = new Date();
    await meeting.save();
    
    // Pass isOwner parameter to notifyParticipants
    await notifyParticipants(meeting, allRecipients, userId, isOwner);
    
    res.json({
      success: true,
      meeting
    });
  } catch (error) {
    console.error('Error approving meeting:', error);
    res.status(500).json({ error: 'Failed to approve meeting' });
  }
});

/**
 * Reject a meeting
 * Path: PUT /api/meeting/reject/:meetingId
 */
router.put('/reject/:meetingId', RequireLogin, async (req, res) => {
  try {
    // Only allow managers, HR, or owners to reject meetings
    if (!['Accounts', 'HR', 'Owner'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized action' });
    }
    
    const meetingId = req.params.meetingId;
    
    // Validate ObjectId format
    if (!isValidObjectId(meetingId)) {
      return res.status(400).json({ error: 'Invalid meeting ID format' });
    }
    
    const { reason } = req.body;
    
    // Find the meeting
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    // 
    // 
    //  fjust hte treail version Update meeting status
    meeting.status = 'rejected';
    meeting.rejectionReason = reason || '';
    meeting.rejectedBy = req.user.employeeId;
    meeting.rejectedAt = new Date();
    await meeting.save();
    
    // Get participants for notification
    const participants = await Employee.find(
      { employeeId: { $in: meeting.participants } },
      'email'
    );
    
    // Notify participants
    await notifyParticipants(meeting, participants);
    
    res.json({
      success: true,
      meeting
    });
  } catch (error) {
    console.error('Error rejecting meeting:', error);
    res.status(500).json({ error: 'Failed to reject meeting' });
  }
});

/**
 * Cancel a meeting
 * Path: PUT /api/meeting/cancel/:meetingId
 */
router.put('/cancel/:meetingId', RequireLogin, async (req, res) => {
  try {
    const meetingId = req.params.meetingId;
    
    // Validate ObjectId format
    if (!isValidObjectId(meetingId)) {
      return res.status(400).json({ error: 'Invalid meeting ID format' });
    }
    
    // Find the meeting
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    // Check if user is organizer or has permission
    if (
      meeting.organizer !== req.user.employeeId && 
      !['HR', 'Owner','Accounts'].includes(req.user.role)
    ) {
      return res.status(403).json({ error: 'Unauthorized action' });
    }
    
    // If meeting is confirmed and has a Google Event ID, cancel in Google Calendar
    if (meeting.status === 'confirmed' && meeting.googleEventId) {
      await cancelGoogleMeetEvent(meeting.googleEventId, req.user.employeeId);
    }
    
    // Update meeting status
    meeting.status = 'cancelled';
    meeting.cancelledBy = req.user.employeeId;
    meeting.cancelledAt = new Date();
    await meeting.save();
    
    // Get participants for notification
    const participants = await Employee.find(
      { employeeId: { $in: meeting.participants } },
      'email'
    );
    
    // Notify participants of cancellation
    await notifyParticipants(meeting, participants);
    
    res.json({
      success: true,
      meeting
    });
  } catch (error) {
    console.error('Error cancelling meeting:', error);
    res.status(500).json({ error: 'Failed to cancel meeting' });
  }
});

/**
 * Get meetings by date range
 * Path: GET /api/meeting/by-date
 */
router.get('/date-range', RequireLogin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Defensive: check for user and employeeId
    if (!req.user || !req.user.employeeId) {
      return res.status(400).json({ error: 'User information missing or invalid' });
    }

    // Validate date range
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

  
    // Find meetings in date range where user is a participant or organizer
    const meetings = await Meeting.find({
      date: { $gte: startDate, $lte: endDate },
      $or: [
        { participants: req.user.employeeId },
        { organizer: req.user.employeeId }
      ],
      status: { $ne: 'cancelled' } // Exclude cancelled meetings
    }).sort({ date: 1, startTime: 1 });

    // Populate participant details
    const populatedMeetings = await Promise.all(meetings.map(async (meeting) => {
      const meetingObj = meeting.toObject();
      const participantDetails = await Employee.find(
        { employeeId: { $in: meeting.participants } },
        'employeeId name email profileImage'
      );
      const organizer = await Employee.findOne(
        { employeeId: meeting.organizer },
        'employeeId name email profileImage'
      );
      return {
        ...meetingObj,
        participants: participantDetails,
        organizer
      };
    }));

    res.json({ success: true, meetings: populatedMeetings });
  } catch (error) {
    console.error('Error fetching meetings by date:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

module.exports = router;
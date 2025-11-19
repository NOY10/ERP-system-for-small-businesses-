// FILE: Models/Meeting.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const meetingSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  participants: [{
    type: String, // Store employee IDs
    ref: 'Employee'
  }],
  organizer: {
    type: String,
    ref: 'Employee',
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'cancelled'],
    default: 'pending'
  },
  meetLink: {
    type: String,
    default: null
  },
  googleEventId: {
    type: String,
    default: null
  },
  // Approval fields
  approvedBy: {
    type: String,
    ref: 'Employee',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  // Rejection fields
  rejectedBy: {
    type: String,
    ref: 'Employee',
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  // Cancellation fields
  cancelledBy: {
    type: String,
    ref: 'Employee',
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  includeOwner: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // New fields for interview meetings
  isInterview: {
    type: Boolean,
    default: false
  },
  intervieweeEmail: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Meeting', meetingSchema);
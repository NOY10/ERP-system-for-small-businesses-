// FILE: Models/GoogleAuth.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const GoogleAuthSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  tokens: {
    access_token: String,
    refresh_token: String,
    scope: String,
    token_type: String,
    expiry_date: Number
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Add virtual to make accessToken more easily accessible
GoogleAuthSchema.virtual('accessToken').get(function() {
  return this.tokens && this.tokens.access_token;
});

// Add virtual to make refreshToken more easily accessible
GoogleAuthSchema.virtual('refreshToken').get(function() {
  return this.tokens && this.tokens.refresh_token;
});

module.exports = mongoose.model('GoogleAuth', GoogleAuthSchema);
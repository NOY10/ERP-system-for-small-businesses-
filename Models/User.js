const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ownerSchema = Schema({
  name: {
    type: String,
    require: true,
  },
  profileImage: {
    type: String,
  },
  password: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  phone: {
    type: String,
    require: true,
  },
  role: {
    type: String,
    default: "Owner",
  },
  address: {
    type: String,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  cid: {
    type: Number,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  subscription: {
    type: String,
    require: true,
  },
  canApproveMeetings: {
    type: Boolean,
    default: false,
  },
  account: {
    type: String,
    require: true,
  },
  subscriptiondate: { type: Date, default: Date.now },

  // Add this field for Google Calendar authentication
  googleAuth: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GoogleAuth'
  },

  resetToken: String,

  expireToken: Date,
});

mongoose.model("Owner", ownerSchema);

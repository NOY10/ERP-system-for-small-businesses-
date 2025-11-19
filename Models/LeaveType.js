const mongoose = require("mongoose");

const leaveTypeSchema = new mongoose.Schema({
  leaveType: { type: String, required: true },
  days: { type: Number, required: true },
  payment: { type: Boolean, required: true },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("LeaveType", leaveTypeSchema);

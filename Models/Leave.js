const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  leaveType: {
    type: String,
  },

  days: { type: Number },
  startDate: { type: String },
  endDate: {
    type: String,
  },
  reason: {
    type: String,
  },
  status: { type: String, default: "Pending" },
  // employeeName: { type: String },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
});

mongoose.model("Leave", leaveSchema);

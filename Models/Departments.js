const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  deptName: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Owner",
    required: true,
  },
});

module.exports = mongoose.model("Departments", roleSchema);

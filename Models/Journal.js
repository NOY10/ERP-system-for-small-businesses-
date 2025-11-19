const mongoose = require("mongoose");

const JournalSchema = new mongoose.Schema({
  narration: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  creditTotal: {
    type: Number,
    required: true,
  },
  debitTotal: {
    type: Number,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Owner",
  },
});

const Journal = mongoose.model("Journal", JournalSchema);
module.exports = Journal;

const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema({
  header: {
    type: String,
  },

  subheader: {
    type: String,
  },

  amount: {
    type: Number,
  },

  description: {
    type: String,
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Owner",
  },

  date: {
    type: String,
    //default: Date.now()
  },
  journalID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Journal",
    required: false,
  },
  taxRate: {
    type: String,
    required: false,
  },
});

mongoose.model("Income", incomeSchema);

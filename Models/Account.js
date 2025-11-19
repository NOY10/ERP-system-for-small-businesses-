const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  code: {
    type: Number,
    required: true,
    // unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      "Current Asset",
      "Non-current Asset",
      "Current Liability",
      "Non-current Liability",
      "Equity",
      "Direct Expense",
      "Other Expense",
      "Cost of Goods Sold (COGS)",
      "Operating Expenses",
      "Revenue",
      "Sales",
      "Other Income",
    ],
  },
  taxRate: {
    type: Number,
    required: true,
  },
  // ytd: {
  //   type: Number,
  //   required: true,
  // },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Owner",
  },
  dateCreated: {
    type: Date,
    // default: Date.now,
  },
});

module.exports = mongoose.model("Account", accountSchema);

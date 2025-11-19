const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
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
});

mongoose.model("ExpenseReconcile", expenseSchema);

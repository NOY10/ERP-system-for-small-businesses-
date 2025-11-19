const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  to: {
    type: String,
  },
  title: {
    type: String,
  },
  invoiceItems: [
    {
      item: {
        type: String,
      },
      amount: {
        type: Number,
      },
      unitPrice: {
        type: Number,
      },

      qty: {
        type: Number,
        default: 1,
      },
    },
  ],

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Owner",
  },

  date: {
    type: String,
    //default: Date.now()
  },
});

mongoose.model("Invoice", invoiceSchema);

const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema({
  to: {
    type: String,
  },
  title: {
    type: String,
  },
  quotationItems: [
    {
      item: {
        type: String,
      },
      amount: {
        type: String,
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

mongoose.model("Quotation", quotationSchema);

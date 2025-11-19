const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema({
  accountname: {
    type: String,
    required: true,
  },

  accountnumber: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /\d{12}/.test(v);
      },
      message: "Account number must be a 14-digit number.",
    },
  },
  startdate: {
    type: String,
  },
  enddate: {
    type: String,
  },

  // accounttype: {
  //   type: String,
  //   required: true,  // Uncomment if necessary and add validation
  // },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Owner",
  },
});

const Bank = mongoose.model("Bank", bankSchema);
module.exports = Bank;

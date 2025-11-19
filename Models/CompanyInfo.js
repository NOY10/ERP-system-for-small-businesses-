const mongoose = require("mongoose");

const CompanyInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  established: {
    type: String,
  },
  regNo: {
    type: String,
  },
  logo: {
    type: String,
  },
  bankName: {
    type: String,
  },
  accountNo: {
    type: String,
  },
  address: {
    type: String,
  },
  dzongkhag: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  website: {
    type: String,
  },
  fiscalYear: {
    type: String,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const CompanyInfo = mongoose.model("CompanyInfo", CompanyInfoSchema);
module.exports = CompanyInfo;

const mongoose = require("mongoose");

const PayslipSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },

  name: { 
    type: String, 
    required: true 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  email: {
    type: String,
    required: true
  },
  basicSalary: { 
    type: Number, 
    required: true 
  },
  allowances: [
    {
      name: String,
      amount: Number
    }
  ],
  deductions: [
    {
      name: String,
      amount: Number
    }
  ],
  bankDetails: {
    accountNumber: { 
      type: String, 
      required: false
    },
    bankName: { 
      type: String, 
      required: false
    },
  },
  status: { 
    type: String, 
    enum: ["Pending", "Paid","Draft", "Review Ongoing", "Confirmed",], 
    default: "Pending" 
  },
  
}, { timestamps: true });

const Payslip = mongoose.model("Payslip", PayslipSchema);
module.exports = Payslip;
const mongoose = require("mongoose");

const AdvanceSalarySchema = new mongoose.Schema({
  employee: { type: String, required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  providedDate: { type: String, required: true },
  installmentAmount: { type: Number, required: true },
  totalInstallments: { type: Number, required: true },
  employeeSalary: { type: String, required: true },
  description: { type: String },
  status: { type: String, default: "Pending" },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Owner",
    required: true,
  },
});

module.exports = mongoose.model("AdvanceSalary", AdvanceSalarySchema);

const mongoose = require("mongoose");

const AllowanceTypeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  description: { 
    type: String,  
    trim: true 
  },
  defaultAmount: { 
    type: Number, 
    default: 0 
  },
  appliesTo: { 
    type: String, 
    required: true, 
    enum: ["All", "Specific"], // Whether the allowance applies to all or specific employees
    default: "All"
  },
  includedEmployees: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Employee" // References to specific employees (if appliesTo is "Specific")
  }],
  excludedEmployees: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Employee" // References to excluded employees (if appliesTo is "All")
  }],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", // Reference to the user who created the allowance
    required: true 
  },
}, { timestamps: true });

const AllowanceType = mongoose.model("AllowanceType", AllowanceTypeSchema);
module.exports = AllowanceType;
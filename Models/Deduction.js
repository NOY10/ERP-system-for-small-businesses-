const mongoose = require("mongoose");

const DeductionTypeSchema = new mongoose.Schema({
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
    enum: ["All", "Specific"], // Whether the deduction applies to all or specific employees
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
    ref: "User", // Reference to the user who created the deduction
    required: true 
  }
}, { timestamps: true });

const DeductionType = mongoose.model("DeductionType", DeductionTypeSchema);
module.exports = DeductionType;

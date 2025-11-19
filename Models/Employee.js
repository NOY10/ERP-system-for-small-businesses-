const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const employeeSchema = new Schema(
  {
    employeeId: {
      type: String,
      unique: true,
      required: true, // Ensures every employee has a unique ID
    },
    name: {
      type: String,
      required: true,
      trim: true, // Removes extra spaces
    },
    profileImage: {   
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true, // Converts email to lowercase
      trim: true,
    },
    role: {
      type: String,
      required: true,
      default: "Employee", // Default role
    },
    subRole: {
      type: String,
      required: false,
    },
    dob: {
      type: Date, // Changed from String to Date
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
    },
    cid: {
      type: Number,
      required: true,
    },
    pan: {
      type: String,
      trim: true,
    },
    bankAccount: {
      accountNumber: {
        type: String,
        trim: true,
      },
      bankName: {
        type: String,
        trim: true,
      }
    },
    salary: {
      type: Number,
      required: true,
    },
    googleAuth: {
      type: Schema.Types.ObjectId,
      ref: 'GoogleAuth'
    },
    createdBy: {
      type: String,
      required: true,
    },
    advance: [
      {
        amount: { type: Number },
        date: { type: Date, default: Date.now },
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Owner",
      required: true,
    },
    resetToken: String,
    expireToken: Date,
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    collection: "employees", // Explicit collection name
  }
);

// Register the model
module.exports = mongoose.model("Employee", employeeSchema);

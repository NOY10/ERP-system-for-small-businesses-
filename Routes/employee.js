const express = require("express");
const mongoose = require("mongoose");
const Counter = require("../Models/Counter");
const Employee = mongoose.model("Employee");
const router = express.Router();

const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const RequireLogin = require("../Middleware/requireLogin");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
  // Force DNS lookup to use IPv4
  lookup: (hostname, options, callback) => {
    dns.lookup(hostname, { family: 4 }, callback);
  },
});
// Add Employee
router.post("/addEmployee", RequireLogin, async (req, res) => {
  try {
    if (req.user.role !== "Owner" && req.user.role !== "HR") {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    const {
      name,
      email,
      gender,
      role,
      subRole,
      department,
      dob,
      phone,
      cid,
      salary,
      pan,
      bankAccount
    } = req.body;
    
    if (await Employee.findOne({ email })) {
      return res.json({ message: "Email Already Exists" });
    }

    const randomPassword = crypto.randomBytes(6).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 12);

    const counter = await Counter.findByIdAndUpdate(
      "employeeId",
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const createdBy =
      req.user.role === "Owner"
        ? "Owner"
        : req.user.role === "HR"
        ? "HR"
        : "Other";

    const employee = new Employee({
      employeeId: counter.seq,
      name,
      email,
      gender,
      role,
      subRole,
      password: hashedPassword,
      phone,
      cid,
      dob,
      salary,
      createdBy,
      department,
      pan,
      bankAccount,
      owner: req.user.role === "Owner" ? req.user._id : req.user.owner,
    });
    await employee.save();

    try {
      await transporter.sendMail({
        to: employee.email,
        from: "drukbookserp@gmail.com",
        subject: "Welcome to Drukbooks - Your Account Details",
        html: `
              <h1>Welcome to Drukbooks!</h1>
              <p>Hi ${employee.name},</p>
              <p>Your account has been created successfully. Below are your login details:</p>
              <p><strong>Email:</strong> ${employee.email}</p>
              <p><strong>Password:</strong> ${randomPassword}</p>
              <p>Please change your password after logging in.</p>
              ${
                req.user.role === "Owner"
                  ? `<p><strong>Note:</strong> Please ensure that all necessary details are correctly updated.</p>`
                  : ""
              }
              <p>Regards,</p>
              <p>The Drukbooks Team</p>
          `,
      });

      if (req.user.role === "Owner") {
        const hr = await Employee.findOne({ role: "HR", owner: req.user._id });
        if (hr) {
          await transporter.sendMail({
            to: hr.email,
            from: "drukbookserp@gmail.com",
            subject: "New Employee Added - Complete Documentation",
            html: `
                  <h1>Action Required: Employee Documentation</h1>
                  <p>Dear HR,</p>
                  <p>A new employee, <strong>${employee.name}</strong>, has been added by the company owner.</p>
                  <p>Please ensure that all necessary documents and details are properly filled in the system.</p>
                  <p>Employee Details:</p>
                  <ul>
                    <li><strong>Name:</strong> ${employee.name}</li>
                    <li><strong>Email:</strong> ${employee.email}</li>
                  </ul>
                  <p>Regards,</p>
                  <p><em>Owner, Drukbooks</em></p>
              `,
          });
          console.log("Email sent successfully to HR:", hr.email);
        } else {
          console.log("No HR found for this company.");
        }
      }

      console.log("Email sent successfully to:", employee.email);
    } catch (mailError) {
      console.error("Error sending email:", mailError);
    }

    res.json({ employee });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all employees
router.get("/getallEmployees", RequireLogin, async (req, res) => {
  try {
    if (req.user.role !== "Owner" && req.user.role !== "HR" && req.user.role !== "Accounts") {
      return res.status(403).json({ error: "Unauthorized action" });
    }
    const employees = await Employee.find({
      owner: req.user.owner || req.user._id,
    });
    res.json({ employees });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get single employee
router.get("/getSingleEmployee/:employeeId", RequireLogin, async (req, res) => {
  try {
    const employee = await Employee.findOne({
      employeeId: Number(req.params.employeeId),
    });
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json({ employee });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update employee
// router.put("/updateEmployee/:employeeId", RequireLogin, async (req, res) => {
//   try {
//     if (req.user.role !== "Owner" && req.user.role !== "HR") {
//       return res.status(403).json({ error: "Unauthorized action" });
//     }
//     const updatedEmployee = await Employee.findOneAndUpdate(
//       { employeeId: Number(req.params.employeeId) },
//       { $set: req.body },
//       { new: true, runValidators: true }
//     );
//     if (!updatedEmployee)
//       return res.status(404).json({ error: "Employee not found" });
//     res.json({ message: "Employee updated successfully", updatedEmployee });
//   } catch (error) {
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
router.put("/updateEmployee/:employeeId", RequireLogin, async (req, res) => {
  try {
    // if (
    //   req.user.role !== "Owner" &&
    //   req.user.role !== "HR" &&
    //   req.user.role !== "Employee"
    // ) {
    //   return res.status(403).json({ error: "Unauthorized action" });
    // }

    // Create an update object
    let updateData = { ...req.body };

    // If subRole is an empty string, remove it from the update
    if (updateData.subRole === "") {
      updateData = { ...updateData, $unset: { subRole: "" } };
      delete updateData.subRole; // Remove subRole from $set update
    }

    const updatedEmployee = await Employee.findOneAndUpdate(
      { employeeId: Number(req.params.employeeId) },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedEmployee)
      return res.status(404).json({ error: "Employee not found" });

    res.json({ message: "Employee updated successfully", updatedEmployee });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete employee
router.delete("/deleteEmployee/:employeeId", RequireLogin, async (req, res) => {
  try {
    if (
      req.user.role !== "Owner" &&
      req.user.role !== "HR" &&
      req.user.role !== "Employee"
    ) {
      return res.status(403).json({ error: "Unauthorized action" });
    }
    const deletedEmployee = await Employee.findOneAndDelete({
      employeeId: Number(req.params.employeeId),
    });
    if (!deletedEmployee)
      return res.status(404).json({ error: "Employee not found" });
    res.json({ message: "Employee deleted successfully", deletedEmployee });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

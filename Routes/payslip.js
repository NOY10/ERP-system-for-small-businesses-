const express = require("express");
const mongoose = require("mongoose");
const Payslip = require("../Models/Payslips");
const Employee = require("../Models/Employee"); // Ensure this path is correct
const DeductionType = require("../Models/Deduction");
const AllowanceType = require("../Models/Allowance");
const RequireLogin = require("../Middleware/requireLogin");
const nodemailer = require("nodemailer");
const router = express.Router();
const dns = require("dns");

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

// Debugging: Check if Employee model is imported correctly
console.log(Employee);

// Create Payslip with auto-calculated values
router.post("/generatePayslip", RequireLogin, async (req, res) => {
  try {
    // Authorization check
    if (req.user.role !== "Owner" && req.user.role !== "HR") {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    const { employeeId, startDate, endDate, bankDetails } = req.body;

    // Check existing payslips
    const existingPayslip = await Payslip.findOne({
      employeeId,
      startDate,
      endDate,
    });

    if (existingPayslip) {
      return res
        .status(400)
        .json({ error: "Payslip already exists for this period" });
    }

    // Get employee data
    const employee = await Employee.findById(employeeId)
      .select("name salary email")
      .lean();

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Calculate allowances and deductions
    const [allowances, deductions] = await Promise.all([
      AllowanceType.find({
        $or: [
          { appliesTo: "All", excludedEmployees: { $nin: [employeeId] } },
          { appliesTo: "Specific", includedEmployees: { $in: [employeeId] } },
        ],
      }),
      DeductionType.find({
        $or: [
          { appliesTo: "All", excludedEmployees: { $nin: [employeeId] } },
          { appliesTo: "Specific", includedEmployees: { $in: [employeeId] } },
        ],
      }),
    ]);

    // Calculate net salary
    const totalAllowances = allowances.reduce(
      (sum, a) => sum + a.defaultAmount,
      0
    );
    const totalDeductions = deductions.reduce(
      (sum, d) => sum + d.defaultAmount,
      0
    );

    // Create new payslip
    const payslip = new Payslip({
      employeeId,
      name: employee.name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      basicSalary: employee.salary,
      allowances: allowances.map((a) => ({
        name: a.name,
        amount: a.defaultAmount,
      })),
      deductions: deductions.map((d) => ({
        name: d.name,
        amount: d.defaultAmount,
      })),
      bankDetails,
      email: employee.email,
    });

    await payslip.save();
    res
      .status(201)
      .json({ message: "Payslip generated successfully", payslip });
  } catch (error) {
    console.error("Payslip generation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post(
  "/send-payslip-email/:payslipId",
  RequireLogin,
  async (req, res) => {
    try {
      // Only allow authorized roles
      if (req.user.role !== "Owner" && req.user.role !== "HR") {
        return res.status(403).json({ error: "Unauthorized action" });
      }

      const { email, pdf } = req.body; // pdf is expected as a data URI string
      if (!email || !pdf) {
        return res.status(400).json({ error: "Missing email or PDF data" });
      }

      // Prepare email with PDF attachment (convert data URI to buffer)
      const base64Data = pdf.split("base64,")[1];
      const pdfBuffer = Buffer.from(base64Data, "base64");

      await transporter.sendMail({
        to: email,
        from: "drukbookserp@gmail.com",
        subject: "Your Payslip from Drukbooks",
        html: `
        <h1>Payslip Attached</h1>
        <p>Please find attached your payslip.</p>
        <p>Regards,</p>
        <p>The Drukbooks Team</p>
      `,
        attachments: [
          {
            filename: "payslip.pdf",
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });

      res.json({ message: "Payslip emailed successfully" });
    } catch (error) {
      console.error("Send payslip email error:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  }
);

// Bulk payslip generation
router.post("/generate-all-payslips", RequireLogin, async (req, res) => {
  try {
    // Authorization check
    if (req.user.role !== "Owner" && req.user.role !== "HR") {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    const { startDate, endDate } = req.body;

    // Validate input dates
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Start date and end date are required" });
    }

    // Fetch all active employees
    const employees = await Employee.find({})
      .select("_id name salary email")
      .lean();

    if (!employees.length) {
      return res.status(404).json({ error: "No employees found" });
    }

    // Fetch all allowances and deductions
    const [allowances, deductions] = await Promise.all([
      AllowanceType.find().lean(),
      DeductionType.find().lean(),
    ]);

    // Generate payslips for all employees
    const payslips = await Promise.all(
      employees.map(async (employee) => {
        // Filter applicable allowances and deductions for the employee
        const applicableAllowances = allowances.filter(
          (a) =>
            a.appliesTo === "All" ||
            (a.includedEmployees && a.includedEmployees.includes(employee._id))
        );

        const applicableDeductions = deductions.filter(
          (d) =>
            d.appliesTo === "All" ||
            (d.includedEmployees && d.includedEmployees.includes(employee._id))
        );

        // Calculate totals with a fallback of 0 if defaultAmount is undefined
        const totalAllowances = applicableAllowances.reduce(
          (sum, a) => sum + (a.defaultAmount ?? 0),
          0
        );
        const totalDeductions = applicableDeductions.reduce(
          (sum, d) => sum + (d.defaultAmount ?? 0),
          0
        );

        // Create payslip object
        return {
          employeeId: employee._id,
          name: employee.name,
          email: employee.email,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          basicSalary: employee.salary,
          allowances: applicableAllowances.map((a) => ({
            name: a.name,
            amount: a.defaultAmount ?? 0,
          })),
          deductions: applicableDeductions.map((d) => ({
            name: d.name,
            amount: d.defaultAmount ?? 0,
          })),

          status: "Pending", // Default status
        };
      })
    );

    // Insert all payslips into the database
    await Payslip.insertMany(payslips);

    res
      .status(201)
      .json({ message: "Payslips generated successfully", payslips });
  } catch (error) {
    console.error("Bulk payslip generation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get All Payslips
router.get("/payslips", RequireLogin, async (req, res) => {
  try {
    if (req.user.role !== "Owner" && req.user.role !== "HR") {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const payslips = await Payslip.find()
      .populate("employeeId", "employeeId name department email")
      .sort({ startDate: -1 });

    res.json({ payslips });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/update-payslip/:payslipId", RequireLogin, async (req, res) => {
  try {
    // Authorization check
    if (req.user.role !== "Owner" && req.user.role !== "HR") {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    const { payslipId } = req.params;
    const updates = req.body;

    // Validate payslip ID
    if (!mongoose.Types.ObjectId.isValid(payslipId)) {
      return res.status(400).json({ error: "Invalid payslip ID" });
    }

    // Fetch the existing payslip
    const existingPayslip = await Payslip.findById(payslipId);
    if (!existingPayslip) {
      return res.status(404).json({ error: "Payslip not found" });
    }

    // Validate updates
    const allowedUpdates = [
      "allowances",
      "deductions",
      "bankDetails",
      "status",
      "startDate",
      "endDate",
    ];
    const isValidUpdate = Object.keys(updates).every((key) =>
      allowedUpdates.includes(key)
    );

    if (!isValidUpdate) {
      return res.status(400).json({ error: "Invalid updates" });
    }

    // Apply updates
    Object.keys(updates).forEach((key) => {
      existingPayslip[key] = updates[key];
    });

    // Save the updated payslip
    await existingPayslip.save();

    res.json({
      message: "Payslip updated successfully",
      payslip: existingPayslip,
    });
  } catch (error) {
    console.error("Payslip update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.delete("/deletePayslip/:id", RequireLogin, async (req, res) => {
  try {
    const deletedPayslip = await Payslip.findByIdAndDelete(req.params.id);
    if (!deletedPayslip) {
      return res.status(404).json({ error: "Payslip not found" });
    }
    res.json({ message: "Payslip deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete payslip" });
  }
});
// Get Payslips by Employee
// router.get("/employee-payslips/:employeeId", RequireLogin, async (req, res) => {
//   try {
//     const payslips = await Payslip.find({
//       employeeId: req.params.employeeId,
//     }).sort({ startDate: -1 });

//     if (!payslips.length) {
//       return res.status(404).json({ error: "No payslips found" });
//     }

//     res.json({ payslips });
//   } catch (error) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

router.get("/employee-payslips/:employeeId", RequireLogin, async (req, res) => {
  // Inside the route
if (!mongoose.Types.ObjectId.isValid(req.params.employeeId)) {
  return res.status(400).json({ error: "Invalid employee ID" });
}
  console.log("Hit route /employee-payslips/:employeeId", req.params.employeeId);
  try {
    const payslips = await Payslip.find({
      employeeId: new mongoose.Types.ObjectId(req.params.employeeId),
    }).sort({ startDate: -1 });
    

    if (!payslips.length) {
      return res.status(404).json({ error: "No payslips found" });
    }

    res.json({ payslips });
  } catch (error) {
    console.error("Error fetching payslips:", error); // ✅ log actual error
    res.status(500).json({ error: "Server error" });
  }
});


// Get a single payslip by its ID
router.get("/payslip/:payslipId", RequireLogin, async (req, res) => {
  try {
    // Optional: enforce authorization for single payslip access
    if (req.user.role !== "Owner" && req.user.role !== "HR") {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const payslip = await Payslip.findById(req.params.payslipId).populate(
      "employeeId",
      "employeeId name department"
    );

    if (!payslip) {
      return res.status(404).json({ error: "Payslip not found" });
    }

    res.json({ payslip });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update Payslip by ID
router.put("/update-payslip/:payslipId", RequireLogin, async (req, res) => {
  try {
    // Authorization check
    if (req.user.role !== "Owner" && req.user.role !== "HR") {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    const { payslipId } = req.params;
    const updates = req.body;

    // Validate payslip ID
    if (!mongoose.Types.ObjectId.isValid(payslipId)) {
      return res.status(400).json({ error: "Invalid payslip ID" });
    }

    // Fetch the existing payslip
    const existingPayslip = await Payslip.findById(payslipId);
    if (!existingPayslip) {
      return res.status(404).json({ error: "Payslip not found" });
    }

    // Validate updates
    const allowedUpdates = [
      "allowances",
      "deductions",
      "bankDetails",
      "status",
      "startDate",
      "endDate",
    ];
    const isValidUpdate = Object.keys(updates).every((key) =>
      allowedUpdates.includes(key)
    );

    if (!isValidUpdate) {
      return res.status(400).json({ error: "Invalid updates" });
    }

    // Apply updates
    Object.keys(updates).forEach((key) => {
      existingPayslip[key] = updates[key];
    });

    // Save the updated payslip
    await existingPayslip.save();

    res.json({
      message: "Payslip updated successfully",
      payslip: existingPayslip,
    });
  } catch (error) {
    console.error("Payslip update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update Payslip Status
router.put("/update-status/:id", RequireLogin, async (req, res) => {
  try {
    if (req.user.role !== "Owner" && req.user.role !== "HR" && req.user.role !== "Employee") {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    const updatedPayslip = await Payslip.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!updatedPayslip) {
      return res.status(404).json({ error: "Payslip not found" });
    }

    res.json({ message: "Status updated", payslip: updatedPayslip });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ error: "Update failed" });
  }
});
// Bulk update payslip statuses for multiple employees
router.put("/update-status-bulk", RequireLogin, async (req, res) => {
  try {
    if (req.user.role !== "Owner" && req.user.role !== "HR") {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    const { payslipIds, status } = req.body;
    if (!payslipIds || !Array.isArray(payslipIds) || payslipIds.length === 0) {
      return res
        .status(400)
        .json({ error: "payslipIds must be a non-empty array" });
    }

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const result = await Payslip.updateMany(
      { _id: { $in: payslipIds } },
      { $set: { status } }
    );

    res.json({ message: "Payslip statuses updated", result });
  } catch (error) {
    console.error("Bulk update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

const express = require("express");
const mongoose = require("mongoose");
const RequireLogin = require("../Middleware/requireLogin");

const AdvanceSalary = mongoose.model("AdvanceSalary");

const Employee = mongoose.model("Employee");
const router = express.Router();
router.post("/addAdvanceSalary", RequireLogin, async (req, res) => {
  try {
    console.log("Received request body:", req.body);

    const {
      employee,
      title,
      amount,
      providedDate,
      installmentAmount,
      description,
      employeeId,
      employeeSalary,
    } = req.body;

    // Validate required fields
    const requiredFields = [
      "employee",
      "amount",
      "providedDate",
      "installmentAmount",
      "employeeId",
      "employeeSalary",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing required fields",
        missingFields,
      });
    }

    // Validate numerical fields
    if (isNaN(amount) || isNaN(installmentAmount) || isNaN(employeeSalary)) {
      return res.status(400).json({ error: "Amount fields must be numbers" });
    }

    // Validate installment amount doesn't exceed salary
    if (parseFloat(installmentAmount) > parseFloat(employeeSalary)) {
      return res.status(400).json({
        error: "Installment amount cannot exceed employee's salary",
      });
    }

    // Check if the requesting user has permission to create for this employee
    if (req.user.role !== "Owner" && req.user.role !== "HR") {
      // For non-Owner/HR users, they can only create for themselves
      if (
        employeeId !== req.user.employeeId &&
        employeeId !== req.user._id.toString()
      ) {
        return res.status(403).json({
          error: "You can only create advance salaries for yourself",
        });
      }
    }

    // Calculate total installments
    const totalInstallments = Math.ceil(amount / installmentAmount);

    const newSalary = new AdvanceSalary({
      employee,
      title,
      amount,
      providedDate,
      installmentAmount,
      totalInstallments,
      description,
      employeeId,
      employeeSalary,
      owner: req.user.role === "Owner" ? req.user._id : req.user.owner,
      status: "Pending", // Default status
    });

    await newSalary.save();

    // Populate the response with employee details
    const populatedSalary = await AdvanceSalary.findById(newSalary._id)
      .populate("employee", "name")
      .populate("owner", "name");

    res.status(201).json({
      message: "Advance Salary request submitted successfully",
      advanceSalary: populatedSalary,
    });
  } catch (error) {
    console.error("Server Error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation Error",
        details: error.message,
      });
    }

    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
});

// 📌 2️⃣ Get All Advance Salary Requests (For HR and Owner)
// router.get("/getAllAdvanceSalaries", RequireLogin, async (req, res) => {
//   try {
//     const userRole = req.user.role;
//     console.log("User Role:", req.user.role); // Add this to verify the user's role
//     // if (!["Owner", "HR","Employee"].includes(req.user.role)) {
//     //   return res.status(403).json({ error: "Unauthorized action" });
//     // }

//     // const advanceSalaries = await AdvanceSalary.find({
//     //   owner: req.user.owner || req.user.employeeId,
//     // }).populate("employee", "name");

//     const advanceSalaries = await AdvanceSalary.find({
//       owner: userRole == "Owner" ? req.user._id : req.user.owner,
//     }).populate("employee", "name");

//     res.json({ advanceSalaries });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

router.get("/getAllAdvanceSalaries", RequireLogin, async (req, res) => {
  try {
    const userRole = req.user.role;
    let query = {};

    if (userRole === "Owner" || userRole === "HR") {
      // For Owner and HR, get all advance salaries under their ownership
      query.owner = req.user._id;
    } else {
      // For other roles (Employee), only get their own advance salaries
      query.employeeId = req.user._id || req.user.employeeId;
    }

    const advanceSalaries = await AdvanceSalary.find(query)
      .populate("owner", "name")
      .populate("employee", "name");

    res.json({ advanceSalaries });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 📌 3️⃣ Get Advance Salary Requests by Employee ID
router.get("/getAdvanceSalary/:employeeId", RequireLogin, async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (
      !["Owner", "HR"].includes(req.user.role) &&
      req.user._id.toString() !== employeeId
    ) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    const advanceSalaries = await AdvanceSalary.find({
      employee: employeeId,
    }).populate("employee", "name");
    res.json({ advanceSalaries });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/updateAdvanceSalary/:id", RequireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    // if (!["Owner", "HR"].includes(userRole)) {
    //   return res.status(403).json({ error: "Unauthorized action" });
    // }

    const updatedData = req.body;

    if (!updatedData.status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const updatedAdvanceSalary = await AdvanceSalary.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedAdvanceSalary) {
      return res
        .status(404)
        .json({ error: "Advance salary request not found" });
    }

    res.json({
      message: "Advance salary request updated successfully",
      advanceSalary: updatedAdvanceSalary,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 📌 5️⃣ Delete Advance Salary Requests
router.delete("/deleteAdvanceSalary", RequireLogin, async (req, res) => {
  try {
    const userRole = req.user.role;
    // if (!["Owner", "HR"].includes(userRole)) {
    //   return res.status(403).json({ error: "Unauthorized action" });
    // }

    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid or missing IDs" });
    }

    const result = await AdvanceSalary.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ error: "No advance salary requests found to delete" });
    }

    res.json({
      message: "Advance salary requests deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

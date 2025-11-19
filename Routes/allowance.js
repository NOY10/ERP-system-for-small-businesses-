const express = require("express");
const router = express.Router();
const AllowanceType = require("../Models/Allowance");
const RequireLogin = require("../Middleware/requireLogin");
const mongoose = require("mongoose");
// Get all Allowance Types
router.get("/getAllAllowanceTypes", RequireLogin, async (req, res) => {
  try {
    if (req.user.role !== "Owner" && req.user.role !== "HR" && req.user.role !== "Employee") {
      return res.status(403).json({ error: "Unauthorized action" });
    }
    
    const allowanceTypes = await AllowanceType.find().populate("includedEmployees", "name email");
    res.json({ allowanceTypes });
  } catch (error) {
    console.error("Error fetching allowance types:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/addAllowanceType", RequireLogin, async (req, res) => {
  try {
    if (req.user.role !== "Owner" && req.user.role !== "HR") {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    let { name, description, defaultAmount, appliesTo, includedEmployees, excludedEmployees } = req.body;

    // Ensure excludedEmployees & includedEmployees are arrays and contain valid ObjectIds
    includedEmployees = Array.isArray(includedEmployees)
      ? includedEmployees.map(id => mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null).filter(id => id !== null)
      : [];

    excludedEmployees = Array.isArray(excludedEmployees)
      ? excludedEmployees.map(id => mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null).filter(id => id !== null)
      : [];

    // Validate Specific Employees case
    if (appliesTo === "Specific" && includedEmployees.length === 0) {
      return res.status(400).json({ error: "Specific employees list is required." });
    }

    const allowanceType = new AllowanceType({
      name,
      description,
      defaultAmount,
      appliesTo,
      includedEmployees: appliesTo === "Specific" ? includedEmployees : [],
      excludedEmployees: appliesTo === "All" ? excludedEmployees : [],
      createdBy: req.user._id,
    });

    await allowanceType.save();
    res.json({ message: "Allowance Type added successfully", allowanceType });

  } catch (error) {
    console.error("Error adding allowance type:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});


// Delete Allowance Type
router.delete("/deleteAllowanceType/:id", RequireLogin, async (req, res) => {
  try {
    if (req.user.role !== "Owner" && req.user.role !== "HR") {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    const deletedAllowanceType = await AllowanceType.findByIdAndDelete(req.params.id);
    if (!deletedAllowanceType) {
      return res.status(404).json({ error: "Allowance Type not found" });
    }

    res.json({ message: "Allowance Type deleted successfully", deletedAllowanceType });
  } catch (error) {
    console.error("Error deleting allowance type:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Edit Allowance Type
router.put("/editAllowanceType/:id", RequireLogin, async (req, res) => {
  try {
    if (req.user.role !== "Owner" && req.user.role !== "HR") {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    const { name, description, defaultAmount, appliesTo, includedEmployees, excludedEmployees } = req.body;
    
    const updatedAllowanceType = await AllowanceType.findByIdAndUpdate(
      req.params.id,
      { name, description, defaultAmount, appliesTo, includedEmployees: req.body.includedEmployees,
        excludedEmployees: req.body.excludedEmployees},
      { new: true }
    );

    if (!updatedAllowanceType) {
      return res.status(404).json({ error: "Allowance Type not found" });
    }

    res.json({ message: "Allowance Type updated successfully", updatedAllowanceType });
  } catch (error) {
    console.error("Error updating allowance type:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
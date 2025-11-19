const express = require("express");
const router = express.Router();
const DeductionType = require("../Models/Deduction");
const RequireLogin = require("../Middleware/requireLogin");
const mongoose = require("mongoose");

// Get all Deduction Types
router.get("/getAllDeductionTypes", RequireLogin, async (req, res) => {
  try {
    if (req.user.role !== "Owner" && req.user.role !== "HR" && req.user.role !== "Employee") {
      return res.status(403).json({ error: "Unauthorized action" });
    }
    
    const deductionTypes = await DeductionType.find().populate("includedEmployees", "name email");
    res.json({ deductionTypes });
  } catch (error) {
    console.error("Error fetching deduction types:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add Deduction Type
router.post("/addDeductionType", RequireLogin, async (req, res) => {
  try {
    if (req.user.role !== "Owner" && req.user.role !== "HR") {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    let { name, description, defaultAmount, appliesTo, includedEmployees, excludedEmployees } = req.body;

    // Validate employee IDs
    includedEmployees = Array.isArray(includedEmployees)
      ? includedEmployees.map(id => mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null).filter(id => id !== null)
      : [];

    excludedEmployees = Array.isArray(excludedEmployees)
      ? excludedEmployees.map(id => mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null).filter(id => id !== null)
      : [];

    if (appliesTo === "Specific" && includedEmployees.length === 0) {
      return res.status(400).json({ error: "Specific employees list is required." });
    }

    const deductionType = new DeductionType({
      name,
      description,
      defaultAmount,
      appliesTo,
      includedEmployees: appliesTo === "Specific" ? includedEmployees : [],
      excludedEmployees: appliesTo === "All" ? excludedEmployees : [],
      createdBy: req.user._id,
    });

    await deductionType.save();
    res.json({ message: "Deduction Type added successfully", deductionType });

  } catch (error) {
    console.error("Error adding deduction type:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// Delete Deduction Type
router.delete("/deleteDeductionType/:id", RequireLogin, async (req, res) => {
  try {
    if (req.user.role !== "Owner" && req.user.role !== "HR") {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    const deletedDeductionType = await DeductionType.findByIdAndDelete(req.params.id);
    if (!deletedDeductionType) {
      return res.status(404).json({ error: "Deduction Type not found" });
    }

    res.json({ message: "Deduction Type deleted successfully", deletedDeductionType });
  } catch (error) {
    console.error("Error deleting deduction type:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Edit Deduction Type
router.put("/editDeductionType/:id", RequireLogin, async (req, res) => {
  try {
    if (req.user.role !== "Owner" && req.user.role !== "HR") {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    const { name, description, amount, appliesTo, includedEmployees, excludedEmployees } = req.body;

    const updatedDeductionType = await DeductionType.findByIdAndUpdate(
      req.params.id,
      { name, description, amount, appliesTo, includedEmployees, excludedEmployees },
      { new: true }
    );

    if (!updatedDeductionType) {
      return res.status(404).json({ error: "Deduction Type not found" });
    }

    res.json({ message: "Deduction Type updated successfully", updatedDeductionType });
  } catch (error) {
    console.error("Error updating deduction type:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

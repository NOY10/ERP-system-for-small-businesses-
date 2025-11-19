const express = require("express");
const mongoose = require("mongoose");
const CompanyInfo = mongoose.model("CompanyInfo");
const Employee = mongoose.model("Employee");
const RequireLogin = require("../Middleware/requireLogin");

const router = express.Router();

// POST: Add Company Info
router.post("/addCompanyInfo", RequireLogin, async (req, res) => {
  const userRole = req.user.role;

  try {
    if (userRole !== "Owner") {
      return res
        .status(403)
        .json({ error: "Only owners can add company info" });
    }

    // Validate required fields
    if (!req.body.name) {
      return res.status(400).json({ error: "Company name is required" });
    }

    // Create company info with validated data
    const companyInfo = new CompanyInfo({
      name: req.body.name.trim(),
      established: req.body.established || undefined,
      regNo: req.body.regNo || undefined,
      logo: req.body.logo, // Use cleaned logo value
      address: req.body.address || undefined,
      dzongkhag: req.body.dzongkhag || undefined,
      phone: req.body.phone || undefined,
      email: req.body.email || undefined,
      website: req.body.website || undefined,
      fiscalYear: req.body.fiscalYear || undefined,
      owner: req.user._id,
    });

    // Debug: Log what will be saved
    console.log("Saving company info:", companyInfo);

    const savedInfo = await companyInfo.save();
    res.status(201).json({
      success: true,
      companyInfo: savedInfo,
    });
  } catch (error) {
    console.error("Error adding company info:", error);

    // Handle specific Mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
    }

    // Handle other errors
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
});

// GET: View Company Info for logged-in owner
router.get("/viewCompanyInfo", RequireLogin, async (req, res) => {
  try {
    const companyInfo = await CompanyInfo.findOne({ owner: req.user._id });

    if (!companyInfo) {
      return res.status(404).json({ error: "Company info not found" });
    }

    res.json({ companyInfo });
  } catch (error) {
    console.error("Error fetching company info:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/employee/viewCompanyInfo", RequireLogin, async (req, res) => {
  try {
    // First find the employee to get their owner reference
    const employee = await Employee.findOne(
      { _id: req.user._id },
      { owner: 1 }
    ).populate("owner"); // Populate if you need owner details

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    if (!employee.owner) {
      return res
        .status(404)
        .json({ error: "Owner reference not found for employee" });
    }

    // Find the company info using the owner reference
    const companyInfo = await CompanyInfo.findOne(
      { owner: employee.owner },
      {
        name: 1,
        logo: 1,
        email: 1,
        bankName: 1,
        accountNo: 1,
        address: 1,
        phone: 1,
        _id: 0,
      } // Only return these fields
    );

    if (!companyInfo) {
      return res
        .status(404)
        .json({ error: "Company info not found for this owner" });
    }

    res.json({ companyInfo });
  } catch (error) {
    console.error("Error fetching company info:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT: Edit Company Info
router.put("/editCompanyInfo", RequireLogin, async (req, res) => {
  try {
    const updates = req.body;

    const companyInfo = await CompanyInfo.findOneAndUpdate(
      { owner: req.user._id },
      updates,
      { new: true }
    );

    if (!companyInfo) {
      return res.status(404).json({ error: "Company info not found" });
    }

    res.json({ message: "Company info updated", companyInfo });
  } catch (error) {
    console.error("Error updating company info:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

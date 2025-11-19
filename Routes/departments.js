const express = require("express");
const mongoose = require("mongoose");
const RequireLogin = require("../Middleware/requireLogin");

const Departments = mongoose.model("Departments");

const router = express.Router();

// Create a new role
router.post("/addDept", RequireLogin, async (req, res) => {
  const { deptName } = req.body;
  const userRole = req.user.role;

  if (userRole === "Owner" || userRole === "HR") {
    try {
      const existingDept = await Departments.findOne({ deptName });
      if (existingDept) {
        return res.status(400).json({ error: "Dept already exists" });
      }
      const createdBy = req.user.role === "Owner" ? "Owner" : "HR";

      const newdeptName = new Departments({
        deptName,
        createdBy,
        owner: userRole == "Owner" ? req.user._id : req.user.owner,
      });

      await newdeptName.save();
      res.json({ newdeptName });
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Error adding Dept" });
    }
  } else {
    res.status(403).json({ error: "Unauthorized action" });
  }
});

// Get all Departments
router.get("/getAllDepartments", RequireLogin, async (req, res) => {
  try {
    if (req.user.role !== "Owner" && req.user.role !== "HR") {
      return res.status(403).json({ error: "Unauthorized action" });
    }
    const departments = await Departments.find({
      owner: req.user.owner || req.user._id,
    });
    res.json({ departments });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a Departments
router.delete("/deleteDept/:id", RequireLogin, async (req, res) => {
  try {
    if (req.user.role !== "Owner" && req.user.role !== "HR") {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    const dept = await Departments.findByIdAndDelete(req.params.id);
    if (!dept) {
      return res.status(404).json({ error: "Dept not found" });
    }

    res.json({ message: "Dept deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/updateDept/:id", RequireLogin, async (req, res) => {
  const { deptName } = req.body;

  try {
    if (req.user.role !== "Owner" && req.user.role !== "HR") {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    const existingDept = await Departments.findOne({ deptName });
    if (existingDept) {
      return res.status(400).json({ error: "Dept already exists" });
    }

    const updatedDept = await Departments.findByIdAndUpdate(
      req.params.id,
      { deptName },
      { new: true, runValidators: true }
    );

    if (!updatedDept) {
      return res.status(404).json({ error: "Dept not found" });
    }

    res.json({ message: "Dept updated successfully", updatedDept });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

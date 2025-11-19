const express = require("express");
const mongoose = require("mongoose");
const LeaveType = mongoose.model("LeaveType");
const router = express.Router();
const RequireLogin = require("../Middleware/requireLogin");

// Create a new leave type
router.post("/addLeaveType", RequireLogin, async (req, res) => {
  const userRole = req.user.role;

  try {
    if (userRole === "Owner" || userRole === "HR") {
      const { leaveType, payment, days } = req.body;

      // Validate input data
      if (!leaveType || !days) {
        return res
          .status(400)
          .json({ error: "Leave Type and Days are required" });
      }

      // Create a new LeaveType object
      const newLeaveType = new LeaveType({
        leaveType,
        payment,
        days,
        owner: userRole === "Owner" ? req.user._id : req.user.owner,
      });

      // Save to the database
      await newLeaveType.save();

      // Return the saved leaveType data in the response
      res.json({ leaveType: newLeaveType });
    } else {
      res.status(403).json({ error: "Unauthorized action" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all leave types
router.get("/getAllLeaveTypes", RequireLogin, (req, res) => {
  const userRole = req.user.role;

  if (userRole === "Owner" || userRole === "HR" || userRole === "Employee") {
    LeaveType.find({
      owner: userRole === "Owner" ? req.user._id : req.user.owner,
    })
      .then((leaveTypes) => {
        res.json({ leaveTypes });
      })
      .catch((err) => {
        res.status(500).json({ error: "Failed to fetch leave types" });
      });
  } else {
    res.status(403).json({ error: "Unauthorized action" });
  }
});

// Delete leave types (supports bulk deletion)
router.delete("/deleteLeaveType", RequireLogin, (req, res) => {
  const userRole = req.user.role;

  if (userRole === "Owner" || userRole === "HR") {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid or missing IDs" });
    }

    LeaveType.deleteMany({ _id: { $in: ids } })
      .then((result) => {
        if (result.deletedCount === 0) {
          return res
            .status(404)
            .json({ error: "No leave types found to delete" });
        }
        res.json({
          message: "Leave types deleted successfully",
          deletedCount: result.deletedCount,
        });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: "Failed to delete leave types" });
      });
  } else {
    res.status(403).json({ error: "Unauthorized action" });
  }
});

// Update leave type
router.put("/updateLeaveType/:id", RequireLogin, async (req, res) => {
  const { leaveType, payment, days } = req.body; // Fix casing for leaveType
  const userRole = req.user.role;

  if (userRole === "Owner" || userRole === "HR") {
    try {
      const updatedLeaveType = await LeaveType.findByIdAndUpdate(
        req.params.id,
        { leaveType, payment, days }, // No need for `$set`
        { new: true }
      );

      if (!updatedLeaveType) {
        return res.status(404).json({ error: "Leave type not found" });
      }

      res.json({ leaveType: updatedLeaveType });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error updating leave type");
    }
  } else {
    res.status(403).send("You do not have permission to update leave types");
  }
});

// Search leave types by name
router.post("/search-leaveType", RequireLogin, (req, res) => {
  let searchQuery = new RegExp("^" + req.body.query, "i");
  const userRole = req.user.role;
  const ownerId = userRole === "Owner" ? req.user._id : req.user.owner;

  if (userRole === "Owner" || userRole === "HR") {
    LeaveType.find({
      name: { $regex: searchQuery },
      owner: ownerId,
    })
      .then((leaveTypes) => {
        res.json({ leaveTypes });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: "Error searching leave types" });
      });
  } else {
    res.status(403).json({ error: "Unauthorized action" });
  }
});

module.exports = router;

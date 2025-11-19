const express = require("express");
const mongoose = require("mongoose");

const Leave = mongoose.model("Leave");
const Employee = mongoose.model("Employee");
const RequireLogin = require("../Middleware/requireLogin");
const e = require("express");
const router = express.Router();

router.post("/addLeave", RequireLogin, async (req, res) => {
  const userRole = req.user.role;

  if (userRole === "Owner" || userRole === "HR" || userRole === "Employee") {
    try {
      const { leaveType, startDate, endDate, days, reason } = req.body;

      const employee = await Employee.findById(req.user._id);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      console.log("Employee", employee.owner);

      const newLeave = new Leave({
        leaveType,
        startDate,
        endDate,
        days,
        reason,
        owner: employee.owner,
        employee: req.user._id,
      });

      await newLeave.save();
      res.json({
        message: "Leave request added successfully",
        leave: newLeave,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(403).json({ error: "Unauthorized action" });
  }
});


router.get("/getAllLeaves", RequireLogin, async (req, res) => {
  try {
    const userRole = req.user.role;
    const ownerId = req.user.owner || req.user._id;

    let query = { owner: ownerId };

    if (userRole === "Owner") {
      // Owner sees all leaves
    } else if (userRole === "HR") {
      // HR sees:
      // - All leaves submitted by employees under the same owner
      // - Their own leaves with status not "Pending"

      const employees = await Employee.find({ role: "Employee", owner: ownerId }).select("_id");

      query.$or = [
        { employee: { $in: employees.map(emp => emp._id) } },
        { employee: req.user._id, status: { $ne: "Pending" } },
      ];
    } else if (userRole === "Employee") {
      // Employee sees only their own leaves
      query.employee = req.user._id;
    } else {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    const leaves = await Leave.find(query).populate("employee", "name role");

    return res.json({ leaves });
  } catch (error) {
    console.error("Error fetching leaves:", error.message);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});



// 📌 2️⃣ Get a Specific Leave by ID
router.get("/getLeaves/:employeeId", RequireLogin, async (req, res) => {
  try {
    const userRole = req.user.role;
    const employeeId = req.params.employeeId; // Extract employee ID from params

    if (
      userRole === "Owner" ||
      userRole === "HR" ||
      req.user._id.toString() === employeeId
    ) {
      // Fetch all leave records for the given employee ID
      const leaves = await Leave.find({ employee: employeeId }).populate(
        "employee",
        "name"
      );

      if (!leaves || leaves.length === 0) {
        return res
          .status(404)
          .json({ error: "No leave records found for this employee" });
      }

      return res.json({ leaves });
    } else {
      return res.status(403).json({ error: "Unauthorized action" });
    }
  } catch (error) {
    console.error("Error fetching leaves:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/updateLeave/:id", RequireLogin, (req, res) => {
  const userRole = req.user.role;

  if (userRole === "Owner" || userRole === "HR" || userRole === "Employee") {
    const { leaveType, startDate, endDate, days, reason, status } = req.body;
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid Leave ID" });
    }

    Leave.findByIdAndUpdate(
      req.params.id,
      { $set: { leaveType, startDate, endDate, days, reason, status } },
      { new: true }
    )
      .then((updatedLeave) => {
        if (!updatedLeave) {
          console.error("Leave not found for ID:", req.params.id);
          return res.status(404).json({ error: "Leave not found" });
        }
        console.log("Updated Leave:", updatedLeave);
        res.json({
          message: "Leave updated successfully",
          leave: updatedLeave,
        });
      })
      .catch((err) => {
        console.error("Error in update:", err);
        res.status(500).json({ error: "Failed to update leave", details: err });
      });
  } else {
    res.status(403).json({ error: "Unauthorized action" });
  }
});

router.delete("/deleteLeave", RequireLogin, (req, res) => {
  const userRole = req.user.role;

  if (userRole === "Owner" || userRole === "HR" || userRole === "Employee") {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid or missing IDs" });
    }

    if (ids.length === 1) {
      Leave.findByIdAndDelete(ids[0])
        .then((result) => {
          if (!result) {
            return res.status(404).json({ error: "Leave not found" });
          }
          res.json({ message: "Leave deleted successfully" });
        })
        .catch((err) => {
          res
            .status(500)
            .json({ error: "Failed to delete leave", details: err });
        });
    } else {
      Leave.deleteMany({ _id: { $in: ids } })
        .then((result) => {
          if (result.deletedCount === 0) {
            return res.status(404).json({ error: "No leaves found to delete" });
          }
          res.json({
            message: "Leaves deleted successfully",
            deletedCount: result.deletedCount,
          });
        })
        .catch((err) => {
          console.error("Error deleting leaves:", err);
          res
            .status(500)
            .json({ error: "Failed to delete leaves", details: err });
        });
    }
  } else {
    res.status(403).json({ error: "Unauthorized action" });
  }
});

module.exports = router;

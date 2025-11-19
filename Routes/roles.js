const express = require("express");
const mongoose = require("mongoose");
const RequireLogin = require("../Middleware/requireLogin");

const Roles = mongoose.model("Roles");

const router = express.Router();

// Create a new role
router.post("/addRole", RequireLogin, async (req, res) => {
  const { name } = req.body;
  const userRole = req.user.role;

  if (userRole === "Owner" || userRole === "HR") {
    try {
      const existingRole = await Roles.findOne({ name });
      if (existingRole) {
        return res.status(400).json({ error: "Role already exists" });
      }

      const createdBy = req.user.role === "Owner" ? "Owner" : "HR";

      const newRole = new Roles({
        name,
        createdBy,
        owner: userRole == "Owner" ? req.user._id : req.user.owner,
      });

      await newRole.save();
      res.json({ newRole });
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Error adding Role" });
    }
  } else {
    res.status(403).json({ error: "Unauthorized action" });
  }
});

// Get all roles
router.get("/getAllRoles", RequireLogin, async (req, res) => {
  //   try {
  //     const roles = await Roles.find().populate("owner", "name");
  //     res.json(roles);
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ error: "Internal Server Error" });
  //   }
  try {
    if (req.user.role !== "Owner" && req.user.role !== "HR") {
      return res.status(403).json({ error: "Unauthorized action" });
    }
    const roles = await Roles.find({
      owner: req.user.owner || req.user._id,
    });
    res.json({ roles });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a role
router.delete("/deleteRole/:id", RequireLogin, async (req, res) => {
  try {
    if (req.user.role !== "Owner" && req.user.role !== "HR") {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    const role = await Roles.findByIdAndDelete(req.params.id);
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/updateRole/:id", RequireLogin, async (req, res) => {
  const { name } = req.body;

  try {
    if (req.user.role !== "Owner" && req.user.role !== "HR") {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    const existingRole = await Roles.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ error: "Role already exists" });
    }

    const updatedRole = await Roles.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedRole) {
      return res.status(404).json({ error: "Role not found" });
    }

    res.json({ message: "Role updated successfully", updatedRole });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

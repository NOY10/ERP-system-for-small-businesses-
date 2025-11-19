const express = require("express");
const mongoose = require("mongoose");
const Owner = mongoose.model("Owner");
const router = express.Router();

const RequireLogin = require("../Middleware/requireLogin");

// Get single owner by ID
router.get("/getOwner/:ownerId", RequireLogin, async (req, res) => {
    try {
      const owner = await Owner.findById(req.params.ownerId);
      if (!owner) return res.status(404).json({ error: "Owner not found" });
      res.json({ owner });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  // Update owner details
  router.put("/updateOwner/:ownerId", RequireLogin, async (req, res) => {
    try {
      const updatedOwner = await Owner.findByIdAndUpdate(
        req.params.ownerId,
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!updatedOwner) return res.status(404).json({ error: "Owner not found" });
      res.json({ message: "Owner updated successfully", updatedOwner });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.delete("/deleteOwner/:ownerId", RequireLogin, async (req, res) => {
    try {
        const deletedOwner = await Owner.findByIdAndDelete(req.params.ownerId);
        if (!deletedOwner) return res.status(404).json({ error: "Owner not found" });
        res.json({ message: "Owner account deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});


module.exports = router;
const express = require("express");
const mongoose = require("mongoose");
const Account = mongoose.model("Account");
const RequireLogin = require("../Middleware/requireLogin");

const router = express.Router();

// Add Account
router.post("/addAccount", RequireLogin, async (req, res) => {
  const { code, name, type, taxRate } = req.body;
  const userRole = req.user.role;

  if (userRole === "Owner" || userRole === "Accounts") {
    try {
      // Validate and cast inputs
      if (!code || isNaN(code)) {
        return res
          .status(400)
          .json({ error: "Invalid code value. Must be a number." });
      }
      if (!taxRate || isNaN(taxRate)) {
        return res
          .status(400)
          .json({ error: "Invalid tax rate. Must be a number." });
      }

      const account = new Account({
        code: Number(code),
        name,
        type,
        taxRate: Number(taxRate),
        // ytd: Number(ytd),
        owner: userRole == "Owner" ? req.user._id : req.user.owner,
      });

      await account.save();
      res.json({ account });
    } catch (err) {
      console.error(err);
      res
        .status(400)
        .json({ error: "Error adding account. Code must be unique." });
    }
  } else {
    res.status(403).json({ error: "Unauthorized action" });
  }
});

// Get All Accounts
router.get("/getAllAccounts", RequireLogin, async (req, res) => {
  const userRole = req.user.role;

  if (userRole == "Owner" || userRole == "Accounts") {
    Account.find({
      owner: userRole == "Owner" ? req.user._id : req.user.owner,
    })
      .then((accounts) => {
        res.json({ accounts });
      })
      .catch((err) => {
        res.json({ Error: err });
      });
  }
});
// Get Accounts by Type
router.get("/getAccountsByType", RequireLogin, async (req, res) => {
  const userRole = req.user.role;
  const accountType = req.query.type; // Accept type as a query parameter

  if (userRole === "Owner" || userRole === "Accounts") {
    try {
      const accounts = await Account.find({
        owner: req.user._id,
        type: accountType,
      });
      res.json({ accounts });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch accounts" });
    }
  } else {
    res.status(403).json({ error: "Unauthorized action" });
  }
});

router.delete("/deleteAccount", RequireLogin, async (req, res) => {
  const userRole = req.user.role;

  if (userRole === "Owner" || userRole === "Accounts") {
    const { ids } = req.body; // Expecting an array of IDs in the request body
    const id = req.params.id; // Optionally allow a single ID in the route parameter

    try {
      if (id) {
        // Single account deletion
        const result = await Account.findByIdAndDelete(id);
        if (!result) {
          return res.status(404).json({ error: "Account not found" });
        }
        return res.json({ message: "Account deleted successfully", result });
      } else if (ids && Array.isArray(ids) && ids.length > 0) {
        // Multiple account deletion
        const result = await Account.deleteMany({ _id: { $in: ids } });
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "No accounts found to delete" });
        }
        return res.json({
          message: "Accounts deleted successfully",
          deletedCount: result.deletedCount,
        });
      } else {
        return res.status(400).json({ error: "Invalid or missing IDs" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete account(s)" });
    }
  } else {
    res.status(403).json({ error: "Unauthorized action" });
  }
});

// Update Account
// Update Account using ID from request body
router.put("/updateAccount", RequireLogin, async (req, res) => {
  const { id, code, name, type, taxRate } = req.body;
  const userRole = req.user.role;

  // Check if the user has permission to update an account
  if (userRole === "Owner" || userRole === "Accounts") {
    try {
      const updatedAccount = await Account.findByIdAndUpdate(
        id,
        {
          $set: {
            code,
            name,
            type,
            taxRate,
            // ytd,
          },
        },
        { new: true }
      );

      if (updatedAccount) {
        res.json({ account: updatedAccount });
      } else {
        res.status(404).json({ error: "Account not found" });
      }
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Error updating account", details: err.message });
    }
  } else {
    res
      .status(403)
      .json({ error: "You do not have permission to update accounts" });
  }
});

// Update Account using ID from URL parameter
router.put("/updateAccount/:id", RequireLogin, async (req, res) => {
  const { code, name, type, taxRate } = req.body;
  const { id } = req.params;
  const userRole = req.user.role;

  // Check if the user has permission to update an account
  if (userRole === "Owner" || userRole === "Accounts") {
    try {
      const updatedAccount = await Account.findByIdAndUpdate(
        id,
        {
          $set: {
            code,
            name,
            type,
            taxRate,
          },
        },
        { new: true }
      );

      if (updatedAccount) {
        res.json({ account: updatedAccount });
      } else {
        res.status(404).json({ error: "Account not found" });
      }
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Error updating an account", details: err.message });
    }
  } else {
    res
      .status(403)
      .json({ error: "You do not have permission to update accounts" });
  }
});

// Search Account
router.post("/searchAccount", RequireLogin, async (req, res) => {
  const searchQuery = new RegExp("^" + req.body.query, "i");
  const userRole = req.user.role;

  if (userRole === "Owner" || userRole === "Accounts") {
    try {
      const accounts = await Account.find({
        $and: [
          { $or: [{ code: searchQuery }, { name: searchQuery }] },
          { owner: req.user._id },
        ],
      });
      res.json({ accounts });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error searching accounts" });
    }
  } else {
    res.status(403).json({ error: "Unauthorized action" });
  }
});

module.exports = router;

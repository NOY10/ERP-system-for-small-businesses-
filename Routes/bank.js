const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Bank = mongoose.model("Bank");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const RequireLogin = require("../Middleware/requireLogin");
const RequireLoginEmployee = require("../Middleware/requireLoginEmployee");
const multer = require("multer");

router.post("/addBankDetails", RequireLogin, async (req, res) => {
  const { accountname, accountnumber, startdate, enddate } = req.body;

  const userRole = req.user.role;

  if (userRole === "Owner" || userRole === "Accounts") {
    if (!accountname || !accountnumber) {
      return res.status(422).json({ error: "All fields are required" });
    }

    try {
      // Use conditional logic to define the owner
      const ownerId = userRole === "Owner" ? req.user._id : req.user.owner;

      const existingAccount = await Bank.findOne({
        accountnumber,
        owner: ownerId,
      });
      if (existingAccount) {
        return res
          .status(422)
          .json({ error: "Account number already exists for this user" });
      }

      const bank = new Bank({
        accountname,
        accountnumber,
        startdate,
        enddate,
        owner: ownerId,
      });

      await bank.save();
      res.json({ message: "Bank details added successfully", bank });
    } catch (error) {
      console.error("Error adding bank details:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(403).json({ error: "Unauthorized" });
  }
});

// Route to retrieve bank details
// router.get("/getBankDetails", RequireLogin, async (req, res) => {
//   try {
//     let filter = {};

//     // Allow both Owner and Accounts to retrieve data based on ownership
//     const userRole = req.user.role;
//     if (userRole === "Owner") {
//       filter.owner = req.user._id;
//     } else if (userRole === "Accounts") {
//       filter.owner = req.user.owner;
//     } else {
//       return res.status(403).json({ error: "Unauthorized" });
//     }

//     // Optionally filter by query parameters if provided (e.g., accountname, accountnumber)
//     if (req.query.accountname) {
//       filter.accountname = new RegExp(req.query.accountname, "i"); // Case-insensitive match
//     }

//     if (req.query.accountnumber) {
//       filter.accountnumber = req.query.accountnumber;
//     }

//     const bankDetails = await Bank.find(filter).populate("owner", "name email");

//     res.json({ bankDetails });
//   } catch (error) {
//     console.error("Error retrieving bank details:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

router.get("/getBankDetails", RequireLogin, async (req, res) => {
  try {
    let filter = {};

    // Retrieve user role from the authenticated user
    const userRole = req.user.role;
    if (userRole === "Owner") {
      filter.owner = req.user._id;
    } else if (userRole === "Accounts") {
      filter.owner = req.user.owner;
    } else {
      return res.status(401).json({ error: "Unauthorized" }); // Return 403 if role is not Owner or Accounts
    }

    // Filter based on query parameters if provided
    if (req.query.accountname) {
      filter.accountname = new RegExp(req.query.accountname, "i"); // Case-insensitive match
    }

    if (req.query.accountnumber) {
      filter.accountnumber = req.query.accountnumber;
    }

    const bankDetails = await Bank.find(filter).populate("owner", "name email");

    res.json({ bankDetails });
  } catch (error) {
    console.error("Error retrieving bank details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;

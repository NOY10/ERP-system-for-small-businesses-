const express = require("express");
const mongoose = require("mongoose");

const Income = mongoose.model("Income");
// const Materials= mongoose.model('Materials')
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const RequireLogin = require("../Middleware/requireLogin");
const RequireLoginEmployee = require("../Middleware/requireLoginEmployee");
const multer = require("multer");

router.post("/addIncome", RequireLogin, async (req, res) => {
  console.log(req.user);

  const userRole = req.user.role;
  try {
    if (userRole == "Owner" || userRole == "Accounts") {
      const { header, subheader, amount, description, date } = req.body;
       // ✅ Validation check for required fields
       if (!header || !subheader || !amount || !date) {
        return res.status(400).json({ error: "header, sudbheader, amount, and date are required fields" });
      }

      const income = new Income({
        header,
        subheader,
        amount,
        description,
        date,
        owner: userRole == "Owner" ? req.user._id : req.user.owner,
      });

      await income.save();
      // .then(income=>{
      console.log("income", income);
      res.json({ income });
    } else {
      res.json({ Error: "Error Adding" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/getallIncomes", RequireLogin, (req, res) => {
  const userRole = req.user.role;

  if (userRole == "Owner" || userRole == "Accounts") {
    Income.find({ owner: userRole == "Owner" ? req.user._id : req.user.owner })
      .then((incomes) => {
        res.json({ incomes });
      })
      .catch((err) => {
        res.json({ Error: err });
      });
  }
});

router.delete("/deleteIncome", RequireLogin, (req, res) => {
  const userRole = req.user.role;

  // Check if the user has permission to delete expenses
  if (userRole === "Owner" || userRole === "Accounts") {
    const { ids } = req.body; // Expecting an array of IDs in the request body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid or missing IDs" });
    }

    // Use Mongoose to delete multiple documents
    Income.deleteMany({ _id: { $in: ids } })
      .then((result) => {
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "No Inocmess found to delete" });
        }
        res.json({
          message: "Incomes deleted successfully",
          deletedCount: result.deletedCount,
        });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: "Failed to delete Incomes" });
      });
  } else {
    res.status(403).json({ error: "Unauthorized action" });
  }
});

router.put("/updateIncome/:id", RequireLogin, (req, res) => {
  const { header, subheader, amount, description, date } = req.body;
  const userRole = req.user.role;

  // Check if the user has permission to update an expense
  if (userRole === "Owner" || userRole === "Accounts") {
    // Use the ID from the URL parameter to find the expense
    Income.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          header,
          subheader,
          amount,
          description,
          date,
        },
      },
      { new: true }
    )
      .then((expense) => {
        res.json({ expense });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error updating expense");
      });
  } else {
    res.status(403).send("You do not have permission to update expenses");
  }
});

router.get("/incomeSummary", RequireLogin, async (req, res) => {
  const userRole = req.user.role;
  const ownerId = userRole === "Owner" ? req.user._id : req.user.owner;

  if (userRole === "Owner" || userRole === "Accounts") {
    try {
      const currentDate = new Date();
      const next30Days = new Date();
      next30Days.setDate(currentDate.getDate() + 30);

      const totalOutstanding = await Income.aggregate([
        { $match: { owner: ownerId } },
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
      ]);

      const dueToday = await Income.aggregate([
        {
          $match: {
            owner: ownerId,
            date: currentDate.toISOString().split("T")[0],
          },
        },
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
      ]);

      const dueWithin30Days = await Income.aggregate([
        {
          $match: {
            owner: ownerId,
            date: {
              $gte: currentDate.toISOString().split("T")[0],
              $lte: next30Days.toISOString().split("T")[0],
            },
          },
        },
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
      ]);

      res.json({
        totalOutstanding: totalOutstanding[0]?.totalAmount || 0,
        dueToday: dueToday[0]?.totalAmount || 0,
        dueWithin30Days: dueWithin30Days[0]?.totalAmount || 0,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch Income summary" });
    }
  } else {
    res.status(403).json({ error: "Unauthorized action" });
  }
});

router.post("/search-income", RequireLogin, (req, res) => {
  let searchStock = new RegExp("^" + req.body.query);

  const userRole = req.user.role;
  const id = userRole == "Owner" ? req.user._id : req.user.owner;

  // Check if the user has permission to delete an employee
  if (userRole === "Owner" || userRole === "Accounts") {
    Income.find({
      $and: [
        {
          $or: [
            { header: { $regex: searchStock, $options: "i" } },
            { subheader: { $regex: searchStock, $options: "i" } },
          ],
        },

        { owner: id },
      ],
    })
      .then((income) => {
        res.json({ income });
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

module.exports = router;

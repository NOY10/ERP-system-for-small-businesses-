const express = require("express");
const mongoose = require("mongoose");

const Journal = mongoose.model("Journal");

const Expense = mongoose.model("Expense");
const Income = mongoose.model("Income");

const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const RequireLogin = require("../Middleware/requireLogin");
const multer = require("multer");

router.post("/addJournal", RequireLogin, async (req, res) => {
  console.log(req.user);

  const userRole = req.user.role;
  const { narration, date, incomes, expenses, creditTotal, debitTotal } =
    req.body; // Accept incomes and expenses in the request body

  try {
    if (userRole == "Owner" || userRole == "Accounts") {
      // Create a new Journal entry
      const journal = new Journal({
        narration,
        date,
        creditTotal,
        debitTotal,
        owner: userRole == "Owner" ? req.user._id : req.user.owner,
      });

      // Save the journal
      await journal.save();

      // After saving the journal, we have the journal._id that can be associated with income and expense records

      // Add incomes if any are provided
      if (incomes && incomes.length > 0) {
        const bulkIncomes = incomes.map((income) => ({
          ...income,
          journalID: journal._id,
          date,
          owner: userRole == "Owner" ? req.user._id : req.user.owner,
        }));

        await Income.insertMany(bulkIncomes);
      }

      // Add expenses if any are provided
      if (expenses && expenses.length > 0) {
        const bulkExpenses = expenses.map((expense) => ({
          ...expense,
          date,
          journalID: journal._id,
          owner: userRole == "Owner" ? req.user._id : req.user.owner,
        }));

        await Expense.insertMany(bulkExpenses);
      }

      // Respond with success
      res.json({
        journalID: journal._id,
        message: "Journal, Income, and Expense records created successfully",
      });
    } else {
      res.json({ Error: "Error Adding" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/getAllJournals", RequireLogin, async (req, res) => {
  try {
    const userRole = req.user.role;

    // Ensure only authorized roles can access this route
    if (userRole === "Owner" || userRole === "Accounts") {
      // Fetch journals based on ownership
      const journals = await Journal.find({
        owner: userRole === "Owner" ? req.user._id : req.user.owner,
      });

      res.status(200).json({
        data: journals,
      });
    } else {
      res.status(403).json({
        success: false,
        message:
          "Access denied. You do not have permission to view this resource.",
      });
    }
  } catch (error) {
    console.error("Error fetching journals:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching journals.",
    });
  }
});

router.post("/getByJournalID", RequireLogin, async (req, res) => {
  const userRole = req.user.role;
  const { journalID } = req.body; // Get the journalID from the request body

  try {
    if (userRole === "Owner" || userRole === "Accounts") {
      // Validate journalID format
      if (!mongoose.Types.ObjectId.isValid(journalID)) {
        return res.status(400).json({ error: "Invalid journalID format" });
      }

      // Fetch data from the Journal collection to get narration
      const journal = await Journal.findById(journalID);

      if (!journal) {
        return res.status(404).json({ error: "Journal not found" });
      }

      // Fetch data from the Income collection
      const incomes = await Income.find({ journalID });

      // Fetch data from the Expense collection
      const expenses = await Expense.find({ journalID });

      // Process data into separate arrays
      const incomeData = incomes.map((income) => ({
        _id: income._id,
        header: income.header,
        subheader: income.subheader,
        taxRate: income.taxRate,
        amount: income.amount,
        description: income.description,
        owner: income.owner,
        journalID: income.journalID,
      }));

      const expenseData = expenses.map((expense) => ({
        _id: expense._id,
        header: expense.header,
        subheader: expense.subheader,
        taxRate: expense.taxRate,
        amount: expense.amount,
        description: expense.description,
        owner: expense.owner,
        journalID: expense.journalID,
      }));

      // Respond with the combined data
      res.json({
        journalID,
        narration: journal.narration,
        date: journal.date,
        income: incomeData, // Separate income array
        expense: expenseData, // Separate expense array
        debitTotal: journal.debitTotal,
        creditTotal: journal.creditTotal,
      });
    } else {
      res.status(403).json({ error: "Permission Denied" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.put("/editJournal", RequireLogin, async (req, res) => {
  const userRole = req.user.role;
  const {
    journalID,
    narration,
    date,
    incomes,
    expenses,
    debitTotal,
    creditTotal,
  } = req.body; // Accept updated data in the request body

  try {
    if (userRole === "Owner" || userRole === "Accounts") {
      // Validate journalID format
      if (!mongoose.Types.ObjectId.isValid(journalID)) {
        return res.status(400).json({ error: "Invalid journalID format" });
      }

      // Fetch the journal to ensure it exists
      const journal = await Journal.findById(journalID);

      if (!journal) {
        return res.status(404).json({ error: "Journal not found" });
      }

      // Update journal details
      journal.narration = narration || journal.narration;
      journal.date = date || journal.date;
      journal.creditTotal = creditTotal || journal.creditTotal;
      journal.debitTotal = debitTotal || journal.debitTotal;

      // Save the updated journal
      await journal.save();

      // Update or replace income records
      if (incomes && incomes.length > 0) {
        // Remove existing incomes associated with the journalID
        await Income.deleteMany({ journalID });

        // Insert updated incomes
        const bulkIncomes = incomes.map((income) => ({
          ...income,
          journalID,
          owner: userRole === "Owner" ? req.user._id : req.user.owner,
          date,
        }));
        await Income.insertMany(bulkIncomes);
      }

      // Update or replace expense records
      if (expenses && expenses.length > 0) {
        // Remove existing expenses associated with the journalID
        await Expense.deleteMany({ journalID });

        // Insert updated expenses
        const bulkExpenses = expenses.map((expense) => ({
          ...expense,
          journalID,
          owner: userRole === "Owner" ? req.user._id : req.user.owner,
          date,
        }));
        await Expense.insertMany(bulkExpenses);
      }

      // Respond with success
      res.json({
        message: "Journal, Income, and Expense records updated successfully",
      });
    } else {
      res.status(403).json({ error: "Permission Denied" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.delete("/deleteJournals", RequireLogin, async (req, res) => {
  const userRole = req.user.role; // Retrieve the user's role
  const { journalIDs } = req.body; // Expecting an array of journal IDs in the request body

  try {
    // Ensure the user has appropriate permissions
    if (userRole === "Owner" || userRole === "Accounts") {
      // Validate the input
      if (
        !journalIDs ||
        !Array.isArray(journalIDs) ||
        journalIDs.length === 0
      ) {
        return res.status(400).json({ error: "Invalid or missing journalIDs" });
      }

      // Validate each journalID format
      const invalidIDs = journalIDs.filter(
        (id) => !mongoose.Types.ObjectId.isValid(id)
      );
      if (invalidIDs.length > 0) {
        return res.status(400).json({
          error: "Invalid journalID format",
          invalidIDs,
        });
      }

      // Delete the journals
      const journalResult = await Journal.deleteMany({
        _id: { $in: journalIDs },
      });

      // Delete associated Income records
      const incomeResult = await Income.deleteMany({
        journalID: { $in: journalIDs },
      });

      // Delete associated Expense records
      const expenseResult = await Expense.deleteMany({
        journalID: { $in: journalIDs },
      });

      // Respond with a success message
      res.json({
        message:
          "Journals and associated Income/Expense records deleted successfully",
        deleted: {
          journalsDeleted: journalResult.deletedCount,
          incomeDeleted: incomeResult.deletedCount,
          expenseDeleted: expenseResult.deletedCount,
        },
      });
    } else {
      // If the user lacks permissions, send a 403 Forbidden error
      res.status(403).json({ error: "Unauthorized action" });
    }
  } catch (error) {
    // Catch and log errors
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
});

module.exports = router;

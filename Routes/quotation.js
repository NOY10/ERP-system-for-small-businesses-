const express = require("express");
const mongoose = require("mongoose");

const Quotation = mongoose.model("Quotation");
// const Materials= mongoose.model('Materials')
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const RequireLogin = require("../Middleware/requireLogin");
const RequireLoginEmployee = require("../Middleware/requireLoginEmployee");
const multer = require("multer");

router.post("/addQuotation", RequireLogin, async (req, res) => {
  const userRole = req.user.role;
  try {
    if (userRole == "Owner" || userRole == "Accounts") {
      const { to, title, quotationItems, date } = req.body;
         // Check for required fields
         if (!to || !title || !quotationItems || !Array.isArray(quotationItems) || quotationItems.length === 0 || !date) {
          return res.status(400).json({ error: "Missing required fields or invalid quotation items" });
        }

      const quotation = new Quotation({
        to,
        title,
        quotationItems,
        date,
        owner: userRole == "Owner" ? req.user._id : req.user.owner,
      });

      await quotation.save();
      // .then(income=>{
      console.log("income", quotation);
      res.json({ quotation });
    } else {
      res.json({ Error: "Error Adding" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/getallQuotation", RequireLogin, (req, res) => {
  const userRole = req.user.role;

  if (userRole == "Owner" || userRole == "Accounts") {
    Quotation.find({
      owner: userRole == "Owner" ? req.user._id : req.user.owner,
    })
      .then((quotation) => {
        res.json({ quotation });
      })
      .catch((err) => {
        res.json({ Error: err });
      });
  }
});


router.delete("/deleteQuotation", RequireLogin, (req, res) => {
  const userRole = req.user.role;

  // Check if the user has permission to delete quotations
  if (userRole === "Owner" || userRole === "Accounts") {
    const { ids } = req.body; // Expecting an array of IDs in the request body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid or missing IDs" });
    }

    // Use Mongoose to delete multiple documents
    Quotation.deleteMany({ _id: { $in: ids } })
      .then((result) => {
        if (result.deletedCount === 0) {
          return res
            .status(404)
            .json({ error: "No quotations found to delete" });
        }
        res.json({
          message: "Quotations deleted successfully",
          deletedCount: result.deletedCount,
        });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: "Failed to delete quotations" });
      });
  } else {
    res.status(403).json({ error: "Unauthorized action" });
  }
});

router.put("/updateQuotation", RequireLogin, (req, res) => {
  const { to, title, quotationItems, date } = req.body;

  const userRole = req.user.role;

  // Check if the user has permission to delete an employee
  if (userRole === "Owner" || userRole === "Accounts") {
    Quotation.findByIdAndUpdate(
      req.body.id,
      {
        $set: {
          to,
          title,
          quotationItems,
          date,
        },
      },
      { new: true }
    )

      .then((quotation) => {
        res.json({ quotation });
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

router.put("/updateQuotation/:id", RequireLogin, (req, res) => {
  const { to, title, quotationItems, date } = req.body;
  const userRole = req.user.role;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid quotation ID' });
  }
  // Check if the user has permission to update an invoice
  if (userRole === "Owner" || userRole === "Accounts") {
    // Use the ID from the URL parameter to find and update the invoice
    Quotation.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          to,
          title,
          quotationItems,
          date,
        },
      },
      { new: true }
    )
      .then((quotation) => {
        if (quotation) {
          res.json({ quotation });
        } else {
          res.status(404).send("quotation not found");
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error updating quotation");
      });
  } else {
    res.status(403).send("You do not have permission to update quotations");
  }
});

router.post("/search-quotation", RequireLogin, (req, res) => {
  if (!req.body.query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  let searchStock = new RegExp("^" + req.body.query);
  const userRole = req.user.role;
  const id = userRole == "Owner" ? req.user._id : req.user.owner;

  if (userRole === "Owner" || userRole === "Accounts") {
    Quotation.find({
      $and: [
        {
          $or: [
            { to: { $regex: searchStock, $options: "i" } },
            { title: { $regex: searchStock, $options: "i" } },
          ],
        },
        { owner: id },
      ],
    })
      .then((quotations) => {
        res.json({ quotations });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
      });
  } else {
    res.status(403).json({ error: "Not authorized to search quotations" });
  }
});


module.exports = router;

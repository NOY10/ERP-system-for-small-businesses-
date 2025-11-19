const express = require("express");
const mongoose = require("mongoose");

const Invoice = mongoose.model("Invoice");
// const Materials= mongoose.model('Materials')
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const RequireLogin = require("../Middleware/requireLogin");
const RequireLoginEmployee = require("../Middleware/requireLoginEmployee");
const multer = require("multer");

router.post("/addInvoice", RequireLogin, async (req, res) => {
  const userRole = req.user.role;
  console.log("Request Body: ", req.body);
  try {
    if (userRole == "Owner" || userRole == "Accounts") {
      const { to, title, invoiceItems, date } = req.body;

         // Check for required fields
         if (!to || !title || !invoiceItems || !Array.isArray(invoiceItems) || invoiceItems.length === 0 || !date) {
          return res.status(400).json({ error: "Missing required fields or invalid invoice items" });
        }

      const invoice = new Invoice({
        to,
        title,
        invoiceItems,
        date,
        owner: userRole == "Owner" ? req.user._id : req.user.owner,
      });

      await invoice.save();
      // .then(income=>{
      console.log("income", invoice);
      res.json({ invoice });
    } else {
      res.json({ Error: "Error Adding" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/getallInvoice", RequireLogin, (req, res) => {
  const userRole = req.user.role;

  if (userRole == "Owner" || userRole == "Accounts") {
    Invoice.find({ owner: userRole == "Owner" ? req.user._id : req.user.owner })
      .then((invoice) => {
        res.json({ invoice });
      })
      .catch((err) => {
        res.json({ Error: err });
      });
  }
});

router.delete("/deleteInvoice", RequireLogin, (req, res) => {
  const userRole = req.user.role;

  // Check if the user has permission to delete invoices
  if (userRole === "Owner" || userRole === "Accounts") {
    const { ids } = req.body; // Expecting an array of IDs in the request body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid or missing IDs" });
    }

    // Use Mongoose to delete multiple documents
    Invoice.deleteMany({ _id: { $in: ids } })
      .then((result) => {
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "No invoices found to delete" });
        }
        res.json({
          message: "Invoices deleted successfully",
          deletedCount: result.deletedCount,
        });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: "Failed to delete invoices" });
      });
  } else {
    res.status(403).json({ error: "Unauthorized action" });
  }
});

router.put("/updateInvoice", RequireLogin, (req, res) => {
  const { to, title, invoiceItems, date } = req.body;

  const userRole = req.user.role;

  // Check if the user has permission to delete an employee
  if (userRole === "Owner" || userRole === "Accounts") {
    Invoice.findByIdAndUpdate(
      req.body.id,
      {
        $set: {
          to,
          title,
          invoiceItems,
          date,
        },
      },
      { new: true }
    )

      .then((invoice) => {
        res.json({ invoice });
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

router.put("/updateInvoice/:id", RequireLogin, (req, res) => {
  const { to, title, invoiceItems, date } = req.body;
  const userRole = req.user.role;

  // Check if the user has permission to update an invoice
  if (userRole === "Owner" || userRole === "Accounts") {
    // Use the ID from the URL parameter to find and update the invoice
    Invoice.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          to,
          title,
          invoiceItems,
          date,
        },
      },
      { new: true }
    )
      .then((invoice) => {
        if (invoice) {
          res.json({ invoice });
        } else {
          res.status(404).send("Invoice not found");
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error updating invoice");
      });
  } else {
    res.status(403).send("You do not have permission to update invoices");
  }
});

// router.post("/search-invoice", RequireLogin, (req, res) => {
//   let searchStock = new RegExp("^" + req.body.query);

//   const userRole = req.user.role;
//   const id = userRole == "Owner" ? req.user._id : req.user.owner;

//   // Check if the user has permission to delete an employee
//   if (userRole === "Owner" || userRole === "Accounts") {
//     Invoice.find({
//       $and: [
//         {
//           $or: [
//             { to: { $regex: searchStock, $options: "i" } },
//             { title: { $regex: searchStock, $options: "i" } },
//           ],
//         },

//         { owner: id },
//       ],
//     })
//       .then((invoice) => {
//         res.json({ invoice });
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
// });
router.post("/search-invoice", RequireLogin, (req, res) => {
  const { query } = req.body;

  // Check if query is missing
  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  let searchStock = new RegExp("^" + query);

  const userRole = req.user.role;
  const id = userRole == "Owner" ? req.user._id : req.user.owner;

  // Check if the user has permission to search invoices
  if (userRole === "Owner" || userRole === "Accounts") {
    Invoice.find({
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
      .then((invoice) => {
        res.json({ invoice });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
      });
  } else {
    res.status(403).json({ error: "Not authorized to search invoices" });
  }
});

module.exports = router;

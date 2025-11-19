const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const router = express.Router();
const User = mongoose.model("Owner");
const Employee = mongoose.model("Employee");
const Validate = mongoose.model("Validate");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

router.post("/signupUser", async (req, res) => {
  const {
    name,
    email,
    password,
    address,
    gender,
    dob,
    cid,
    phone,
    otp,
    pic,
    subscription,
  } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(422).json({ error: "Add all the fields" });
  }

  try {
    const savedUser = await Validate.findOne({
      $and: [
        { email: email },
        { otp: otp },
        { expireToken: { $gt: Date.now() } },
      ],
    });

    if (!savedUser) {
      return res.status(422).json({ error: "Wrong OTP or OTP Expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email,
      password: hashedPassword,
      name,
      address,
      gender,
      cid,
      dob,
      phone,
      subscription,
    });

    await user.save();

    transporter.sendMail({
      to: user.email,
      from: "drukbookserp@gmail.com",
      subject: "Signup Success",
      html: `
            <h1>Welcome to Drukbooks!</h1>
            <p>Hi ${user.name},</p>
            <p>Thank you for signing up. We're excited to have you on board!</p>
            <p>Regards,</p>
            <p>The Drukbooks Team</p>
        `,
    });

    res.json({ message: "User signup successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/signinUser", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Please provide both email and password" });
  }

  User.findOne({ email: email })
    .then((savedUser) => {
      if (!savedUser) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      bcrypt
        .compare(password, savedUser.password)
        .then((doMatch) => {
          if (doMatch) {
            // Password matched, generate JWT token
            // const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET, { expiresIn: '3d' });

            const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET, {
              expiresIn: "3d",
            });

            // Respond with generic success message (no user data)
            return res.status(200).json({
              message: "Login successful",
              token,
              user: {
                _id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                role: savedUser.role,
                profilePic: savedUser.profileImage,
              },
            });
          } else {
            return res.status(401).json({ error: "Invalid credentials" });
          }
        })
        .catch((err) => {
          console.error(err);
          return res.status(500).json({ error: "Internal Server Error" });
        });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    });
});

router.post("/signinEmployee", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Please provide both email and password" });
  }

  Employee.findOne({ email: email })
    .then((savedUser) => {
      if (!savedUser) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      bcrypt
        .compare(password, savedUser.password)
        .then((doMatch) => {
          if (doMatch) {
            // Password matched, generate JWT token
            const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET, {
              expiresIn: "3d",
            });

            // Respond with generic success message (no user data)
            return res.status(200).json({
              message: "Login successful",
              token,
              user: {
                _id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                role: savedUser.role,
                employeeId: savedUser.employeeId,
                profilePic: savedUser.profileImage,
              },
            });
          } else {
            return res.status(401).json({ error: "Invalid credentials" });
          }
        })
        .catch((err) => {
          console.error(err);
          return res.status(500).json({ error: "Internal Server Error" });
        });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    });
});

router.post("/sendotpuser", (req, res) => {
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000);

  User.findOne({ email: email })
    .then((savedUser) => {
      if (savedUser) {
        return res.status(422).json({ error: "email already exists" });
      }

      const validate = new Validate({
        email,
        otp,
        expireToken: Date.now() + 360000,
      });
      validate.save().then((generated) => {
        transporter.sendMail({
          to: email,
          from: "Drukbooks <info@drukbooks.com>",
          subject: "Your One-Time Password (OTP)",
          html: ` 
            <p>Dear User,</p>
            
            <p>Your One-Time Password (OTP) for registration is:</p>
            
            <h3 style="color: #007bff;">${otp}</h3>
            
            <p><strong>Note:</strong> This OTP is valid for <strong>7 minutes</strong>. Do not share this OTP with anyone for security reasons.</p>
            
            <p>If you did not request this, please ignore this email.</p>
            
            <p>Best regards,</p>
            <p><em>Drukbooks Support Team</em></p>
          `,
        });

        res.json({ message: "Check your mail for otp" });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/resetusers-password", (req, res) => {
  console.log(req.body.email);
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    } else {
      const token = buffer.toString("hex");

      User.findOne({ email: req.body.email }).then((user) => {
        if (!user) {
          return res.status(422).json({ error: "User Don't exists" });
        }

        user.resetToken = token;
        user.expireToken = Date.now() + 360000;
        user.save().then((result) => {
          transporter.sendMail({
            to: user.email,
            from: "Drukbooks <info@drukbooks.com>",
            subject: "Password Reset Request",
            html: `             
              <p>Dear User,</p>
              
              <p>We received a request to reset your password. Please click the link below to reset your password:</p>
              
              <p><a href="http://localhost:3000/ResetUserPassword/${token}" style="color: blue; font-weight: bold;">Reset Your Password</a></p>
              
              <p><strong>Note:</strong> This link will expire in <strong>7 minutes</strong> for security reasons. If you did not request this, please ignore this email.</p>
              
              <p>Best regards,</p>
              <p><em>Drukbooks Support Team</em></p>
            `,
          });

          res.json({ message: "Check your email" });
        });
      });
    }
  });
});

router.post("/newusers-password", (req, res) => {
  const newPassword = req.body.password;
  const sentToken = req.body.token;
  User.findOne({
    resetToken: sentToken,
    expireToken: { $gt: Date.now() },
  }).then((user) => {
    if (!user) {
      return res.status(422).json({ error: "try again, session expired" });
    }
    bcrypt
      .hash(newPassword, 12)
      .then((hashedpassword) => {
        user.password = hashedpassword;
        user.resetToken = undefined;
        user.expireToken = undefined;
        user.save().then((savedUser) => {
          res.json({ message: "password reset sucessfull" });
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

router.post("/resetEmployee-password", (req, res) => {
  console.log(req.body.email);
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    } else {
      const token = buffer.toString("hex");

      Employee.findOne({ email: req.body.email }).then((user) => {
        if (!user) {
          return res.status(422).json({ error: "User Don't exists" });
        }

        user.resetToken = token;
        user.expireToken = Date.now() + 360000;
        user.save().then((result) => {
          transporter.sendMail({
            to: user.email,
            from: "Drukbooks <info@drukbooks.com>",
            subject: "Password Reset Request",
            html: `             
              <p>Dear User,</p>
              
              <p>We received a request to reset your password. Please click the link below to reset your password:</p>
              
              <p><a href="http://localhost:3000/ResetEmployeePassword/${token}" style="color: blue; font-weight: bold;">Reset Your Password</a></p>
              
              <p><strong>Note:</strong> This link will expire in <strong>7 minutes</strong> for security reasons. If you did not request this, please ignore this email.</p>
              
              <p>Best regards,</p>
              <p><em>Drukbooks Support Team</em></p>
            `,
          });

          res.json({ message: "Check your email" });
        });
      });
    }
  });
});

router.post("/newEmployee-password", (req, res) => {
  const newPassword = req.body.password;
  const sentToken = req.body.token;
  Employee.findOne({
    resetToken: sentToken,
    expireToken: { $gt: Date.now() },
  }).then((user) => {
    if (!user) {
      return res.status(422).json({ error: "try again, session expired" });
    }
    bcrypt
      .hash(newPassword, 12)
      .then((hashedpassword) => {
        user.password = hashedpassword;
        user.resetToken = undefined;
        user.expireToken = undefined;
        user.save().then((savedUser) => {
          res.json({ message: "password reset sucessfull" });
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

// Change Password Route for owner
router.post("/change-password", async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Change Password Route for Employee
router.post("/change-password-employee", async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const user = await Employee.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

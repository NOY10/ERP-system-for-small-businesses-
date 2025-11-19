// upload.js
const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const originalName = req.file.originalname.split(".")[0];

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "profile_pics",
        public_id: originalName,
        resource_type: "image",
        type: "private",
      },
      (error, result) => {
        if (error) return res.status(500).json({ error });
        res
          .status(200)
          .json({ url: result.secure_url, public_id: result.public_id });
      }
    );

    stream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/uploadCompanyLogo", upload.single("file"), async (req, res) => {
  try {
    const originalName = req.file.originalname.split(".")[0];

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "company_logos",
        public_id: originalName,
        resource_type: "image",
        type: "private",
      },
      (error, result) => {
        if (error) return res.status(500).json({ error });
        res
          .status(200)
          .json({ url: result.secure_url, public_id: result.public_id });
      }
    );

    stream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

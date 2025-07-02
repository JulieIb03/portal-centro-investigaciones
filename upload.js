// upload.js
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), async (req, res) => {
  const { GITHUB_TOKEN, GITHUB_USERNAME, GITHUB_REPO, GITHUB_BRANCH } = process.env;

  try {
    const file = req.file;
    const fileContent = fs.readFileSync(file.path, { encoding: "base64" });
    const fileName = file.originalname;
    const githubPath = `pdfs/${Date.now()}_${fileName}`;

    const response = await axios.put(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${githubPath}`,
      {
        message: `Subida desde backend: ${fileName}`,
        content: fileContent,
        branch: GITHUB_BRANCH,
      },
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    fs.unlinkSync(file.path); // limpia archivo temporal

    return res.json({ success: true, url: response.data.content.download_url });
  } catch (error) {
    console.error("❌ Error al subir a GitHub:", error.response?.data || error);
    return res.status(500).json({ success: false, error: "Error al subir a GitHub" });
  }
});

module.exports = router;
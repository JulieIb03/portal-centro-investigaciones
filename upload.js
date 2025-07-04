const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const KEYFILEPATH = path.join(__dirname, "credentials-drive.json");
const FOLDER_ID = "1hyIWDZ_wxq_UiLqqEQrSJBkAK7w-sWYu";

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

router.post("/", upload.single("file"), async (req, res) => {
  const file = req.file;

  try {
    const driveService = google.drive({ version: "v3", auth: await auth.getClient() });

    const fileMetadata = {
      name: file.originalname,
      parents: [FOLDER_ID],
    };

    const media = {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.path),
    };

    const fileResponse = await driveService.files.create({
      resource: fileMetadata,
      media,
      fields: "id, webViewLink, webContentLink",
    });

    // 👇 Dar acceso público al archivo
    await driveService.permissions.create({
      fileId: fileResponse.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    fs.unlinkSync(file.path);

    const embedLink = `https://drive.google.com/file/d/${fileResponse.data.id}/preview`;

    return res.json({
      success: true,
      fileId: fileResponse.data.id,
      viewLink: fileResponse.data.webViewLink,
      downloadLink: fileResponse.data.webContentLink,
      embedLink,
    });
  } catch (error) {
    console.error("❌ Error al subir a Google Drive:", error.message);
    return res.status(500).json({ success: false, error: "Error al subir a Google Drive" });
  }
});

module.exports = router;
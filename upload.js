const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data"); // 👈 asegúrate de tenerlo instalado
require("dotenv").config();

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), async (req, res) => {
  const { PDFCO_API_KEY } = process.env;

  try {
    const file = req.file;

    const formData = new FormData();
    formData.append("file", fs.createReadStream(file.path), file.originalname); // 👈 usa fs.createReadStream

    const response = await axios.post("https://api.pdf.co/v1/file/upload", formData, {
      headers: {
        ...formData.getHeaders(),
        "x-api-key": PDFCO_API_KEY,
      },
    });

    // Limpieza
    fs.unlinkSync(file.path);

    if (!response.data || !response.data.url) {
      throw new Error("No se recibió una URL válida desde PDF.co");
    }

    return res.json({ success: true, url: response.data.url });
  } catch (error) {
    console.error("❌ Error al subir a PDF.co:", error.response?.data || error.message);
    return res.status(500).json({ success: false, error: "Error al subir a PDF.co" });
  }
});

module.exports = router;
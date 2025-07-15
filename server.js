// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const uploadRoute = require("./upload");
const sendEmailRoute = require("./sendEmail");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use("/upload", uploadRoute);
app.use("/send-email", sendEmailRoute);

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});

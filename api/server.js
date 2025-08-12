const express = require("express");
const cors = require("cors");
const uploadRoute = require("./upload");
const sendEmailRoute = require("./sendEmail");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/upload", uploadRoute);
app.use("/send-email", sendEmailRoute);

module.exports = app; // exportar la app para Vercel

// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const uploadRoute = require("./upload");

const app = express();
const PORT = 5000;

app.use(cors());
app.use("/upload", uploadRoute);

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});

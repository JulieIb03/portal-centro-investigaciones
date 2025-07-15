const express = require("express");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/", async (req, res) => {
  const { to, subject, template, variables } = req.body;

  if (!to || !subject || !template || !variables) {
    return res
      .status(400)
      .json({ error: "Faltan datos en el cuerpo de la solicitud." });
  }

  try {
    const templatePath = path.join(
      __dirname,
      "src",
      "correos",
      `${template}.html`
    );
    if (!fs.existsSync(templatePath)) {
      return res
        .status(404)
        .json({ error: `La plantilla '${template}.html' no existe.` });
    }

    let htmlContent = fs.readFileSync(templatePath, "utf-8");

    if (variables.ESTADO === "En corrección") {
      htmlContent = htmlContent
        .replace(/{{#IF_EN_CORRECCION}}([\s\S]*?){{\/IF_EN_CORRECCION}}/g, "$1")
        .replace(/{{#IF_APROBADO}}([\s\S]*?){{\/IF_APROBADO}}/g, "");
    } else {
      htmlContent = htmlContent
        .replace(/{{#IF_EN_CORRECCION}}([\s\S]*?){{\/IF_EN_CORRECCION}}/g, "")
        .replace(/{{#IF_APROBADO}}([\s\S]*?){{\/IF_APROBADO}}/g, "$1");
    }

    htmlContent = htmlContent.replace(
      /{{COLOR_ESTADO}}/g,
      variables.ESTADO === "Aprobado" ? "#4caf50" : "#f9b233"
    );

    htmlContent = htmlContent.replace(
      /{{COLOR_FONDO_ESTADO}}/g,
      variables.ESTADO === "Aprobado" ? "#69c0511a" : "#e7b7171a"
    );

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, "g");
      htmlContent = htmlContent.replace(placeholder, value);
    });

    await transporter.sendMail({
      from: `"Centro de Investigaciones" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });

    return res.status(200).json({ message: "Correo enviado correctamente." });
  } catch (err) {
    console.error("❌ Error al enviar correo:", err);
    return res
      .status(500)
      .json({ error: "Error interno al enviar el correo." });
  }
});

module.exports = router;

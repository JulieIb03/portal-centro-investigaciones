// const express = require("express");
const multer = require("multer");
// const fs = require("fs");
// const path = require("path");
const { google } = require("googleapis");
const { Readable } = require("stream");

// const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

export const config = {
  api: {
    bodyParser: false, // Necesario para multer
  },
};

const SHARED_DRIVE_ID = "0AC4W4jQjr_7tUk9PVA"; // ID del Shared Drive

const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

// Función para buscar o crear una carpeta
async function findOrCreateFolder(driveService, parentId, folderName) {
  const safeName = folderName.replace(/'/g, "\\'");
  const response = await driveService.files.list({
    q: `name='${safeName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id, name)",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    corpora: "drive",
    driveId: SHARED_DRIVE_ID,
  });

  if (response.data.files.length > 0) {
    return response.data.files[0].id;
  }

  const folder = await driveService.files.create({
    resource: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
    supportsAllDrives: true,
  });

  return folder.data.id;
}

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  try {
    await runMiddleware(req, res, upload.single("file"));

    const file = req.file;
    const { codigoProyecto, usuarioEmail, nombrePostulante } = req.body;

    if (!file || !codigoProyecto || !usuarioEmail || !nombrePostulante) {
      return res.status(400).json({
        success: false,
        error: "Faltan datos o archivo",
      });
    }

    const driveService = google.drive({
      version: "v3",
      auth: await auth.getClient(),
    });

    const proyectoFolderId = await findOrCreateFolder(
      driveService,
      SHARED_DRIVE_ID,
      codigoProyecto
    );
    const usuarioFolderId = await findOrCreateFolder(
      driveService,
      proyectoFolderId,
      usuarioEmail
    );
    const postulanteFolderId = await findOrCreateFolder(
      driveService,
      usuarioFolderId,
      nombrePostulante
    );

    const stream = Readable.from(file.buffer);

    const fileResponse = await driveService.files.create({
      resource: {
        name: file.originalname,
        parents: [postulanteFolderId],
      },
      media: {
        mimeType: file.mimetype,
        body: stream,
      },
      fields: "id, webViewLink",
      supportsAllDrives: true,
    });

    await driveService.permissions.create({
      fileId: fileResponse.data.id,
      requestBody: { role: "reader", type: "anyone" },
      supportsAllDrives: true,
    });

    const embedLink = `https://drive.google.com/file/d/${fileResponse.data.id}/preview`;

    return res.json({
      success: true,
      fileId: fileResponse.data.id,
      viewLink: fileResponse.data.webViewLink,
      embedLink,
    });
  } catch (error) {
    console.error("Error al subir:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

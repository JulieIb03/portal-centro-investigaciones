const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const KEYFILEPATH = path.join(__dirname, "credentials-drive.json");
const SHARED_DRIVE_ID = "0AC4W4jQjr_7tUk9PVA"; // ID del Shared Drive

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

// Función para buscar o crear una carpeta
async function findOrCreateFolder(driveService, parentId, folderName) {
  try {
    const safeName = folderName.replace(/'/g, "\\'");

    console.log(`🔍 Buscando carpeta '${folderName}' dentro de ${parentId}`);

    const response = await driveService.files.list({
      q: `name='${safeName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      corpora: "drive",
      driveId: SHARED_DRIVE_ID,
    });

    if (response.data.files.length > 0) {
      console.log(
        `✅ Carpeta encontrada: '${folderName}' → ${response.data.files[0].id}`
      );
      return response.data.files[0].id;
    }

    console.log(
      `📁 Carpeta no encontrada, creando '${folderName}' dentro de ${parentId}`
    );

    const folderMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    };

    const folder = await driveService.files.create({
      resource: folderMetadata,
      fields: "id",
      supportsAllDrives: true,
    });

    console.log(`✅ Carpeta creada: '${folderName}' → ${folder.data.id}`);

    return folder.data.id;
  } catch (error) {
    console.error(`❌ Error al buscar/crear carpeta '${folderName}':`, error);
    throw error;
  }
}

router.post("/", upload.single("file"), async (req, res) => {
  const file = req.file;
  const { codigoProyecto, usuarioEmail, nombrePostulante } = req.body;

  if (!codigoProyecto || !usuarioEmail || !nombrePostulante) {
    return res.status(400).json({
      success: false,
      error:
        "Faltan datos necesarios (codigoProyecto, usuarioEmail, nombrePostulante)",
    });
  }

  try {
    const driveService = google.drive({
      version: "v3",
      auth: await auth.getClient(),
    });

    console.log("🚀 Iniciando subida a Drive...");
    console.log("📦 Datos recibidos:", {
      archivo: file.originalname,
      codigoProyecto,
      usuarioEmail,
      nombrePostulante,
    });

    // 1. Carpeta del proyecto
    const proyectoFolderId = await findOrCreateFolder(
      driveService,
      SHARED_DRIVE_ID,
      codigoProyecto
    );

    // 2. Carpeta del usuario
    const usuarioFolderId = await findOrCreateFolder(
      driveService,
      proyectoFolderId,
      usuarioEmail
    );

    // 3. Carpeta del postulante
    const postulanteFolderId = await findOrCreateFolder(
      driveService,
      usuarioFolderId,
      nombrePostulante
    );

    // 4. Subir archivo
    console.log("📤 Subiendo archivo a carpeta:", postulanteFolderId);

    let fileResponse;
    try {
      fileResponse = await driveService.files.create({
        resource: {
          name: file.originalname,
          parents: [postulanteFolderId],
        },
        media: {
          mimeType: file.mimetype,
          body: fs.createReadStream(file.path),
        },
        fields: "id, webViewLink",
        supportsAllDrives: true,
      });

      console.log("✅ Archivo subido con éxito:", fileResponse.data);
    } catch (uploadError) {
      console.error("❌ Error al subir archivo:", uploadError);
      return res.status(500).json({
        success: false,
        error: "Error al subir archivo a Google Drive",
        details: uploadError.message,
      });
    }

    try {
      await driveService.permissions.create({
        fileId: fileResponse.data.id,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
        supportsAllDrives: true,
      });

      console.log("🔓 Permiso público creado para el archivo.");
    } catch (permError) {
      console.error(
        "⚠️ Archivo subido pero falló al asignar permiso público:",
        permError
      );
      return res.status(200).json({
        success: true,
        warning: "Archivo subido pero falló al asignar permiso público",
        fileId: fileResponse.data.id,
        viewLink: fileResponse.data.webViewLink,
        embedLink: `https://drive.google.com/file/d/${fileResponse.data.id}/preview`,
      });
    }

    // 6. Eliminar archivo temporal
    fs.unlinkSync(file.path);

    const embedLink = `https://drive.google.com/file/d/${fileResponse.data.id}/preview`;

    console.log("✅ Archivo subido con éxito:", {
      id: fileResponse.data.id,
      webViewLink: fileResponse.data.webViewLink,
      embedLink,
    });

    return res.json({
      success: true,
      fileId: fileResponse.data.id,
      viewLink: fileResponse.data.webViewLink,
      embedLink,
      folderStructure: {
        proyecto: codigoProyecto,
        usuario: usuarioEmail,
        postulante: nombrePostulante,
      },
    });
  } catch (error) {
    console.error("❌ Error completo:", {
      message: error.message,
      code: error.code,
      errors: error.errors,
    });
    return res.status(500).json({
      success: false,
      error: "Error al subir a Google Drive",
      details: error.message,
    });
  }
});

module.exports = router;

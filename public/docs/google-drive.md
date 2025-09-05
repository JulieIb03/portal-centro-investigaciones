# Integración con Google Drive

El Portal de Centro de Investigaciones implementa una integración directa con **Google Drive**, utilizando una **cuenta de servicio** para manejar la subida de archivos de las postulaciones a una **Unidad Compartida**.

---

## 🚀 Objetivo de la integración

Cada postulación requiere almacenar documentos de soporte (PDFs, anexos, formularios, etc.).  
En lugar de guardarlos en el servidor o en Firebase Storage, se decidió centralizar los archivos en una **unidad compartida de Google Drive**:

🔗 Carpeta raíz: [Unidad Compartida - Portal CDI](https://drive.google.com/drive/u/2/folders/0AC4W4jQjr_7tUk9PVA)

Ventajas:
- ✅ Integración con la infraestructura institucional (Drive compartido).
- ✅ Evita depender de almacenamiento local en servidores o despliegues.
- ✅ Facilita compartir enlaces de lectura a revisores y directivos.
- ✅ Escalable: cada postulación se organiza en carpetas jerárquicas.

---

## 🛠️ Cuenta de servicio

Se creó una cuenta de servicio exclusiva para esta integración:

- **Proyecto**: `Portal Centro Investigaciones (portal-centro-investigaciones)`
- **Cuenta de servicio**:  `portal-upload-drive@portal-centro-investigaciones.iam.gserviceaccount.com`
- **Rol**: subida de archivos PDF al folder compartido.
- **Estado**: habilitada ✅

👉 Esta cuenta posee un JSON de credenciales que se guarda en `GOOGLE_CREDENTIALS` dentro de las variables de entorno del despliegue. Para más información sobre esto, visite la sección "Instalación".

---

## 📂 Estructura de carpetas en Drive

Los archivos no se suben todos juntos, sino organizados en subcarpetas:

```text
Unidad Compartida (0AC4W4jQjr_7tUk9PVA)/
└── [codigoProyecto]/
└── [usuarioEmail]/
└── [nombrePostulante]/
└── archivos.pdf
```

Esto garantiza:
- Orden por **proyecto**.
- Subcarpetas por **usuario** (docente/revisor).
- Subcarpetas específicas por **postulante**.

---

## 📜 api/upload.js

El archivo `api/upload.js` implementa la subida de archivos desde el portal hacia la unidad compartida.

### 🔹 Tecnologías usadas
- **Multer** → Manejo de subida de archivos desde formularios.
- **Google APIs (drive v3)** → Cliente oficial de Google para interactuar con Drive.
- **Streams (Readable)** → Conversión de buffer en flujo para subir el archivo.

### 🔹 Flujo de ejecución

1. **Configuración inicial**

   ```js
   const SHARED_DRIVE_ID = "0AC4W4jQjr_7tUk9PVA";
   const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
   const auth = new google.auth.GoogleAuth({
     credentials,
     scopes: ["https://www.googleapis.com/auth/drive"],
   });
   ```
   Aquí se lee la variable de entorno GOOGLE_CREDENTIALS y se autentica la cuenta de servicio contra Drive.

2. **Middleware con Multer**

    ```js
    const upload = multer({ storage: multer.memoryStorage() });
    ```

    Los archivos se procesan en memoria, sin guardarse en disco.

3. **Creación de carpetas dinámicas**

    ```js
    async function findOrCreateFolder(driveService, parentId, folderName) { ... }
    ```

    Aquí se busca si existe una carpeta. Si no existe, la crea dentro del parentId. Por tanto, se ejecuta en cascada:
    - Carpeta del proyecto → Carpeta del usuario → Carpeta del postulante.

4. **Subida del archivo**

    ```js
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
    ```

    Convierte el archivo en stream y lo envía al Drive, para luego ubicarlo en la carpeta correspondiente.

5. **Permisos de lectura pública**

    ```js
    await driveService.permissions.create({
    fileId: fileResponse.data.id,
    requestBody: { role: "reader", type: "anyone" },
    supportsAllDrives: true,
    });
    ```

    Se da permiso de lectura pública a cualquiera con el enlace.

6. **Generación de enlace embebido**

    ```js
    const embedLink = `https://drive.google.com/file/d/${fileResponse.data.id}/preview`;
    ```

    Permite visualizar el PDF directamente en un iframe dentro del portal.

7. **Respuesta final**

    ```json
    {
    "success": true,
    "fileId": "abc123xyz",
    "viewLink": "https://drive.google.com/file/d/abc123xyz/view",
    "embedLink": "https://drive.google.com/file/d/abc123xyz/preview"
    }
    ```

---

## 🎯 Importancia del proceso

- **Organización documental** → Cada postulación queda perfectamente estructurada en la unidad compartida.
- **Acceso rápido y seguro** → Con enlaces de lectura, los revisores pueden abrir los archivos sin necesidad de descarga.
- **Escalabilidad** → Pueden manejarse cientos de postulaciones sin desorden.
- **Integración institucional** → Los archivos se almacenan en Google Drive, sistema ya usado por la universidad.



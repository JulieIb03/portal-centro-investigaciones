# Deployment del Portal en Vercel

Este documento describe el proceso de despliegue del **Portal Centro de Investigaciones UMNG** en **Vercel**, a partir de un repositorio de GitHub.  

El despliegue ya está activo y vinculado a la cuenta institucional del **Centro de Investigaciones**, por lo que **no es necesario crear proyectos nuevos**.

---

## 📂 Estructura del Proyecto

El proyecto fue diseñado como una **aplicación full-stack en un solo repositorio**, lo que permite simplificar el despliegue en Vercel:

```
/src → Código del frontend (React)
/pages/api → Endpoints del backend (serverless functions)
├── upload.js → Endpoint para subir archivos a Google Drive
└── sendEmail.js→ Endpoint para envío de correos automáticos
```

---

## 🌐 Frontend (React)

- El frontend está construido con **React + React Router**.  
- Se sirve directamente desde Vercel como una **aplicación estática optimizada**.  
- Todas las rutas protegidas se manejan con `ProtectedRoute` y `AuthProvider`.  

No requiere configuración adicional más allá del `build` de React.

---

## ⚡ Backend (Serverless API en Vercel)

En lugar de desplegar un backend separado, se optó por usar las **Serverless Functions de Vercel**, las cuales se definen en la carpeta `/pages/api/`.  

### 1. 📤 `upload.js` – Subida de archivos a Google Drive
- Implementa la lógica de **recepción y validación de archivos** con `multer`.  
- Utiliza la **cuenta de servicio** de Google (`portal-upload-drive@portal-centro-investigaciones.iam.gserviceaccount.com`) para conectarse a la API de Drive.  
- Cada archivo se organiza en una jerarquía:  

```
Shared Drive (centro de investigaciones)
└── Proyecto (códigoProyecto)
└── Usuario (usuarioEmail)
└── Postulante (nombrePostulante)
└── Documento.pdf
```

- Los archivos se suben con permisos públicos de lectura (`anyone with the link`).  
- El endpoint responde con:
  - ✅ `viewLink` → enlace de visualización.  
  - ✅ `embedLink` → enlace embebible en el portal.  

---

### 2. 📧 `sendEmail.js` – Notificación por correo
- Maneja el envío de **correos automáticos** mediante `nodemailer` y Gmail.  
- Usa **plantillas HTML dinámicas** para distintos casos:  
  - 📌 Nueva postulación (`plantillaNuevaPostulacion`).  
  - 📌 Reenvío de correcciones (`plantillaReenvio`).  
  - 📌 Resultado de revisión (`plantillaRevision`).  
- Variables como `CODIGO_PROYECTO`, `NOMBRE_POSTULANTE`, `ESTADO`, etc., se reemplazan en tiempo de ejecución.  
- Los correos se envían con remitente institucional:  
```
"Centro de Investigaciones" <EMAIL_USER>
```

---

## 🔐 Variables de Entorno en Vercel

En el proyecto de Vercel ya están configuradas las variables necesarias:

- `GOOGLE_CREDENTIALS` → JSON de credenciales de la cuenta de servicio.  
- `EMAIL_USER` → Correo institucional usado para envío.  
- `EMAIL_PASS` → Contraseña o App Password de Gmail.  

Se pueden gestionar desde el panel de Vercel:  
➡️ **Project Settings > Environment Variables**

---

## 🔄 Flujo de Despliegue

1. Los cambios se suben al **repositorio de GitHub** vinculado.  
2. Vercel detecta el push y ejecuta automáticamente el `build`.  
3. El **frontend** se compila como aplicación estática.  
4. Los archivos en `/pages/api` se convierten en **endpoints serverless** disponibles bajo:  
 - `/api/upload`  
 - `/api/sendEmail`  

---

## ✅ Consideraciones Importantes

- ⚠️ **Multer en Serverless**: se configuró con `memoryStorage()` para manejar archivos en memoria y evitar problemas de disco en funciones sin estado.  
- ⚠️ **Body Parser deshabilitado**: en `upload.js` se configuró `bodyParser: false` porque `multer` necesita manejar directamente el `req`.  
- ⚠️ **Límites de Vercel**: los archivos no deben superar **4.5 MB** para evitar cortes en la subida.  
- ⚠️ **Correo**: en caso de fallos recurrentes en Gmail, considerar migrar a un servicio dedicado (SendGrid, SES, etc.) y reconfigurar `nodemailer`.  

---

## 🔍 Verificación del Despliegue

- URL de producción:  
👉 [https://portal-centro-investigaciones-umng.vercel.app](https://portal-centro-investigaciones-umng.vercel.app)  

- Endpoints:  
    -- Subida: `POST /api/upload`  
    -- Email: `POST /api/sendEmail`  

---

## 🚀 Mantenimiento

1. Hacer cambios en el repositorio GitHub.  
2. Confirmar que el build en Vercel se complete sin errores.  
3. Revisar que las variables de entorno estén actualizadas.  
4. Validar endpoints en producción.  

---


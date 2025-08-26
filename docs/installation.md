# Instalación del Proyecto

Este documento explica cómo instalar y configurar el **Portal del Centro de Investigaciones** en un entorno de desarrollo.

---

## 📋 Requisitos Previos

Antes de comenzar asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (v18 o superior recomendado)
- [npm](https://www.npmjs.com/) (incluido con Node.js)
- Acceso al correo del centro de investigaciones propio del proyecto:
  - **Correo:** centroinvestigaciones.umng@gmail.com
  - **Contraseña:** PortalCI2025$-

---

## 📂 Clonar el Repositorio

```bash
# Clonar el repositorio
git clone https://github.com/JulieIb03/portal-centro-investigaciones.git

# Acceder al directorio
cd portal-front
```

---

## 📦 Instalación de Dependencias

Ejecuta en la terminal:

```bash
npm install
```

Esto instalará todas las dependencias definidas en package.json, incluyendo:

- React 19 → Librería principal del frontend
- Firebase → Conexión con Firestore y autenticación
- Express / Multer / Google APIs → Backend (API) y subida de archivos a Google Drive
- Axios → Cliente HTTP
- React Router DOM → Manejo de rutas
- Testing Library / Jest → Pruebas unitarias

---

## 🔐 Configuración de Variables de Entorno

Este proyecto utiliza **Firebase** y otras dependencias que requieren credenciales. Para mantener segura la información sensible, todas las claves deben almacenarse en un archivo `.env` en la raíz del proyecto.

1. Crear un archivo `.env` en la raíz del proyecto:

    ```bash
    touch .env
    ```

2. Configurar variables

- 🔑 Variables de Firebase

    ``` text
    REACT_APP_FIREBASE_API_KEY=
    REACT_APP_FIREBASE_AUTH_DOMAIN=
    REACT_APP_FIREBASE_PROJECT_ID=
    REACT_APP_FIREBASE_STORAGE_BUCKET=
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
    REACT_APP_FIREBASE_APP_ID=
    REACT_APP_FIREBASE_MEASUREMENT_ID=
    ```
    Estas credenciales se obtienen del panel de configuración de Firebase (proyecto web → Configuración → Credenciales). Para acceder, ingrese a  <a href="https://console.firebase.google.com/">https://console.firebase.google.com/</a> utilizando la cuenta de Google previamente proporcionada: `centroinvestigaciones.umng@gmail.com`.

- 📧 Variables de Correo

    ```
    EMAIL_USER=
    EMAIL_PASS=
    ```

    Se usan para nodemailer. Se usan las credenciales del correo del centro de investigaciones dadas al principio de este documento.

- ☁️ Credenciales de Google Drive

    ```
    GOOGLE_CREDENTIALS={"type": "service_account","project_id": "","private_key_id": "","private_key": "","token_uri": "","auth_provider_x509_cert_url": "","client_x509_cert_url": "","universe_domain": "googleapis.com"}
    ```

    Estas credenciales corresponden a la Service Account que se creó en Google Cloud para acceder a Google Drive. 
    Para obtenerlas, debe seguir estos pasos: ingrese a <a href="https://console.cloud.google.com/">Google Cloud Console</a> con las credenciales del correo del centro, navegue hasta "IAM y administración" > "Service Accounts", seleccione la cuenta de servicio "portal-upload-drive@portal-centro-investigaciones.iam.gserviceaccount.com", vaya a la pestaña "Keys", genere una nueva clave en formato JSON y descargue el archivo. Los campos requeridos (type, project_id, private_key_id, private_key, etc.) se encontrarán dentro de este archivo JSON descargado.

---

## ▶️ Ejecución en Desarrollo

El proyecto no utiliza despliegue local con Express tradicional, ya que las rutas de la API (/api/) están diseñadas para ejecutarse directamente en Vercel.

Para desarrollo, puedes levantar el frontend con:

```bash
npm start
```

Esto abrirá la aplicación en http://localhost:3000

Las rutas de backend (/api/...) serán servidas directamente desde Vercel en despliegues.

---

## 🚀 Despliegue

El despliegue en Vercel está documentado en la sección "Despliegue".
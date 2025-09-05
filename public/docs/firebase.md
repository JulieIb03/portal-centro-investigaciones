# Configuración de Firebase 

Este documento explica cómo se encuentra configurado Firebase en el proyecto y cómo integrarlo correctamente.

---

## 1. Proyecto en Firebase

- **Nombre del proyecto:** Portal Centro Investigaciones
- **ID del proyecto:** portal-centro-investigaciones

El proyecto ya está creado en [Firebase Console](https://console.firebase.google.com/)

---

## 2. Servicios habilitados

Actualmente se usan los siguientes módulos de Firebase:

- **Authentication** → Manejo de usuarios y sesiones.
- **Firestore Database** → Almacenamiento de vinculaciones, subvinculaciones y documentos requeridos.

---

## 3. Configuración de Firebase

En el proyecto se encuentra el siguiente archivo:

📂 src/Credenciales.js

```javascript

// Importaciones
import { initializeApp } from "firebase/app"; // Crea la instancia de Firebase con la configuración de tu proyecto.
import { getAuth } from "firebase/auth"; // Habilita el servicio de autenticación.
import { getFirestore } from "firebase/firestore"; // Habilita el servicio de base de datos en la nube (NoSQL).

// Configuración
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Inicialización de Firebase
const appFirebase = initializeApp(firebaseConfig); // Se crea la conexión de la app con el proyecto de Firebase (en la nube)

// Servicios disponibles
const auth = getAuth(appFirebase); // Permite manejar usuarios 
const db = getFirestore(appFirebase); // Permite acceder a la base de datos Firestore.


// Exportaciones
export { auth, db}; // Se exporta auth y db por separado para usarlos directamente en los componentes
export default appFirebase; // Se exporta por defecto appFirebase en caso de que se quiera inicializar otros servicios en otro archivo
```

Este archivo es básicamente el punto de inicialización de Firebase en el proyecto. En pocas palabras: es lo que permite que la aplicación React conozca y use los servicios de Firebase (Firestore, Auth, etc.).

🔑 Nota: Los valores (apiKey, appId, etc.) se están tomando desde variables de entorno (.env.local) para no exponer datos sensibles en el repositorio. Este proceso y la obtención de estas credenciales se detalla en la sección anterior.
# Estructura del Proyecto

Este documento describe la **arquitectura de carpetas y archivos** del proyecto **Portal del Centro de Investigaciones**.  
La organización busca mantener modularidad, claridad y escalabilidad a medida que el sistema crece.

---

## 📂 Estructura General

```
PORTAL-FRONT/
├── api/
├── docs/
├── node_modules/
├── public/
├── src/
│ ├── assets/
│ ├── components/
│ │ └── Auth/
│ ├── layout/
│ ├── pages/
│ ├── styles/
│ ├── App.css
│ ├── App.js
│ ├── App.test.js
│ ├── Component.jsx
│ ├── Credenciales.js
│ ├── index.css
│ ├── index.js
│ ├── logo.svg
│ ├── pdfWorker.js
│ ├── reportWebVitals.js
│ ├── setupTests.js
├── uploads/
├── .env
├── .gitignore
├── credentials-drive.json
├── package-lock.json
├── package.json
└── README.md
```

---

## 📁 Carpetas Principales

### 🔹 `api/`
Contendrá archivos relacionados con la comunicación con **APIs externas** o funciones backend que se integran con el frontend. Hecha de esta forma para poder realizar el despliegue en vercel dentro de la misma carpeta. Se explica a más detalle en la sección "Despliegue".

---

### 🔹 `docs/`
Carpeta dedicada a la **documentación del proyecto** (archivos `.md` o `.html`).  
Incluye la guía de estilos, instalación, estructura, despliegue, etc.  
Ejemplo: `styles-design.md`, `project-structure.md`.

---

### 🔹 `public/`
Archivos estáticos accesibles directamente desde la aplicación.  
Ejemplo: imágenes globales, favicon, etc.

---

### 🔹 `src/`
Carpeta principal del código fuente de la aplicación.  

Subcarpetas y archivos clave:

- **`assets/`** → Contiene imágenes, íconos y recursos gráficos utilizados en la interfaz.  

- **`components/`** → Componentes reutilizables de la aplicación.  
  - **`Auth/`** → Módulos de autenticación (login, registro, etc.).  
  - **`Subida.jsx`** → Componente para subida de archivos/documentos.  

- **`layout/`** → Componentes de estructura de la aplicación (header).  

- **`pages/`** → Páginas principales del sistema, cada una representa una vista o ruta en la aplicación.  

- **`styles/`** → Archivos de estilos CSS específicos por pantalla o globales.  
  - `Default.css` → Configuración global de colores, tipografía y resets.  
  - Otros `.css` → Estilos particulares de pantallas como Login, Dashboard, Revisiones, etc.  

---

## 📄 Archivos Clave en `src/`

- **`App.js`** → Punto de entrada del frontend. Define rutas principales y estructura base del sistema.  
- **`App.css`** → Estilos generales asociados al componente raíz.  
- **`App.test.js`** → Pruebas unitarias del componente principal.  
- **`Component.jsx`** → Componente genérico reutilizable.  
- **`Credenciales.js`** → Archivo para gestión de credenciales (ej. Firebase/Google Drive).  
- **`index.js`** → Renderiza la aplicación dentro del `root` en `index.html`.  
- **`index.css`** → Estilos globales básicos.  
- **`logo.svg`** → Logo del sistema.  
- **`pdfWorker.js`** → Configuración para procesar archivos PDF en el frontend (ejemplo: PDF.js worker).  
- **`reportWebVitals.js`** → Reporte de métricas de rendimiento (Lighthouse/Core Web Vitals).  
- **`setupTests.js`** → Configuración inicial de pruebas unitarias (Jest/Testing Library).  

---

## 📂 Otras Carpetas en Raíz

- **`uploads/`** → Carpeta para manejar archivos cargados al sistema (temporal o almacenamiento local).  
- **`node_modules/`** → Dependencias instaladas del proyecto (generado por `npm install`).  

---

## 📄 Archivos en Raíz

- **`.env`** → Variables de entorno (ejemplo: claves de Firebase, APIs, Google Drive).  
- **`.gitignore`** → Archivos y carpetas que no se suben al repositorio Git.  
- **`credentials-drive.json`** → Credenciales de configuración para integración con Google Drive.  
- **`package.json`** → Dependencias, scripts y configuración del proyecto.  
- **`package-lock.json`** → Versión exacta de dependencias instaladas (control de builds).  
- **`README.md`** → Introducción y guía rápida del proyecto.  

---

## ✅ Buenas Prácticas en la Estructura

1. Mantener **separación de responsabilidades** (componentes, estilos, páginas, layouts).  
2. Usar **nombres significativos** en carpetas y archivos.  
3. Centralizar configuración global en `Default.css` y variables en `.env`.  
4. Documentar cambios en `docs/` para nuevos desarrolladores.  
5. Usar **tests unitarios** (`App.test.js`, `setupTests.js`) para validar componentes críticos.  

---

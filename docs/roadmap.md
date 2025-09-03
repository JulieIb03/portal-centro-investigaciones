# Roadmap 

Este documento describe la hoja de ruta para el desarrollo, mejora y mantenimiento del portal.  
El objetivo es tener una guía clara y compartida del progreso del proyecto.

---

## ✅ Estado Actual
- Proyecto base creado en **React (Vite)** y desplegado en **Vercel**.
- Conexión inicial a **Firebase** (Firestore y Authentication).
- Estructura de carpetas organizada (`src`, `components`, `pages`, `docs`).
- Roles básicos definidos: **👨‍🏫 Docente** y **📝 Revisor**.
- Inicio de documentación en `docs/`.

---

## 📌 Corto plazo (1-3 semanas)

- **Mejorar la retroalimentación visual** del reenvío de documentos, mostrando el cambio de estado inmediato.  
- **Ajustar la visualización de los comentarios** para que respeten formato y saltos de línea.  
- **Añadir opción** para indicar que un documento no se posee en el momento del envío.  
- **Incluir loaders** en la revisión de documentos para indicar que el archivo está cargando.  

---

## 📌 Mediano plazo (1-3 meses)

- **Simplificar el flujo de navegación del revisor** con botones de anterior/siguiente entre documentos.  
- **Diferenciar visualmente los documentos** corregidos de los ya aprobados.  
- **Unificar edición de vinculaciones**, de forma que un solo botón permita editar/eliminar vinculaciones y subvinculaciones.  
- **Agregar íconos y resaltar observaciones** en la interfaz del docente para facilitar la lectura.  

---

## 📌 Largo plazo (6-12 meses)

- **Incorporar un chat interno** entre revisor y docente para resolver dudas en tiempo real.  
- **Desarrollar un manual interactivo** o sistema de ayuda integrado en la plataforma, con instrucciones y *hints* contextuales.  
- **Permitir la revisión simultánea** de documentos para el revisor.  

---

## 📅 Estrategia de implementación

- Se priorizarán primero las funcionalidades de **retroalimentación y usabilidad inmediata** (corto plazo).  
- Posteriormente se enfocará en **optimizar los flujos de navegación y diferenciación visual** (mediano plazo).  
- Finalmente, se avanzará hacia **funciones colaborativas y de soporte interactivo** (largo plazo).  

---

## 🌱 Futuro (ideas por explorar)
- Autenticación federada (Google, Microsoft).
- Internacionalización (i18n) para varios idiomas.
- Migración a **Next.js** si se requieren páginas estáticas/dinámicas.
- Uso de **IA para revisión automática** de documentos.

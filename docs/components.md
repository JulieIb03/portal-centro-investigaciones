# Componentes de la Aplicación

Este documento describe los componentes generales que estructuran y dan funcionalidad clave al portal.

---

## 🔝 Header.jsx

El componente **Header** es la barra superior de navegación que se muestra en todas las vistas principales de la aplicación. Sus funciones principales son:  

- **Botón de volver atrás**: permite regresar a la vista anterior usando el historial de navegación.  
- **Logo UMNG**: enlaza directamente al **Dashboard**.  
- **Menú de usuario**:
  - Muestra el nombre del usuario autenticado (`user?.nombre`).
  - Contiene un menú desplegable con opciones:
    - 👉 Para **revisores**: acceso a *Gestionar vinculaciones*.  
    - 👉 Para todos los usuarios: opción de *Cerrar sesión*.  
- **Responsividad**: incluye lógica para abrir/cerrar el menú desplegable y cerrarlo automáticamente si se hace clic fuera del mismo.  

Este componente gestiona la **navegación principal y el acceso rápido a funciones del usuario** autenticado.  

---

## 📤 Subida.jsx (SubidaDocumentos)

El componente **SubidaDocumentos** es un formulario avanzado que permite a los usuarios **crear nuevas postulaciones** o **reenviar documentos corregidos**. Sus responsabilidades son:  

- **Carga dinámica de datos**:
  - Obtiene desde Firestore las vinculaciones, subvinculaciones y documentos requeridos.  
  - Identifica si la postulación es nueva o un reenvío.  

- **Gestión de archivos**:
  - Valida que los documentos sean **PDFs menores a 5 MB**.  
  - Renombra automáticamente los archivos con el nombre del documento esperado.  
  - Realiza la subida a **Google Drive** mediante el endpoint `/api/upload`.  
  - Maneja barra de progreso de subida en tiempo real.  

- **Flujo de postulación**:
  - **Nueva postulación**:
    - Crea un nuevo registro en la colección `postulaciones`.  
    - Notifica automáticamente a todos los revisores por correo.  
  - **Reenvío**:
    - Conserva los documentos aprobados de revisiones previas.  
    - Solo solicita documentos no aprobados.  
    - Notifica al revisor de la última revisión.  

- **Experiencia de usuario**:
  - Muestra mensajes de error claros si faltan documentos o hay fallas en la subida.  
  - Incluye un botón de cierre (`onClose`) que se usa cuando el formulario se despliega como modal.  

Este componente es el **núcleo del flujo de postulaciones**, integrando validaciones, gestión documental y notificaciones automáticas.  

---

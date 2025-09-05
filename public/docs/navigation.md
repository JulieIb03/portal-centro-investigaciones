# Guía de Navegación 

Se describen las rutas y pantallas principales de la aplicación, junto con los **roles de usuario** y sus funciones dentro del sistema.

---

## 📂 Rutas y Páginas

### Rutas Públicas

Estas rutas no requieren autenticación:

- `/` → **Login**  
  Pantalla inicial para que el usuario acceda con sus credenciales.  

- `/registro` → **Registro**  
  Permite a nuevos usuarios docentes crear una cuenta en el sistema.  

- `/logout` → **Logout**  
  Cierra la sesión activa del usuario.  

### Rutas Protegidas

Estas rutas requieren estar autenticado y tener el rol adecuado:

- `/dashboard` → **Dashboard**  
  Página principal a la que acceden los usuarios autenticados según su rol, allí se puden ver y filtrar las postulaciones existentes asi como el estado de cada una. 

- `/EditarDocumentos` → **Editar Documentos**  
  Permite la gestión de documentos vinculados a cada tipo de postulación. Solo visible para el rol "revisor".

- `/detalle/:id` → **Detalle de Postulación**  
  Vista detallada de una postulación específica (por ID).  

- `/revision/:id` → **Revisión**  
  Pantalla de revisión de documentos y estado de la postulación. Solo visible para el rol "revisor".  

---

## 👥 Roles y Funciones

### Docente
- Se registra y accede al sistema para **crear postulaciones**.  
- Puede **subir documentos requeridos** según la convocatoria.  
- Revisa el **estado de sus postulaciones** (pendiente, en revisión, aprobado, rechazado).  
- Edita o actualiza los documentos mientras la postulación no haya sido cerrada.  

### Revisor
- Accede al **panel de revisión** para evaluar las postulaciones enviadas por los docentes.  
- Puede **aprobar o solicitar correcciones** en los documentos de cada postulación.  
- Supervisa el cumplimiento de los requisitos establecidos en la convocatoria.  
- Garantiza la **validez y transparencia del proceso** de postulación.  
- **Edita, agrega o elimina** las vinculaciones y subvinculaciones existentes.

---

## 🔒 Seguridad y Acceso

- Las rutas `/dashboard`, `/EditarDocumentos`, `/detalle/:id` y `/revision/:id` están **protegidas** mediante `ProtectedRoute`.  
- Solo usuarios autenticados y con el rol adecuado pueden acceder a ellas.  

---

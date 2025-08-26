# Configuración del Firestore

Este documento describe la estructura de colecciones en **Firestore** para el Portal del Centro de Investigaciones, junto con las **reglas de seguridad** implementadas.

---

## 1. Colecciones principales

- ### 📝 documentosRequeridos
    Contiene los documentos que se deben presentar dependiendo de la vinculación o subvinculación.

    **Ejemplo de estructura:**
    ```json
    {
    "documentos": [
        "Convocatoria de vinculación",
        "Resultados de la convocatoria",
        "Certificación de registro académico",
        "Carta de presentación y autodeclaración"
    ]
    }
    ```

- ### 📑 postulaciones
    Representa las postulaciones realizadas por los docentes.
    Cada postulación está vinculada a un docente (usuarioId) y a una vinculación/subvinculación.

    **Ejemplo de estructura:**
    ```json
    {
    "codigoProyecto": "INV-ING-4048",
    "documentos": {
        "Certificados Académicos (actas de grado-diplomas)": {
        "fechaSubida": "2025-08-22T15:23:20.380Z",
        "nombre": "Certificados Académicos (actas de grado-diplomas).pdf",
        "url": "https://drive.google.com/file/d/.../preview"
        },
        "Concertación de entregables IN-IV-F-26": {
        "fechaSubida": "2025-08-22T15:54:44.536Z",
        "nombre": "Concertación de entregables IN-IV-F-26.pdf",
        "url": "https://drive.google.com/file/d/.../preview"
        },
        "Formato de Confidencialidad de la UMNG": {
        "fechaSubida": "2025-08-22T15:55:31.623Z",
        "nombre": "Formato de Confidencialidad de la UMNG.pdf",
        "url": "https://drive.google.com/file/d/.../preview"
        }
    },
    "estado": "Aprobado",
    "fechaActualizacion": "2025-08-22T10:56:50-05:00",
    "fechaCreacion": "2025-08-22T10:25:08-05:00",
    "id": "9XE72memDH0Qm1ukCt7p",
    "nombrePostulante": "Julie Ibarra",
    "revisionIds": ["PnCDilJIRqgw2uZpFvVM", "H5OIKPBTh7UK0n7ug6UV"],
    "revisiones": 2,
    "subvinculacion": "Asistente de Investigación",
    "tipoVinculacion": "Contrato OPS",
    "usuarioId": "6P0hu4PhV8Y2kUvqxg1Jxo6AH9m1"
    }
    ```

- ### 🔍 revisiones

    Guarda las revisiones realizadas a cada postulación, con su estado final y comentarios por documento.

    **Ejemplo de estructura:**

    ```json
    {
    "codigoProyecto": "INV-ING-4048",
    "comentarios": {
        "Certificados Académicos (actas de grado-diplomas)": "Aprobado",
        "Concertación de entregables IN-IV-F-26": "Aprobado",
        "Formato de Confidencialidad de la UMNG": "Aprobado",
        "Formato de Solicitud orden y/o Contrato": "Aprobado",
        "Formato Único de Hoja de Vida (DAFP)": "Aprobado",
        "Fotocopia de RUT actualizado": "Aprobado",
        "Fotocopia de certificados laborales": "Aprobado",
        "Fotocopia de la cédula de ciudadanía ampliada al 150%": "Aprobado",
        "Fotocopia de la libreta militar (si aplica)": "Aprobado"
    },
    "estadoFinal": "Aprobado",
    "fechaRevision": "2025-08-22T16:01:33.585Z",
    "nombrePostulante": "Omar Alexander Rozo Torres",
    "numeroRevision": 2,
    "postulacionId": "9XE72memDH0Qm1ukCt7p",
    "revisorId": "DARLSmh1M2RFmj85PvfOc3ag3L02",
    "revisorNombre": "Centro de Investigaciones"
    }
    ```

- ### 👥 usuarios

    Contiene información extendida de los usuarios del sistema (además de lo guardado en Authentication).
    Define el rol del usuario en el portal asi como su nombre.

    **Ejemplo de estructura:**

    ```json
    {
    "correo": "julie@docente.com",
    "fechaRegistro": "2025-06-19T17:19:51-05:00",
    "nombre": "Julie Docente",
    "rol": "docente"
    }
    ```

- ### 🔗 vinculaciones

    Define las vinculaciones principales y sus tipos/subvinculaciones.

    **Ejemplo de estructura:**

    ```json
    {
    "tipos": [
        "Proceso de Renovación",
        "Proceso Nuevo"
    ]
    }
    ```

---

## 2. Reglas de Seguridad (Firestore Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ──────── USUARIOS ────────
    match /usuarios/{userId} {
      // Lectura permitida al propio usuario, revisores o docentes
      allow read: if request.auth != null && (
        request.auth.uid == userId ||
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol in ["docente", "revisor"]
      );

      // Escritura solo al propio usuario
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // ──────── POSTULACIONES ────────
    match /postulaciones/{postulacionId} {
      // Crear solo docentes
      allow create: if request.auth != null &&
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == "docente";

      // Leer una postulación específica
      allow get: if request.auth != null && (
        // Revisores pueden leer todo
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == "revisor" ||
        // Docentes solo si es su propia postulación
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == "docente" &&
        get(/databases/$(database)/documents/postulaciones/$(postulacionId)).data.usuarioId == request.auth.uid
      );

      // Listar postulaciones
      allow list: if request.auth != null && (
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol in ["docente", "revisor"]
      );

      // Actualizar postulaciones
      allow update: if request.auth != null && (
        (
          // Docente solo puede actualizar documentos y fecha
          get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == "docente" &&
          resource.data.usuarioId == request.auth.uid &&
          request.resource.data.diff(resource.data).affectedKeys().hasOnly([
            "documentos",
            "fechaActualizacion"
          ])
        ) ||
        (
          // Revisor solo puede actualizar estado y revisiones
          get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == "revisor" &&
          request.resource.data.diff(resource.data).affectedKeys().hasOnly([
            "estado", "revisiones", "revisionIds"
          ])
        )
      );

      // Nadie puede eliminar
      allow delete: if false;
    }

    // ──────── REVISIONES GLOBALES ────────
    match /revisiones/{revisionId} {
      allow create: if request.auth != null &&
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == "revisor";
      
      allow read: if request.auth != null && (
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == "revisor" ||
        (
          get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == "docente" &&
          get(/databases/$(database)/documents/postulaciones/$(resource.data.postulacionId)).data.usuarioId == request.auth.uid
        )
      );
      
      allow update: if request.auth != null &&
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == "revisor";
    }

    // ──────── REVISIONES SUBCOLECCIÓN ────────
    match /postulaciones/{postulacionId}/revisiones/{revisionId} {
      allow read: if request.auth != null && (
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == "revisor" ||
        get(/databases/$(database)/documents/postulaciones/$(postulacionId)).data.usuarioId == request.auth.uid
      );

      allow write: if request.auth != null && (
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == "revisor" ||
        (
          get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == "docente" &&
          request.method == "create" &&
          request.resource.data.usuarioId == request.auth.uid
        )
      );
    }

    // ──────── VINCULACIONES ────────
    match /vinculaciones/{vinculacionId} {
      allow read: if request.auth != null &&
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol in ["revisor", "docente"];

      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == "revisor";
    }

    // ──────── DOCUMENTOS REQUERIDOS ────────
    match /documentosRequeridos/{tipoVinculacion} {
      allow read: if request.auth != null &&
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol in ["revisor", "docente"];

      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == "revisor";
    }
  }
}
```

El sistema implementa un control de acceso basado en roles con permisos específicos para cada tipo de usuario. Los **docentes** pueden crear y actualizar sus propias postulaciones, consultar sus datos personales, documentos requeridos, vinculaciones y revisiones asociadas a sus solicitudes. Los **revisores**, por otro lado, tienen acceso ampliado para leer y listar todas las postulaciones, crear y actualizar revisiones, modificar estados de postulaciones, así como gestionar configuraciones de documentos y vinculaciones. Cabe destacar que el sistema mantiene restricciones estrictas, donde ningún usuario puede eliminar postulaciones, siguiendo un esquema de control que garantiza la integridad de los datos: los docentes se encargan de la carga documental mientras los revisores validan y gestionan el flujo de aprobación.
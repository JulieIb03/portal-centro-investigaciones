import React, { useState, useEffect } from "react";
import "../styles/Default.css";
import "../styles/components/Subida.css";
import { db } from "../Credenciales";
import { doc, setDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "./Auth/AuthProvider";

// Constantes fuera del componente para evitar ciclos infinitos
const opcionesSubvinculacion = {
  contrato_ops: ["Asistente de Investigación", "Joven Investigador"],
  asistente_graduado: ["Proceso Nuevo", "Proceso de Renovación"],
  estudiantes: ["Auxiliar de Pregrado", "Auxiliar de Posgrado"],
};

const documentosRequeridos = {
  "Asistente de Investigación": [
    "Formato de Solicitud orden y/o Contrato",
    "Concertación de entregables IN-IV-F-26",
    "Formato Único de Hoja de Vida (DAFP)",
    "Fotocopia de la cédula de ciudadanía ampliada al 150%",
    "Fotocopia de la libreta militar (si aplica)",
    "Fotocopia de certificados laborales",
    "Certificados Académicos (actas de grado-diplomas)",
    "Fotocopia de RUT actualizado",
    "Formato de Confidencialidad de la UMNG",
  ],
  "Joven Investigador": [
    "Acta de pregrado (Máximo 2 años de egreso)",
    "Copia de la cédula ampliada al 150% (Menor de 28 años)",
    "Certificado de participación en semilleros o proyectos",
    "Carta de compromiso de no estar en otro proyecto",
  ],
  "Proceso Nuevo": [
    "Convocatoria de vinculación",
    "Resultados de la convocatoria",
    "Recibo de matrícula",
    "Carta de presentación del líder del proyecto",
    "Certificado de notas (mínimo 3.6 o 4.0 según avance)",
  ],
  "Proceso de Renovación": [
    "Recibo de matrícula",
    "Informe semestral de actividades",
    "Evaluación del docente-tutor",
    "Certificado de notas (mínimo 4.0)",
  ],
  "Auxiliar de Pregrado": [
    "Convocatoria de vinculación",
    "Resultados de la convocatoria",
    "Certificación de estudios (mínimo 70% del programa)",
    "Carta de presentación",
    "Fotocopia de cédula",
  ],
  "Auxiliar de Posgrado": [
    "Convocatoria de vinculación",
    "Resultados de la convocatoria",
    "Certificación de registro académico",
    "Carta de presentación y autodeclaración",
  ],
};

const SubidaDocumentos = ({
  codigoProyecto: codigoInicial = "",
  nombrePostulante: nombreInicial = "",
  tipoVinculacion: tipoVinculacionInicial = "",
  subvinculacion: subvinculacionInicial = "",
  onClose,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const esReenvio = !!(
    codigoInicial ||
    nombreInicial ||
    tipoVinculacionInicial ||
    subvinculacionInicial
  );

  const [formData, setFormData] = useState({
    codigoProyecto: codigoInicial,
    nombrePostulante: nombreInicial,
    tipoVinculacion: tipoVinculacionInicial,
    subvinculacion: subvinculacionInicial,
    estado: esReenvio ? "En corrección" : "Pendiente",
    revisiones: esReenvio ? 1 : 0,
    fechaCreacion: serverTimestamp(),
    fechaActualizacion: serverTimestamp(),
    usuarioId: user?.uid,
    documentos: {},
  });

  const [subvinculaciones, setSubvinculaciones] = useState([]);
  const [documentos, setDocumentos] = useState([]);

  useEffect(() => {
    if (formData.tipoVinculacion) {
      setSubvinculaciones(
        opcionesSubvinculacion[formData.tipoVinculacion] || []
      );
    } else {
      setSubvinculaciones([]);
    }
  }, [formData.tipoVinculacion]);

  useEffect(() => {
    if (formData.subvinculacion) {
      setDocumentos(documentosRequeridos[formData.subvinculacion] || []);
    } else {
      setDocumentos([]);
    }
  }, [formData.subvinculacion]);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["application/pdf"];

  const handleArchivo = async (e, nombreDocumento) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError("El archivo no debe exceder los 5MB");
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Solo se permiten archivos PDF");
      return;
    }

    setLoading(true);
    setError(null);

    const formDataCloud = new FormData();
    formDataCloud.append("file", file);
    formDataCloud.append("upload_preset", "portal_umng_uploads");
    formDataCloud.append("folder", "portal_umng/postulaciones");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dchkzapvx/upload`,
        {
          method: "POST",
          body: formDataCloud,
        }
      );

      const data = await response.json();

      if (!data.secure_url || !data.public_id) {
        throw new Error(
          "La subida a Cloudinary no retornó la información esperada."
        );
      }

      setFormData((prev) => ({
        ...prev,
        documentos: {
          ...prev.documentos,
          [nombreDocumento]: {
            nombre: file.name,
            url: data.secure_url,
            public_id: data.public_id,
            fechaSubida: new Date().toISOString(),
          },
        },
      }));
    } catch (error) {
      console.error("Error al subir archivo:", error);
      setError("Error al subir el archivo. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const documentosFaltantes = documentos.filter(
        (doc) => !formData.documentos[doc]
      );

      if (documentosFaltantes.length > 0) {
        setError(`Faltan documentos: ${documentosFaltantes.join(", ")}`);
        setLoading(false);
        return;
      }

      let postulacionId;

      if (esReenvio) {
        postulacionId = codigoInicial;
        // Actualizar estado y contador de revisiones
        await setDoc(
          doc(db, "postulaciones", postulacionId),
          {
            fechaActualizacion: serverTimestamp(),
            estado: "En corrección",
            revisiones: formData.revisiones + 1,
          },
          { merge: true }
        );
      } else {
        const nuevaPostRef = doc(collection(db, "postulaciones"));
        postulacionId = nuevaPostRef.id;

        await setDoc(nuevaPostRef, {
          ...formData,
          id: postulacionId,
          fechaCreacion: serverTimestamp(),
          fechaActualizacion: serverTimestamp(),
          estado: "Pendiente",
          revisiones: 0,
        });
      }

      // Guardar documentos en una nueva revisión
      const nuevaRevisionRef = doc(
        collection(db, `postulaciones/${postulacionId}/revisiones`)
      );

      await setDoc(nuevaRevisionRef, {
        numeroRevision: esReenvio ? formData.revisiones + 1 : 0,
        documentos: formData.documentos,
        fechaRevision: serverTimestamp(),
        estado: "En revisión",
      });
    } catch (error) {
      console.error("Error al guardar la postulación:", error);
      setError("Error al guardar la postulación. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
    onClose();
  };

  return (
    <div className="form-container">
      <h2>{esReenvio ? "Reenvío de documentos" : "Nueva postulación"}</h2>
      {error && <div className="error-message">{error}</div>}

      <form className="subidaForm" onSubmit={handleSubmit}>
        <label htmlFor="codigoProyecto">Código del Proyecto:</label>
        <input
          type="text"
          id="codigoProyecto"
          name="codigoProyecto"
          value={formData.codigoProyecto}
          onChange={handleChange}
          required
          disabled={esReenvio}
        />

        <label htmlFor="tipoVinculacion">Tipo de vinculación:</label>
        <select
          id="tipoVinculacion"
          name="tipoVinculacion"
          value={formData.tipoVinculacion}
          onChange={handleChange}
          required
          disabled={esReenvio}
        >
          <option value="">Seleccione</option>
          <option value="contrato_ops">Contrato OPS</option>
          <option value="asistente_graduado">Asistente Graduado</option>
          <option value="estudiantes">Estudiantes</option>
        </select>

        <label htmlFor="subvinculacion">Subcategoría:</label>
        <select
          id="subvinculacion"
          name="subvinculacion"
          value={formData.subvinculacion}
          onChange={handleChange}
          required
          disabled={esReenvio || !formData.tipoVinculacion}
        >
          <option value="">Seleccione</option>
          {subvinculaciones.map((sub, i) => (
            <option key={i} value={sub}>
              {sub}
            </option>
          ))}
        </select>

        <label htmlFor="nombrePostulante">Nombre del Postulante:</label>
        <input
          id="nombrePostulante"
          name="nombrePostulante"
          type="text"
          value={formData.nombrePostulante}
          onChange={handleChange}
          required
          disabled={esReenvio}
        />

        <div id="documentosContainer">
          <h3>Documentos Requeridos</h3>
          <div id="documentosLista">
            {documentos.map((doc, i) => (
              <div key={i} style={{ margin: "10px 0" }}>
                <label>{doc}</label>
                <input
                  type="file"
                  onChange={(e) => handleArchivo(e, doc)}
                  disabled={loading}
                  required={!esReenvio} // En reenvíos no requerimos todos los documentos
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                {formData.documentos[doc] && (
                  <span className="file-uploaded">✓ Subido</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Procesando..." : esReenvio ? "Reenviar" : "Enviar"}
        </button>
      </form>
    </div>
  );
};

export default SubidaDocumentos;

import React, { useState, useEffect } from "react";
import "../styles/Default.css";
import "../styles/components/Subida.css";
import { db } from "../Credenciales";
import {
  doc,
  setDoc,
  collection,
  serverTimestamp,
  getDoc,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { useAuth } from "./Auth/AuthProvider";

// // Constantes fuera del componente para evitar ciclos infinitos
// const opcionesSubvinculacion = {
//   contrato_ops: ["Asistente de Investigación", "Joven Investigador"],
//   asistente_graduado: ["Proceso Nuevo", "Proceso de Renovación"],
//   estudiantes: ["Auxiliar de Pregrado", "Auxiliar de Posgrado"],
// };

// const documentosRequeridos = {
//   "Asistente de Investigación": [
//     "Formato de Solicitud orden y/o Contrato",
//     "Concertación de entregables IN-IV-F-26",
//     "Formato Único de Hoja de Vida (DAFP)",
//     "Fotocopia de la cédula de ciudadanía ampliada al 150%",
//     "Fotocopia de la libreta militar (si aplica)",
//     "Fotocopia de certificados laborales",
//     "Certificados Académicos (actas de grado-diplomas)",
//     "Fotocopia de RUT actualizado",
//     "Formato de Confidencialidad de la UMNG",
//   ],
//   "Joven Investigador": [
//     "Acta de pregrado (Máximo 2 años de egreso)",
//     "Copia de la cédula ampliada al 150% (Menor de 28 años)",
//     "Certificado de participación en semilleros o proyectos",
//     "Carta de compromiso de no estar en otro proyecto",
//   ],
//   "Proceso Nuevo": [
//     "Convocatoria de vinculación",
//     "Resultados de la convocatoria",
//     "Recibo de matrícula",
//     "Carta de presentación del líder del proyecto",
//     "Certificado de notas (mínimo 3.6 o 4.0 según avance)",
//   ],
//   "Proceso de Renovación": [
//     "Recibo de matrícula",
//     "Informe semestral de actividades",
//     "Evaluación del docente-tutor",
//     "Certificado de notas (mínimo 4.0)",
//   ],
//   "Auxiliar de Pregrado": [
//     "Convocatoria de vinculación",
//     "Resultados de la convocatoria",
//     "Certificación de estudios (mínimo 70% del programa)",
//     "Carta de presentación",
//     "Fotocopia de cédula",
//   ],
//   "Auxiliar de Posgrado": [
//     "Convocatoria de vinculación",
//     "Resultados de la convocatoria",
//     "Certificación de registro académico",
//     "Carta de presentación y autodeclaración",
//   ],
// };

const SubidaDocumentos = ({
  postulacionId: postulacionId = "",
  codigoProyecto: codigoInicial = "",
  nombrePostulante: nombreInicial = "",
  tipoVinculacion: tipoVinculacionInicial = "",
  subvinculacion: subvinculacionInicial = "",
  documentosPostulacion = {},
  ultimaRevisionId = null,
  onClose,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ultimaRevision, setUltimaRevision] = useState(null);

  const [opcionesSubvinculacion, setOpcionesSubvinculacion] = useState({});
  const [documentosRequeridos, setDocumentosRequeridos] = useState({});

  const esReenvio = !!postulacionId;

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

  //Obtener las vinculaciones con sus subvinculaciones
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener vinculaciones
        const vinculacionesSnapshot = await getDocs(
          collection(db, "vinculaciones")
        );
        const vinculacionesData = {};
        vinculacionesSnapshot.forEach((doc) => {
          vinculacionesData[doc.id] = doc.data().tipos || [];
        });
        setOpcionesSubvinculacion(vinculacionesData);

        // Obtener documentos requeridos
        const documentosSnapshot = await getDocs(
          collection(db, "documentosRequeridos")
        );
        const documentosData = {};
        documentosSnapshot.forEach((doc) => {
          documentosData[doc.id] = doc.data().documentos || [];
        });
        setDocumentosRequeridos(documentosData);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    fetchData();
  }, []);

  // Obtener la última revisión cuando es reenvío
  useEffect(() => {
    const obtenerUltimaRevision = async () => {
      if (!esReenvio || !codigoInicial || !ultimaRevisionId) {
        return;
      }

      console.log(
        "ID de última revisión que se intentará consultar:",
        ultimaRevisionId
      ); // 👈 Mostrar ID

      try {
        const revisionRef = doc(db, `/revisiones`, ultimaRevisionId);
        const revisionSnap = await getDoc(revisionRef);

        if (revisionSnap.exists()) {
          const revisionData = revisionSnap.data();
          setUltimaRevision(revisionData);

          // Procesar documentos aprobados y no aprobados
          const documentosCombinados = {};

          // 1. Documentos aprobados
          if (revisionData.comentarios) {
            Object.entries(revisionData.comentarios).forEach(
              ([docNombre, estado]) => {
                if (estado === "Aprobado") {
                  // Buscar el documento en la postulación o en la revisión
                  const docData =
                    documentosPostulacion[docNombre] ||
                    revisionData.documentos?.[docNombre];
                  if (docData) {
                    documentosCombinados[docNombre] = docData;
                  }
                }
              }
            );
          }

          // 2. Agregar documentos no aprobados pero existentes
          Object.entries(documentosPostulacion).forEach(
            ([docNombre, docData]) => {
              if (
                !documentosCombinados[docNombre] &&
                (!revisionData.comentarios ||
                  revisionData.comentarios[docNombre] !== "Aprobado")
              ) {
                documentosCombinados[docNombre] = docData;
              }
            }
          );

          setFormData((prev) => ({
            ...prev,
            documentos: documentosCombinados,
          }));
        }
      } catch (error) {
        console.error("Error al obtener última revisión:", error);
      }
    };

    obtenerUltimaRevision();
  }, [esReenvio, codigoInicial, ultimaRevisionId, documentosPostulacion]);

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
      // documentosRequeridos viene del snapshot de Firestore
      setDocumentos(documentosRequeridos[formData.subvinculacion] || []);
    } else {
      setDocumentos([]);
    }
  }, [formData.subvinculacion, documentosRequeridos]);

  const documentoEstaAprobado = (nombreDocumento) => {
    return ultimaRevision?.comentarios?.[nombreDocumento] === "Aprobado";
  };

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["application/pdf"];

  const handleArchivo = async (e, nombreDocumento) => {
    if (documentoEstaAprobado(nombreDocumento)) return;

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

    const formDataArchivo = new FormData();
    formDataArchivo.append("file", file);
    formDataArchivo.append("codigoProyecto", formData.codigoProyecto);
    formDataArchivo.append("usuarioEmail", user.nombre);
    formDataArchivo.append("nombrePostulante", formData.nombrePostulante);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataArchivo,
      });

      const data = await response.json();

      if (!data.success || !data.embedLink) {
        throw new Error("La subida a Google Drive falló.");
      }

      setFormData((prev) => ({
        ...prev,
        documentos: {
          ...prev.documentos,
          [nombreDocumento]: {
            nombre: file.name,
            url: data.embedLink, // 👈 usar el embedLink directamente
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
    console.log("🧪 esReenvio:", esReenvio);
    console.log("📄 Documentos actuales:", formData.documentos);

    e.preventDefault();
    setLoading(true);
    setError(null); // Limpiar errores anteriores

    try {
      // Validación de documentos faltantes (solo los no aprobados)
      const documentosFaltantes = documentos.filter(
        (doc) => !formData.documentos[doc] && !documentoEstaAprobado(doc)
      );

      if (documentosFaltantes.length > 0) {
        setError(
          `Faltan documentos requeridos: ${documentosFaltantes.join(", ")}`
        );
        setLoading(false);
        return;
      }

      if (esReenvio) {
        // ─── REENVIO DE DOCUMENTOS ───
        const postulacionRef = doc(db, "postulaciones", postulacionId);

        console.log("🔄 Reenvío activado");
        console.log("📄 ID postulación objetivo:", codigoInicial);
        console.log("👤 UID del usuario autenticado:", user?.uid);
        console.log("📄 Documentos a subir:", formData.documentos);

        // 1. Filtrar solo los documentos que fueron modificados (nuevos o actualizados)
        const documentosActualizados = {};
        Object.entries(formData.documentos).forEach(([docNombre, docData]) => {
          // Solo incluir documentos que no estaban aprobados o que son nuevos
          if (!documentoEstaAprobado(docNombre)) {
            documentosActualizados[docNombre] = docData;
          }
        });

        // 2. Actualizar solo los documentos modificados en la postulación principal
        await setDoc(
          postulacionRef,
          {
            fechaActualizacion: serverTimestamp(),
            documentos: documentosActualizados,
          },
          { merge: true }
        );

        //Notificación por correo de resubida
        const revisorId = ultimaRevision?.revisorId;

        if (!revisorId) {
          console.log("❌ No se encontró el revisor de la última revisión.");
        } else {
          try {
            const revisorDoc = await getDoc(doc(db, "usuarios", revisorId));
            if (!revisorDoc.exists()) {
              console.log(`❌ No se encontró el usuario con ID: ${revisorId}`);
            } else {
              const revisor = revisorDoc.data();

              const res = await fetch("/api/sendEmail", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  to: revisor.correo,
                  subject: `📄 Documentos corregidos - Proyecto ${formData.codigoProyecto}`,
                  template: "plantillaReenvio",
                  variables: {
                    NOMBRE_REVISOR: revisor.nombre || "Revisor",
                    NOMBRE_POSTULANTE: formData.nombrePostulante,
                    CODIGO_PROYECTO: formData.codigoProyecto,
                    TIPO_VINCULACION: formData.tipoVinculacion,
                    TIPO_CONTRATO: formData.subvinculacion,
                    FECHA_POSTULACION: new Date().toLocaleDateString(),
                    FECHA_REVISION: new Date().toLocaleDateString(),
                    NOMBRE_DOCENTE: user.nombre || "Docente responsable",
                  },
                }),
              });

              if (!res.ok) {
                const errorText = await res.text();
                console.error(
                  `Error al enviar correo a ${revisor.correo}:`,
                  errorText
                );
              } else {
                console.log(`✅ Correo enviado a ${revisor.correo}`);
              }
            }
          } catch (error) {
            console.error("Error al obtener revisor o enviar correo:", error);
          }
        }
      } else {
        // ─── NUEVA POSTULACIÓN ───
        const nuevaPostRef = doc(collection(db, "postulaciones"));
        const postulacionId = nuevaPostRef.id;

        // Crear documento principal
        await setDoc(nuevaPostRef, {
          ...formData,
          id: postulacionId,
          fechaCreacion: serverTimestamp(),
          fechaActualizacion: serverTimestamp(),
          estado: "Pendiente",
          revisiones: 0,
          revisionIds: [], // Inicializar array de IDs de revisiones
        });

        //Notificación por correo
        console.log("📌 Buscando usuarios con rol 'revisor'...");
        const usuariosRef = collection(db, "usuarios");

        const q = query(usuariosRef, where("rol", "==", "revisor"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log("❌ No se encontraron usuarios con rol 'revisor'");
        } else {
          console.log("✅ Usuarios con rol 'revisor' encontrados:");
          const revisores = [];
          querySnapshot.forEach((doc) => {
            const usuario = doc.data();
            console.log(
              `- ${usuario.nombre || "Sin nombre"} (${
                usuario.correo || "Sin correo"
              })`
            );

            if (usuario.correo) {
              revisores.push({
                id: doc.id,
                nombre: usuario.nombre || "Revisor",
                correo: usuario.correo,
              });
            }
          });

          console.log(`📧 Total de revisores encontrados: ${revisores.length}`);
          console.log("👤 Lista completa de revisores:", revisores);

          // Enviar correos en paralelo
          await Promise.all(
            revisores.map(async (revisor) => {
              try {
                const res = await fetch("/api/sendEmail", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    to: revisor.correo,
                    subject: `📝 Nueva postulación - Proyecto ${formData.codigoProyecto}`,
                    template: "plantillaNuevaPostulacion",
                    variables: {
                      NOMBRE_REVISOR: revisor.nombre,
                      NOMBRE_POSTULANTE: formData.nombrePostulante,
                      CODIGO_PROYECTO: formData.codigoProyecto,
                      TIPO_VINCULACION: formData.tipoVinculacion,
                      TIPO_CONTRATO: formData.subvinculacion,
                      FECHA_POSTULACION: new Date().toLocaleDateString(),
                      FECHA_REVISION: new Date().toLocaleDateString(),
                      NOMBRE_DOCENTE: user.nombre || "Docente responsable",
                    },
                  }),
                });

                if (!res.ok) {
                  const errorText = await res.text();
                  console.error(
                    `Error al enviar correo a ${revisor.correo}:`,
                    errorText
                  );
                } else {
                  console.log(`✅ Correo enviado a ${revisor.correo}`);
                }
              } catch (error) {
                console.error(
                  `Error al enviar correo a ${revisor.correo}:`,
                  error
                );
              }
            })
          );
        }
      }

      // Cerrar modal solo si todo fue exitoso
      onClose();
    } catch (error) {
      console.error("Error en el proceso:", error);
      setError(
        error.message || "Error al procesar la solicitud. Intente nuevamente."
      );
    } finally {
      setLoading(false);
    }
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
          {Object.keys(opcionesSubvinculacion).map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
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
          {subvinculaciones.map((sub) => (
            <option key={sub} value={sub}>
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
            {documentos.map((docNombre, i) => {
              const aprobado = documentoEstaAprobado(docNombre);
              const docData = formData.documentos[docNombre];

              return (
                <div key={i} style={{ margin: "10px 0" }}>
                  <label>{docNombre}</label>
                  {aprobado ? (
                    <div className="documento-aprobado">
                      ✓ {docData?.nombre || "Documento aprobado"}
                      {docData?.url && (
                        <a
                          href={docData.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ marginLeft: "10px", color: "#1a73e8" }}
                        >
                          (Ver documento)
                        </a>
                      )}
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        onChange={(e) => handleArchivo(e, docNombre)}
                        disabled={loading || aprobado}
                        required={!esReenvio && !aprobado}
                        accept=".pdf"
                      />
                      {docData && !aprobado && (
                        <span className="file-uploaded">
                          ✓ {docData.nombre}
                        </span>
                      )}
                    </>
                  )}
                </div>
              );
            })}
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

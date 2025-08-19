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
import CerrarIcon from "../assets/x.png";

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
  const [uploadProgress, setUploadProgress] = useState({});

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

    // Forzar el nombre del archivo a que sea igual al label
    const extension = file.name.split(".").pop(); // conserva extensión original
    const renamedFile = new File([file], `${nombreDocumento}.${extension}`, {
      type: file.type,
    });

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

    // Inicializar progreso
    setUploadProgress((prev) => ({ ...prev, [nombreDocumento]: 10 }));

    const formDataArchivo = new FormData();
    formDataArchivo.append("file", renamedFile);
    formDataArchivo.append("codigoProyecto", formData.codigoProyecto);
    formDataArchivo.append("usuarioEmail", user.nombre);
    formDataArchivo.append("nombrePostulante", formData.nombrePostulante);

    try {
      // Simulación de progreso antes de terminar la subida
      const fakeProgress = setInterval(() => {
        setUploadProgress((prev) => {
          const current = prev[nombreDocumento] || 0;
          if (current >= 90) {
            clearInterval(fakeProgress);
            return prev;
          }
          return { ...prev, [nombreDocumento]: current + 10 };
        });
      }, 300);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataArchivo,
      });

      clearInterval(fakeProgress);

      const data = await response.json();

      if (!data.success || !data.embedLink) {
        throw new Error("La subida a Google Drive falló.");
      }

      setFormData((prev) => ({
        ...prev,
        documentos: {
          ...prev.documentos,
          [nombreDocumento]: {
            nombre: renamedFile.name,
            url: data.embedLink, // 👈 usar el embedLink directamente
            fechaSubida: new Date().toISOString(),
          },
        },
      }));

      // Marcar progreso completado al 100%
      setUploadProgress((prev) => ({ ...prev, [nombreDocumento]: 100 }));
    } catch (error) {
      console.error("Error al subir archivo:", error);
      setError("Error al subir el archivo. Intente nuevamente.");
      setUploadProgress((prev) => ({ ...prev, [nombreDocumento]: 0 }));
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
        const usuariosRef = collection(db, "usuarios");

        const q = query(usuariosRef, where("rol", "==", "revisor"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log("❌ No se encontraron usuarios con rol 'revisor'");
        } else {
          const revisores = [];
          querySnapshot.forEach((doc) => {
            const usuario = doc.data();

            if (usuario.correo) {
              revisores.push({
                id: doc.id,
                nombre: usuario.nombre || "Revisor",
                correo: usuario.correo,
              });
            }
          });

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
      <div className="modal-header">
        <button className="close-button" onClick={onClose}>
          <img src={CerrarIcon} alt="Cerrar" className="w-6 h-6" />
        </button>
        <h2 style={{ margin: 0 }}>
          {esReenvio ? "Reenvío de documentos" : "Nueva postulación"}
        </h2>
      </div>
      <div className="modal-body">
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
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              Documentos Requeridos
              <div className="tooltip-container">
                <span className="info-icon">
                  <svg
                    fill="#0b3c4d"
                    width="20px"
                    height="20px"
                    viewBox="0 0 512 512"
                  >
                    <path d="M285.172,331.453c-12.453,13.25-20.547,18.781-26.094,18.781c-3.859,0-5.172-3.422-4.312-11.141 c2.594-20.062,17.531-84.578,21.781-107.625c4.266-19.719,3-29.953-2.562-29.953c-10.641,0-36.734,17.516-53.828,35.016 c-0.875,1.344-2.562,8.578-1.688,11.125c0,0.875,1.266,1.312,1.266,1.312c10.266-8.125,18.391-12.844,23.109-12.844 c2.109,0,2.938,3.406,1.688,9.406c-5.125,25.625-13.672,65.406-20.078,98.281c-5.984,28.672-2.172,40.188,6.812,40.188 s33.766-11.984,53.906-38.906c0.812-2.094,1.641-10.188,1.25-12.359C286.422,331.906,285.172,331.453,285.172,331.453z" />{" "}
                    <path d="M281.281,128c-7.297,0-16.25,3.414-20.516,7.703c-1.688,2.141-3.406,8.539-3.859,11.945 c0.453,7.711,2.578,11.984,6.859,14.562c2.109,1.68,16.219,0.414,19.219-1.312c5.188-3.398,9.828-10.25,10.703-18.375 c0.375-3.82-0.438-8.984-2.141-11.531C290.688,129.719,287.25,128,281.281,128z" />{" "}
                    <path d="M256,0C114.609,0,0,114.609,0,256s114.609,256,256,256s256-114.609,256-256S397.391,0,256,0z M256,472 c-119.297,0-216-96.703-216-216S136.703,40,256,40s216,96.703,216,216S375.297,472,256,472z" />{" "}
                  </svg>
                </span>
                <div className="tooltip-content">
                  <b>Lista de documentos:</b>
                  <ul>
                    {documentos.map((doc, i) => (
                      <li key={i}>{doc}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </h3>
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
                        {uploadProgress[docNombre] > 0 &&
                          uploadProgress[docNombre] < 100 && (
                            <div className="progress-bar">
                              <div
                                className="progress-bar-fill"
                                style={{
                                  width: `${uploadProgress[docNombre]}%`,
                                }}
                              ></div>
                            </div>
                          )}
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

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: "10px" }}
          >
            {loading ? "Procesando..." : esReenvio ? "Reenviar" : "Enviar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubidaDocumentos;

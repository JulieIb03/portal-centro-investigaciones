import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../layout/Header";
import { useAuth } from "../components/Auth/AuthProvider";
import { db } from "../Credenciales";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  arrayUnion,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/Revision.css";
import "../styles/components/Loader.css";

const RevisionDocumentos = () => {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [postulacion, setPostulacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDocKey, setSelectedDocKey] = useState(null);
  const [comentarios, setComentarios] = useState({});
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [documentosRevisados, setDocumentosRevisados] = useState({});
  const [revisorNombre, setRevisorNombre] = useState("");
  const [ultimaRevision, setUltimaRevision] = useState(null);
  const [bloqueados, setBloqueados] = useState({});
  const [comentariosPrevios, setComentariosPrevios] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const DotSpinner = () => (
    <div className="dot-spinner">
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
    </div>
  );

  const navigate = useNavigate();

  //Traer nombre de revisor
  useEffect(() => {
    const fetchNombreRevisor = async () => {
      if (!user?.uid) return;

      try {
        const userDocRef = doc(db, "usuarios", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setRevisorNombre(userData.nombre || "");
        }
      } catch (err) {
        console.error("Error al obtener el nombre del revisor:", err);
      }
    };

    fetchNombreRevisor();
  }, [user]);

  // Buscar la última revisión si existe
  const buscarUltimaRevision = async (postulacionData) => {
    try {
      if (
        !postulacionData.revisionIds ||
        postulacionData.revisionIds.length === 0
      ) {
        return null;
      }

      const ultimoRevisionId =
        postulacionData.revisionIds[postulacionData.revisionIds.length - 1];
      const revisionDocRef = doc(db, "revisiones", ultimoRevisionId);
      const revisionDocSnap = await getDoc(revisionDocRef);

      if (revisionDocSnap.exists()) {
        const revisionData = revisionDocSnap.data();
        setUltimaRevision(revisionData);

        // Guardar los comentarios previos
        const previos = {};
        Object.keys(revisionData.comentarios || {}).forEach((key) => {
          if (revisionData.comentarios[key] !== "Aprobado") {
            previos[key] = revisionData.comentarios[key];
          }
        });
        setComentariosPrevios(previos);

        return revisionData;
      }
      return null;
    } catch (error) {
      console.error("Error buscando última revisión:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) return;

      const docRef = doc(db, "postulaciones", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setPostulacion(data);

        // Buscar última revisión si hay revisionIds
        if (data.revisionIds && data.revisionIds.length > 0) {
          const ultimaRev = await buscarUltimaRevision(data);

          if (ultimaRev) {
            const nuevosComentarios = {};
            const nuevosRevisados = {};
            const nuevosBloqueados = {};

            Object.keys(data.documentos || {}).forEach((key) => {
              const comentario = ultimaRev.comentarios?.[key] || "";
              nuevosComentarios[key] =
                comentario && comentario !== "Aprobado"
                  ? `Comentario anterior: ${comentario}`
                  : comentario; // deja "Aprobado" tal cual
              nuevosRevisados[key] = comentario === "Aprobado";
              nuevosBloqueados[key] = comentario === "Aprobado";
            });

            setComentarios(nuevosComentarios);
            setDocumentosRevisados(nuevosRevisados);
            setBloqueados(nuevosBloqueados);

            // Seleccionar el primer documento no aprobado
            const documentosOrdenados = Object.keys(data.documentos || {}).sort(
              (a, b) => {
                const aAprobado = nuevosRevisados[a] || false;
                const bAprobado = nuevosRevisados[b] || false;
                if (aAprobado && !bAprobado) return 1;
                if (!aAprobado && bAprobado) return -1;
                return 0;
              }
            );

            setSelectedDocKey(documentosOrdenados[0]);
          }
        } else {
          // Si no hay revisiones previas, seleccionar el primer documento
          const primeraClave = Object.keys(data.documentos || {})[0];
          setSelectedDocKey(primeraClave);
        }
      }
      setLoading(false);
    };

    if (!authLoading) fetchData();
  }, [id, user, authLoading]);

  const handleComentarioChange = (e) => {
    const valor = e.target.value;
    const lineas = valor
      .split("\n")
      .map((linea) => linea.trim())
      .filter(Boolean);

    setComentarios((prev) => ({
      ...prev,
      [selectedDocKey]: lineas,
    }));
  };

  if (authLoading || loading) return <p>Cargando...</p>;
  if (!postulacion || !selectedDocKey)
    return <p>Error cargando postulación.</p>;

  const documentos = postulacion.documentos || {};
  const documentoActual = documentos[selectedDocKey] || {};

  const documentosKeys = Object.keys(documentos || {});

  const irAlAnterior = () => {
    const index = documentosKeys.indexOf(selectedDocKey);
    if (index > 0) setSelectedDocKey(documentosKeys[index - 1]);
  };

  const irAlSiguiente = () => {
    const index = documentosKeys.indexOf(selectedDocKey);
    if (index < documentosKeys.length - 1) {
      setSelectedDocKey(documentosKeys[index + 1]);
    }
  };

  // Formateo útil para campos como tipoVinculacion
  const formatVinculacion = (texto) => {
    if (!texto) return "";
    return texto
      .split("_")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  };

  const toggleDocumentoRevisado = (key) => {
    if (bloqueados[key]) return;

    const nuevoEstado = !documentosRevisados[key];

    // Actualizar estado de aprobación
    setDocumentosRevisados((prev) => ({
      ...prev,
      [key]: nuevoEstado,
    }));

    // Actualizar comentario automáticamente
    setComentarios((prev) => ({
      ...prev,
      [key]: nuevoEstado ? "Aprobado" : "",
    }));
  };
  const hayPendientes = Object.keys(documentos).some(
    (key) => !documentosRevisados[key] && !comentarios[key]?.trim()
  );

  return (
    <Header>
      {!mostrarResumen && (
        <div className="revision-grid">
          {/* Sidebar de documentos */}
          <div className="sidebar-documentos">
            <h3>Documentos</h3>
            <ul>
              {Object.keys(documentos || {})
                .sort((a, b) => {
                  if (ultimaRevision) {
                    const aAprobado = documentosRevisados[a] || false;
                    const bAprobado = documentosRevisados[b] || false;
                    if (aAprobado && !bAprobado) return 1;
                    if (!aAprobado && bAprobado) return -1;
                  }
                  return 0;
                })
                .map((key) => (
                  <li
                    key={key}
                    className={`doc-item ${
                      selectedDocKey === key ? "activo" : ""
                    }`}
                    onClick={() => setSelectedDocKey(key)}
                    style={{
                      backgroundColor: documentosRevisados[key]
                        ? "#69c0511a"
                        : comentarios[key] && comentarios[key].trim() !== ""
                        ? "#f230301a"
                        : "var(--color-primario)",
                    }}
                  >
                    {key} {documentosRevisados[key] ? "✓" : ""}
                  </li>
                ))}
            </ul>
          </div>

          {/* Selector de documentos */}
          <div className="visor">
            {/* Visualización PDF */}
            {selectedDocKey && documentos[selectedDocKey]?.url && (
              <iframe
                src={`https://docs.google.com/gview?url=https://drive.google.com/uc?id=${
                  documentos[selectedDocKey].url.split("/d/")[1]?.split("/")[0]
                }&export=download&embedded=true`}
                title={selectedDocKey}
                width="100%"
                height="100%"
                style={{ border: "1px solid #ccc", borderRadius: "8px" }}
              />
            )}

            <div className="paginacion">
              Documento:{" "}
              <strong>{documentos[selectedDocKey]?.nombre || ""}</strong>
            </div>

            {documentos[selectedDocKey]?.url && (
              <a
                href={documentos[selectedDocKey].url}
                target="_blank"
                rel="noopener noreferrer"
                className="abrir-pdf-btn"
              >
                Abrir en otra pestaña
              </a>
            )}
          </div>

          {/* Comentarios y detalle */}
          <div className="informacion">
            <div className="detalle-container">
              <div className="info-card">
                <div className="info">
                  <p>
                    Código del proyecto
                    <br />
                    <strong>{postulacion.codigoProyecto}</strong>
                  </p>
                </div>
                <div className="info">
                  <p>
                    Vinculación
                    <br />
                    <strong>
                      {formatVinculacion(postulacion.tipoVinculacion)}
                    </strong>
                  </p>
                </div>
                <div className="info">
                  <p>
                    Tipo de contrato
                    <br />
                    <strong>{postulacion.subvinculacion}</strong>
                  </p>
                </div>
                <div className="info">
                  <p>
                    Postulante
                    <br />
                    <strong>{postulacion.nombrePostulante}</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="card revision-box">
              <h3>Revisión</h3>
              <label style={{ fontWeight: "600" }}>{selectedDocKey}</label>

              <textarea
                placeholder={
                  bloqueados[selectedDocKey]
                    ? "Documento ya aprobado"
                    : comentariosPrevios[selectedDocKey]
                    ? `Comentario anterior: ${comentariosPrevios[selectedDocKey]}`
                    : "Escribe tus comentarios..."
                }
                value={
                  bloqueados[selectedDocKey]
                    ? "Aprobado"
                    : comentarios[selectedDocKey] || ""
                }
                onChange={handleComentarioChange}
                disabled={bloqueados[selectedDocKey]}
              />

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "1em",
                }}
              >
                <input
                  type="checkbox"
                  checked={!!documentosRevisados[selectedDocKey]}
                  onChange={() => toggleDocumentoRevisado(selectedDocKey)}
                  disabled={
                    bloqueados[selectedDocKey] ||
                    (!comentariosPrevios[selectedDocKey] &&
                      comentarios[selectedDocKey] &&
                      comentarios[selectedDocKey].trim() !== "")
                  }
                  style={{
                    accentColor: "#0b3c4d",
                    marginRight: "0.5em",
                    cursor:
                      bloqueados[selectedDocKey] ||
                      (!comentariosPrevios[selectedDocKey] &&
                        comentarios[selectedDocKey] &&
                        comentarios[selectedDocKey].trim() !== "")
                        ? "not-allowed"
                        : "pointer",
                  }}
                />
                Aprobar Documento
              </label>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "1rem",
              }}
            >
              <button
                class="btnAzul"
                onClick={irAlAnterior}
                disabled={documentosKeys.indexOf(selectedDocKey) === 0}
              >
                Anterior
              </button>
              <button
                class="btnAzul"
                onClick={irAlSiguiente}
                disabled={
                  documentosKeys.indexOf(selectedDocKey) ===
                  documentosKeys.length - 1
                }
              >
                Siguiente
              </button>
            </div>

            <button
              onClick={() => {
                setMostrarResumen(true);
              }}
              style={{ width: "100%" }}
            >
              Terminar Revisión
            </button>
          </div>
        </div>
      )}

      {mostrarResumen && (
        <div className="resumen-modal">
          <h2>Resumen de Revisión</h2>
          {Object.entries(documentos).map(([key, doc]) => (
            <div key={key} className="card resumen-card">
              <h3>{key}</h3>
              <p
                style={{
                  color:
                    !documentosRevisados[key] && !comentarios[key]?.trim()
                      ? "red"
                      : "inherit",
                }}
              >
                {!documentosRevisados[key] && !comentarios[key]?.trim()
                  ? "⚠️ Este documento no ha sido aprobado ni tiene comentarios. Debe agregar un comentario si no se aprueba."
                  : comentarios[key] || "Sin comentarios"}
              </p>
              {!bloqueados[key] && (
                <button
                  onClick={() => {
                    setSelectedDocKey(key);
                    setMostrarResumen(false);
                  }}
                  class="btnAzul"
                >
                  Editar
                </button>
              )}
            </div>
          ))}
          <button
            disabled={hayPendientes || isSubmitting}
            className={hayPendientes || isSubmitting ? "disabled" : ""}
            onClick={async () => {
              if (hayPendientes) return;
              setIsSubmitting(true);

              try {
                const todosRevisados = Object.keys(documentos).every((key) => {
                  const comentario = comentarios[key]?.trim() || "";
                  const aprobado = documentosRevisados[key];
                  return aprobado || comentario !== "";
                });

                if (!todosRevisados) {
                  alert(
                    "Por favor revisa todos los documentos. Cada uno debe ser aprobado o tener comentarios."
                  );
                  return;
                }

                const todosAprobados = Object.keys(documentos).every(
                  (key) => comentarios[key]?.trim().toLowerCase() === "aprobado"
                );

                const nuevoEstado = todosAprobados
                  ? "Aprobado"
                  : "En corrección";

                const numeroRevision = (postulacion.revisiones || 0) + 1;

                const nuevaRevision = {
                  codigoProyecto: postulacion.codigoProyecto,
                  postulacionId: id,
                  revisorId: user.uid,
                  revisorNombre: revisorNombre,
                  nombrePostulante: postulacion.nombrePostulante,
                  estadoFinal: nuevoEstado,
                  numeroRevision,
                  comentarios,
                  fechaRevision: new Date().toISOString(),
                };

                const nuevaDocRef = await addDoc(
                  collection(db, "revisiones"),
                  nuevaRevision
                );
                const revisionId = nuevaDocRef.id;
                console.log("✅ Revisión guardada con ID:", revisionId);

                const postulacionRef = doc(db, "postulaciones", id);
                await updateDoc(postulacionRef, {
                  revisiones: numeroRevision,
                  estado: nuevoEstado,
                  revisionIds: arrayUnion(revisionId),
                });

                const usuarioDoc = await getDoc(
                  doc(db, "usuarios", postulacion.usuarioId)
                );

                if (!usuarioDoc.exists())
                  throw new Error("No se encontró información del docente");

                const correoDocente = usuarioDoc.data().correo;
                const nombreDocente = usuarioDoc.data().nombre;

                if (!correoDocente)
                  throw new Error("No se encontró correo del docente");

                const res = await fetch("/api/sendEmail", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    to: correoDocente,
                    subject: `📝 Revisión ${nuevoEstado} - Proyecto ${postulacion.codigoProyecto}`,
                    template: "plantillaRevision",
                    variables: {
                      NOMBRE_DOCENTE: nombreDocente,
                      NOMBRE_POSTULANTE: postulacion.nombrePostulante,
                      CODIGO_PROYECTO: postulacion.codigoProyecto,
                      TIPO_VINCULACION: postulacion.tipoVinculacion,
                      TIPO_CONTRATO: postulacion.subvinculacion,
                      ESTADO: nuevoEstado,
                    },
                  }),
                });

                if (!res.ok) {
                  const errorText = await res.text();
                  console.error("❌ Error al enviar correo:", errorText);
                  throw new Error("Falló el envío de correo");
                }

                console.log("✅ Correo enviado");
                navigate("/Dashboard");
              } catch (error) {
                console.error(
                  "❌ Error al procesar la revisión:",
                  error.message,
                  error.stack
                );
                alert(
                  "❌ Ocurrió un error al guardar la revisión o enviar el correo: " +
                    error.message
                );
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {isSubmitting ? <DotSpinner /> : "Finalizar Revisión"}
          </button>
        </div>
      )}
    </Header>
  );
};

export default RevisionDocumentos;

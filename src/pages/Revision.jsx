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
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/Revision.css";

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
          setRevisorNombre(userData.nombre || ""); // 👈 Nombre del revisor
        }
      } catch (err) {
        console.error("Error al obtener el nombre del revisor:", err);
      }
    };

    fetchNombreRevisor();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) return;
      const docRef = doc(db, "postulaciones", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPostulacion(data);
        const primeraClave = Object.keys(data.documentos || {})[0];
        setSelectedDocKey(primeraClave);
      }
      setLoading(false);
    };
    if (!authLoading) fetchData();
  }, [id, user, authLoading]);

  const handleComentarioChange = (e) => {
    const valor = e.target.value;

    setComentarios((prev) => ({
      ...prev,
      [selectedDocKey]: valor,
    }));

    // Si se escribe, y estaba marcado como aprobado, desmarcarlo
    if (valor.trim() !== "" && documentosRevisados[selectedDocKey]) {
      setDocumentosRevisados((prev) => ({
        ...prev,
        [selectedDocKey]: false,
      }));
    }
  };

  if (authLoading || loading) return <p>Cargando...</p>;
  if (!postulacion || !selectedDocKey)
    return <p>Error cargando postulación.</p>;

  const documentos = postulacion.documentos || {};
  const documentoActual = documentos[selectedDocKey] || {};

  // Formateo útil para campos como tipoVinculacion
  const formatVinculacion = (texto) => {
    if (!texto) return "";
    return texto
      .split("_")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  };

  const toggleDocumentoRevisado = (key) => {
    setDocumentosRevisados((prev) => {
      const nuevoEstado = !prev[key];
      return { ...prev, [key]: nuevoEstado };
    });

    setComentarios((prev) => ({
      ...prev,
      [key]: prev[key] === "Aprobado" ? "" : "Aprobado",
    }));
  };

  return (
    <Header>
      {!mostrarResumen && (
        <div className="revision-grid">
          {/* Selector de documentos */}
          <div className="visor">
            <select
              value={selectedDocKey}
              onChange={(e) => {
                setSelectedDocKey(e.target.value);
              }}
              className="dropdown-selector"
            >
              {Object.keys(documentos).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>

            {/* Visualización PDF */}
            <iframe
              src={`https://docs.google.com/gview?url=https://drive.google.com/uc?id=${
                documentoActual.url.split("/d/")[1]?.split("/")[0]
              }&export=download&embedded=true`}
              title={selectedDocKey}
              width="100%"
              height="100%"
              style={{ border: "1px solid #ccc", borderRadius: "8px" }}
            ></iframe>

            <div className="paginacion">
              Documento: <strong>{documentoActual.nombre}</strong>
            </div>

            <a
              href={documentoActual.url}
              target="_blank"
              rel="noopener noreferrer"
              className="abrir-pdf-btn"
            >
              Abrir en otra pestaña
            </a>
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
              <label>
                <input
                  type="checkbox"
                  checked={!!documentosRevisados[selectedDocKey]}
                  onChange={() => toggleDocumentoRevisado(selectedDocKey)}
                  disabled={
                    comentarios[selectedDocKey] &&
                    comentarios[selectedDocKey].trim() !== "" &&
                    comentarios[selectedDocKey] !== "Aprobado"
                  }
                  style={{ accentColor: "#0b3c4d", marginRight: "0.5em" }}
                />
                {selectedDocKey}
              </label>

              <textarea
                placeholder="Escribe tus comentarios..."
                value={comentarios[selectedDocKey] || ""}
                onChange={handleComentarioChange}
                disabled={documentosRevisados[selectedDocKey]}
              />
            </div>

            <button
              onClick={() => setMostrarResumen(true)}
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
              <p>{comentarios[key] || "Sin comentarios"}</p>
              <button
                onClick={() => {
                  setSelectedDocKey(key);
                  setMostrarResumen(false);
                }}
                class="btnAzul"
              >
                Editar
              </button>
            </div>
          ))}
          <button
            onClick={async () => {
              const todosAprobados = Object.values(comentarios).every(
                (c) => c.trim().toLowerCase() === "aprobado"
              );

              const nuevoEstado = todosAprobados ? "Aprobado" : "En corrección";
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

              try {
                // 1. Crear documento en la colección "revisiones"
                const nuevaDocRef = await addDoc(
                  collection(db, "revisiones"),
                  nuevaRevision
                );
                const revisionId = nuevaDocRef.id;

                // 2. Actualizar postulación con nuevo estado, número y agregar ID de revisión
                const postulacionRef = doc(db, "postulaciones", id);
                await updateDoc(postulacionRef, {
                  revisiones: numeroRevision,
                  estado: nuevoEstado,
                  revisionIds: arrayUnion(revisionId), //
                });

                navigate("/Dashboard");
              } catch (error) {
                console.error("Error al guardar la revisión:", error);
                alert("❌ Ocurrió un error al guardar la revisión");
              }
            }}
          >
            Finalizar Revisión
          </button>
        </div>
      )}
    </Header>
  );
};

export default RevisionDocumentos;

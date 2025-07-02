import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../layout/Header";
import { useAuth } from "../components/Auth/AuthProvider";
import { db } from "../Credenciales";
import { doc, getDoc } from "firebase/firestore";
import "../styles/Revision.css";

const RevisionDocumentos = () => {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [postulacion, setPostulacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDocKey, setSelectedDocKey] = useState(null);
  const [comentarios, setComentarios] = useState({});
  const [mostrarResumen, setMostrarResumen] = useState(false);

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
    setComentarios({
      ...comentarios,
      [selectedDocKey]: e.target.value,
    });
  };

  if (authLoading || loading) return <p>Cargando...</p>;
  if (!postulacion || !selectedDocKey) return <p>Error cargando postulación.</p>;

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

  return (
    <Header>
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
            src={documentoActual.url}
            title={selectedDocKey}
            width="100%"
            height="500px"
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
                  Código del proyecto<br />
                  <strong>{postulacion.codigoProyecto}</strong>
                </p>
              </div>
              <div className="info">
                <p>
                  Vinculación<br />
                  <strong>{formatVinculacion(postulacion.tipoVinculacion)}</strong>
                </p>
              </div>
              <div className="info">
                <p>
                  Tipo de contrato<br />
                  <strong>{postulacion.subvinculacion}</strong>
                </p>
              </div>
              <div className="info">
                <p>
                  Postulante<br />
                  <strong>{postulacion.nombrePostulante}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="card revision-box">
            <h3>Revisión</h3>
            <label>
              <input type="checkbox" /> {selectedDocKey}
            </label>
            <textarea
              placeholder="Escribe tus comentarios..."
              value={comentarios[selectedDocKey] || ""}
              onChange={handleComentarioChange}
            />
          </div>

          <button onClick={() => setMostrarResumen(true)}>
            Terminar Revisión
          </button>
        </div>
      </div>

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
              >
                Editar
              </button>
            </div>
          ))}
          <button onClick={() => alert("✅ Revisión finalizada")}>
            Finalizar Revisión
          </button>
        </div>
      )}
    </Header>
  );
};

export default RevisionDocumentos;

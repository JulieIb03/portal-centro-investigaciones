import React, { useState, useEffect } from "react";
import Header from "../layout/Header";
import { useParams, useNavigate } from "react-router-dom";
import SubidaDocumentos from "../components/Subida";
import "../styles/Default.css";
import "../styles/DetallePostulacion.css";
import { doc, getDoc, collection } from "firebase/firestore";
import { db } from "../Credenciales";
import { useAuth } from "../components/Auth/AuthProvider";

const Modal = ({ children, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">{children}</div>
    </div>
  );
};

const DetallePostulacion = () => {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [open, setOpen] = useState(false);
  const [postulacion, setPostulacion] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        setError("No estás autenticado.");
        setLocalLoading(false);
        return;
      }

      if (!id) {
        setError("ID de postulación inválido.");
        setLocalLoading(false);
        return;
      }

      const obtenerPostulacionYRevisiones = async () => {
        try {
          // 1. Obtener la postulación
          const postulacionRef = doc(db, "postulaciones", id);
          const postulacionSnap = await getDoc(postulacionRef);

          if (!postulacionSnap.exists()) {
            setError("No se encontró la postulación.");
            return;
          }

          const postulacionData = postulacionSnap.data();

          if (
            user.rol === "docente" &&
            postulacionData.usuarioId !== user.uid
          ) {
            setError("No tienes permiso para ver esta postulación.");
            return;
          }

          setPostulacion(postulacionData);

          // 2. Obtener las revisiones relacionadas
          if (
            postulacionData.revisionIds &&
            postulacionData.revisionIds.length > 0
          ) {
            const revisionesCollection = collection(db, "revisiones");
            const revisionesPromises = postulacionData.revisionIds.map(
              (revisionId) => getDoc(doc(revisionesCollection, revisionId))
            );

            const revisionesSnaps = await Promise.all(revisionesPromises);

            const revisionesData = revisionesSnaps
              .map((revisionSnap) => ({
                id: revisionSnap.id,
                ...revisionSnap.data(),
              }))
              .sort((a, b) => b.numeroRevision - a.numeroRevision); // más recientes primero

            setHistorial(revisionesData);
          } else {
            // Si no hay revisiones, mostramos la postulación como "revisión inicial"
            setHistorial([
              {
                id: postulacionData.id,
                estadoFinal: postulacionData.estado,
                fechaRevision:
                  postulacionData.fechaActualizacion ||
                  postulacionData.fechaCreacion,
                numeroRevision: 0,
                postulacionId: postulacionData.id,
                comentarios: {},
                documentos: postulacionData.documentos,
              },
            ]);
          }
        } catch (err) {
          console.error("Error al cargar la postulación o revisiones:", err);
          setError("Ocurrió un error al obtener la información.");
        } finally {
          setLocalLoading(false);
        }
      };

      obtenerPostulacionYRevisiones();
    }
  }, [user, id, authLoading]);

  if (authLoading || localLoading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;
  if (!postulacion) return null;

  const formatDate = (fecha) => {
    if (!fecha) return "No especificada";
    try {
      let date;
      if (typeof fecha === "string") {
        date = new Date(fecha);
      } else if (fecha.toDate) {
        date = fecha.toDate();
      } else {
        return "No especificada";
      }
      return date.toLocaleDateString("es-ES");
    } catch (e) {
      return "No especificada";
    }
  };

  const formatVinculacion = (texto) => {
    if (!texto) return "";
    return texto
      .split("_")
      .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(" ");
  };

  const formatComentarios = (comentarios) => {
    if (!comentarios || Object.keys(comentarios).length === 0) {
      return user?.rol === "revisor" ? "Sin comentarios" : "Sin observaciones";
    }

    return (
      <ul style={{ paddingLeft: "1rem" }}>
        {Object.entries(comentarios).map(([doc, comentario], i) => (
          <li key={i}>
            <strong>{doc}</strong>: {comentario}
          </li>
        ))}
      </ul>
    );
  };

  const formatDocumentos = (documentos) => {
    if (!documentos) return "Sin documentos";

    return (
      <ul style={{ paddingLeft: "1rem" }}>
        {Object.entries(documentos).map(([titulo, datos], i) => (
          <li key={i}>
            <strong>{titulo}</strong>
            <br />
            {datos.nombre || "Documento sin nombre"}
          </li>
        ))}
      </ul>
    );
  };

  // Helper para mostrar nombre del estado según rol
  const getEstadoLabel = (estado, rol) => {
    if (rol === "revisor" && estado === "Pendiente") return "Nuevo";
    if (rol === "docente" && estado === "En corrección") return "Devuelto";
    return estado;
  };

  return (
    <Header>
      <header className="detalle-header">
        <h3>Proyecto {postulacion.codigoProyecto}</h3>
        <h1>Documentos – {postulacion.nombrePostulante}</h1>
      </header>

      <div className="detalle-container">
        <div className="info-boxes">
          <div className="info-card">
            <div className="info">
              <svg
                width="34"
                height="34"
                viewBox="0 0 34 34"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g opacity="0.5">
                  <path
                    d="M29.75 10.2709H25.5L26.5908 5.92171C26.6584 5.64743 26.6143 5.35752 26.4683 5.11575C26.3221 4.87399 26.0859 4.70016 25.8117 4.63254C25.5374 4.56491 25.2474 4.609 25.0057 4.75513C24.7639 4.90124 24.5901 5.13743 24.5225 5.41171L23.3042 10.2709H14.1667L15.2575 5.92171C15.3251 5.64743 15.281 5.35752 15.135 5.11575C14.9888 4.87399 14.7526 4.70016 14.4783 4.63254C14.2041 4.56491 13.9141 4.609 13.6724 4.75513C13.4306 4.90124 13.2568 5.13743 13.1892 5.41171L11.9142 10.2709H7.08333C6.80154 10.2709 6.53129 10.3828 6.33203 10.5821C6.13278 10.7813 6.02083 11.0516 6.02083 11.3334C6.02083 11.6152 6.13278 11.8854 6.33203 12.0847C6.53129 12.2839 6.80154 12.3959 7.08333 12.3959H11.3333L9.02417 21.6042H4.25C3.96821 21.6042 3.69795 21.7162 3.4987 21.9154C3.29945 22.1147 3.1875 22.3849 3.1875 22.6667C3.1875 22.9484 3.29945 23.2187 3.4987 23.4181C3.69795 23.6172 3.96821 23.7292 4.25 23.7292H8.5L7.40917 28.0783C7.34153 28.3526 7.38564 28.6426 7.53175 28.8843C7.67788 29.1261 7.91405 29.2999 8.18833 29.3675C8.46261 29.4352 8.75252 29.391 8.99429 29.2449C9.23606 29.0989 9.40987 28.8626 9.4775 28.5883L10.6958 23.7292H19.8333L18.7425 28.0783C18.6749 28.3526 18.719 28.6426 18.865 28.8843C19.0112 29.1261 19.2474 29.2999 19.5217 29.3675C19.7959 29.4352 20.0859 29.391 20.3276 29.2449C20.5694 29.0989 20.7433 28.8626 20.8108 28.5883L22.0292 23.7292H26.9167C27.1984 23.7292 27.4687 23.6172 27.6679 23.4181C27.8672 23.2187 27.9792 22.9484 27.9792 22.6667C27.9792 22.3849 27.8672 22.1147 27.6679 21.9154C27.4687 21.7162 27.1984 21.6042 26.9167 21.6042H22.6667L24.9758 12.3959H29.75C30.0318 12.3959 30.3021 12.2839 30.5013 12.0847C30.7006 11.8854 30.8125 11.6152 30.8125 11.3334C30.8125 11.0516 30.7006 10.7813 30.5013 10.5821C30.3021 10.3828 30.0318 10.2709 29.75 10.2709ZM22.6667 12.3959L20.3575 21.6042H11.3333L13.6425 12.3959H22.6667Z"
                    fill="#5B5B5B"
                  />
                </g>
              </svg>
              <p>
                Código del proyecto
                <br />
                <strong>{postulacion.codigoProyecto}</strong>
              </p>
            </div>
            <div className="info">
              <svg
                width="34"
                height="34"
                viewBox="0 0 34 34"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g opacity="0.5">
                  <path
                    d="M6.06031 4.85432H25.4888V18.2113H27.9176V2.42584H3.63184V31.5686H16.9888V29.1401H6.06031V4.85432Z"
                    fill="#5B5B5B"
                  />
                  <path
                    d="M8.48828 7.28278H23.0598V9.71125H8.48828V7.28278ZM8.48828 12.1401H20.631V14.5685H8.48828V12.1401ZM8.48828 16.997H15.774V19.4255H8.48828V16.997ZM30.2383 29.7988L28.3726 27.9331C28.957 27.0632 29.2993 26.0166 29.2993 24.8901C29.2993 21.8722 26.8529 19.4258 23.8351 19.4258C20.8173 19.4258 18.3709 21.8722 18.3709 24.8901C18.3709 27.9079 20.8173 30.3543 23.8351 30.3543C24.8445 30.3543 25.7781 30.0614 26.5896 29.5843L28.5211 31.5157L30.2383 29.7988ZM20.7997 24.8901C20.7997 23.216 22.1617 21.8543 23.8354 21.8543C25.5092 21.8543 26.8712 23.216 26.8712 24.8901C26.8712 26.5638 25.5092 27.9258 23.8354 27.9258C22.1617 27.9258 20.7997 26.5638 20.7997 24.8901Z"
                    fill="#5B5B5B"
                  />
                </g>
              </svg>
              <p>
                Vinculación
                <br />
                <strong>
                  {formatVinculacion(postulacion.tipoVinculacion)}
                </strong>
              </p>
            </div>
            <div className="info">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="34"
                height="34"
                viewBox="0 0 34 34"
                fill="none"
              >
                <g opacity="0.5">
                  <path
                    d="M6.06031 4.85432H25.4888V18.2113H27.9176V2.42584H3.63184V31.5686H16.9888V29.1401H6.06031V4.85432Z"
                    fill="#5B5B5B"
                  />
                  <path
                    d="M8.48926 7.28278H23.0608V9.71125H8.48926V7.28278ZM8.48926 12.1401H20.632V14.5685H8.48926V12.1401ZM8.48926 16.997H15.775V19.4255H8.48926V16.997ZM24.2724 19.4258C20.9192 19.4258 18.2008 22.1442 18.2008 25.4973C18.2008 28.8505 20.9192 31.5689 24.2724 31.5689C27.6255 31.5689 30.3439 28.8505 30.3439 25.4973C30.3439 22.1442 27.6255 19.4258 24.2724 19.4258ZM24.2724 29.1401C22.2636 29.1401 20.6296 27.5058 20.6296 25.4973C20.6296 23.4886 22.2639 21.8546 24.2724 21.8546C26.2812 21.8546 27.9151 23.4889 27.9151 25.4973C27.9151 27.5058 26.2808 29.1401 24.2724 29.1401Z"
                    fill="#5B5B5B"
                  />
                  <path
                    d="M23.8354 25.8204L22.4226 24.5544L21.207 25.9111L23.9968 28.4103L27.416 24.4767L26.0417 23.2814L23.8354 25.8204Z"
                    fill="#5B5B5B"
                  />
                </g>
              </svg>
              <p>
                Tipo de contrato
                <br />
                <strong>{postulacion.subvinculacion}</strong>
              </p>
            </div>
            <div className="info">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="34"
                height="34"
                viewBox="0 0 34 34"
                fill="none"
              >
                <g opacity="0.5">
                  <path
                    d="M28.3337 29.75V26.9167C28.3337 25.4138 27.7366 23.9724 26.6739 22.9097C25.6112 21.847 24.1699 21.25 22.667 21.25H11.3337C9.83077 21.25 8.38943 21.847 7.32672 22.9097C6.26401 23.9724 5.66699 25.4138 5.66699 26.9167V29.75"
                    stroke="#5B5B5B"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M17.0007 15.5833C20.1303 15.5833 22.6673 13.0463 22.6673 9.91667C22.6673 6.78705 20.1303 4.25 17.0007 4.25C13.871 4.25 11.334 6.78705 11.334 9.91667C11.334 13.0463 13.871 15.5833 17.0007 15.5833Z"
                    stroke="#5B5B5B"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </g>
              </svg>
              <p>
                Postulante
                <br />
                <strong>{postulacion.nombrePostulante}</strong>
              </p>
            </div>
          </div>
          <div className="estado-card">
            <p>Estado</p>
            <h3 className={`${postulacion.estado.replace(/\s/g, "-")}`}>
              {getEstadoLabel(postulacion.estado, user?.rol)}
            </h3>
          </div>
        </div>
        <div className="historial-section">
          <div className="historial-header">
            <h2>Historial de revisiones</h2>
            {user?.rol === "docente" && (
              <button
                className={`btnAzul ${
                  postulacion.estado !== "En corrección" ? "disabled" : ""
                }`}
                onClick={() => {
                  if (postulacion.estado === "En corrección") {
                    setOpen(true);
                  }
                }}
                disabled={postulacion.estado !== "En corrección"}
              >
                Reenviar documentos
              </button>
            )}
            {user?.rol === "revisor" && postulacion.estado !== "Aprobado" && (
              <button
                className="btnAzul"
                onClick={() => navigate(`/revision/${postulacion.id}`)}
              >
                Revisar
              </button>
            )}
          </div>

          {open && (
            <Modal onClose={() => setOpen(false)}>
              <SubidaDocumentos
                postulacionId={postulacion.id}
                codigoProyecto={postulacion.codigoProyecto}
                nombrePostulante={postulacion.nombrePostulante}
                tipoVinculacion={postulacion.tipoVinculacion}
                subvinculacion={postulacion.subvinculacion}
                documentosPostulacion={postulacion.documentos}
                ultimaRevisionId={
                  postulacion.revisionIds[postulacion.revisionIds.length - 1]
                }
                onClose={() => setOpen(false)}
              />
            </Modal>
          )}
          <table>
            <thead>
              <tr>
                <th>Fecha de envío</th>
                <th>N° Revisión</th>
                <th>Estado</th>
                <th>
                  {user?.rol === "revisor" ? "Documentos" : "Comentarios"}
                </th>
                <th>Fecha de revisión</th>
                <th>Revisor(a)</th>
              </tr>
            </thead>

            <tbody>
              {user?.rol === "docente" && historial.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No hay historial de revisiones.
                  </td>
                </tr>
              ) : user?.rol === "revisor" && historial.length === 0 ? (
                <tr>
                  <td>{postulacion.id}</td>
                  <td>{formatDate(postulacion.fechaCreacion)}</td>
                  <td>0</td>
                  <td className={postulacion.estado?.replace(/\s/g, "-")}>
                    {postulacion.estado || "Pendiente"}
                  </td>
                  <td>
                    {postulacion.documentos ? (
                      <ul style={{ paddingLeft: "1rem" }}>
                        {Object.entries(postulacion.documentos).map(
                          ([titulo, datos], i) => (
                            <li key={i}>
                              <strong>{titulo}</strong>
                              <br />
                              {datos.nombre || "Documento sin nombre"}
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      "Sin documentos"
                    )}
                  </td>
                  <td>Sin revisión</td>
                  <td>No asignado</td>
                </tr>
              ) : (
                historial.map((revision) => (
                  <tr key={revision.id}>
                    <td>{formatDate(postulacion.fechaCreacion)}</td>
                    <td>{revision.numeroRevision || 0}</td>
                    <td className={revision.estadoFinal?.replace(/\s/g, "-")}>
                      {getEstadoLabel(
                        revision.estadoFinal || "Pendiente",
                        user?.rol
                      )}
                    </td>
                    <td>
                      {user?.rol === "revisor"
                        ? formatDocumentos(
                            revision.documentos || postulacion.documentos
                          )
                        : formatComentarios(revision.comentarios)}
                    </td>
                    <td>{formatDate(revision.fechaRevision)}</td>
                    <td>{revision.revisorNombre || "No asignado"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Header>
  );
};

export default DetallePostulacion;

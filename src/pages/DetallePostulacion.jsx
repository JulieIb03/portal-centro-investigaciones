import React, { useState, useEffect } from "react";
import Header from "../layout/Header";
import { useParams } from "react-router-dom";
import SubidaDocumentos from "../components/Subida";
import "../styles/Default.css";
import "../styles/DetallePostulacion.css";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../Credenciales";
import { useAuth } from "../components/Auth/AuthProvider";

const Modal = ({ children, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

const DetallePostulacion = () => {
  const { id } = useParams(); 
  const [open, setOpen] = useState(false);
  const [postulacion, setPostulacion] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPostulacion = async () => {
      try {
        // Obtener la postulación específica
        const postulacionRef = doc(db, "postulaciones", id);
        const postulacionSnap = await getDoc(postulacionRef);

        if (postulacionSnap.exists()) {
          const postData = postulacionSnap.data();
          setPostulacion({
            id: postulacionSnap.id,
            ...postData
          });

          // Obtener el historial de revisiones si existe
          if (postData.historial) {
            setHistorial(postData.historial);
          } else {
            // Si no hay historial, buscar en una subcolección
            const historialRef = collection(db, "postulaciones", id, "revisiones");
            const historialQuery = query(historialRef);
            const historialSnap = await getDocs(historialQuery);
            
            const historialData = historialSnap.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            setHistorial(historialData);
          }
        } else {
          console.log("No se encontró la postulación");
        }
      } catch (error) {
        console.error("Error al obtener la postulación:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostulacion();
  }, [id]);

  if (loading) {
    return (
      <Header>
        <div className="loading-container">
          <p>Cargando postulación...</p>
        </div>
      </Header>
    );
  }

  if (!postulacion) {
    return (
      <Header>
        <div className="error-container">
          <p>No se encontró la postulación.</p>
        </div>
      </Header>
    );
  }

  // Función para formatear fechas de Firestore
  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "No especificada";
    const date = timestamp.toDate();
    return date.toLocaleDateString('es-ES');
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
                {/* Icono SVG */}
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
                {/* Icono SVG */}
              </svg>
              <p>
                Vinculación
                <br />
                <strong>{postulacion.tipoVinculacion}</strong>
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
                {/* Icono SVG */}
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
                {/* Icono SVG */}
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
            <h3 className={`${postulacion.estado.replace(" ", "-")}`}>
              {postulacion.estado}
            </h3>
          </div>
        </div>

        <div className="historial-section">
          <div className="historial-header">
            <h2>Historial de revisiones</h2>
            {user?.rol === "docente" && (
              <button className="btnAzul" onClick={() => setOpen(true)}>
                Reenviar documentos
              </button>
            )}
          </div>

          {open && (
            <Modal onClose={() => setOpen(false)}>
              <SubidaDocumentos
                codigoProyecto={postulacion.codigoProyecto}
                nombrePostulante={postulacion.nombrePostulante}
                tipoVinculacion={postulacion.tipoVinculacion}
                subvinculacion={postulacion.subvinculacion}
                onClose={() => setOpen(false)}
              />
            </Modal>
          )}

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha de envío</th>
                <th>Estado</th>
                <th>Comentarios</th>
                <th>Fecha de revisión</th>
              </tr>
            </thead>
            <tbody>
              {historial.length > 0 ? (
                historial.map((item, index) => (
                  <tr key={index}>
                    <td>{item.id || `REV-${index + 1}`}</td>
                    <td>{formatDate(item.fechaEnvio)}</td>
                    <td className={`${item.estado?.replace(" ", "-") || postulacion.estado.replace(" ", "-")}`}>
                      {item.estado || "Pendiente"}
                    </td>
                    <td>{item.comentarios || "Sin comentarios"}</td>
                    <td>{formatDate(item.fechaRevision)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>
                    No hay historial de revisiones
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Header>
  );
};

export default DetallePostulacion;
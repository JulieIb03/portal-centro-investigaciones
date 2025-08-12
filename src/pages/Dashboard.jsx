import React, { useState, useEffect } from "react";
import Header from "../layout/Header";
import "../styles/Default.css";
import "../styles/Dashboard.css";
import SubidaDocumentos from "../components/Subida";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/Auth/AuthProvider";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../Credenciales";
import CerrarIcon from "../assets/x.png";

const Modal = ({ children, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          <img src={CerrarIcon} alt="Cerrar" className="w-6 h-6" />
        </button>
        {children}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [postulaciones, setPostulaciones] = useState([]);
  const [conteos, setConteos] = useState({
    Pendiente: 0,
    "En corrección": 0,
    Aprobado: 0,
  });

  const [filtroEstado, setFiltroEstado] = useState(null);

  useEffect(() => {
    if (!user) return;

    const q =
      user.rol === "docente"
        ? query(
            collection(db, "postulaciones"),
            where("usuarioId", "==", user.uid)
          )
        : query(collection(db, "postulaciones"));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const posts = [];
      const nuevosConteos = {
        Pendiente: 0,
        "En corrección": 0,
        Aprobado: 0,
      };

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();

        // Obtenemos última revisión si existen IDs
        let ultimaRevisionFecha = null;
        if (data.revisionIds && data.revisionIds.length > 0) {
          const lastRevisionId = data.revisionIds[data.revisionIds.length - 1];
          const revDoc = await getDoc(doc(db, "revisiones", lastRevisionId));
          if (revDoc.exists()) {
            ultimaRevisionFecha = revDoc.data().fechaRevision || null;
          }
        }

        posts.push({
          id: docSnap.id,
          ...data,
          ultimaRevisionFecha,
        });

        if (data.estado in nuevosConteos) {
          nuevosConteos[data.estado]++;
        }
      }

      setPostulaciones(posts);
      setConteos(nuevosConteos);
    });

    return () => unsubscribe();
  }, [user]);

  const tiposVinculacion = {
    contrato_ops: "Contrato OPS",
    asistente_graduado: "Asistente Graduado",
    estudiantes: "Estudiantes",
  };

  const postulacionesFiltradas = (() => {
    let filtradas = [];

    if (filtroEstado === "Aprobado") {
      filtradas = postulaciones.filter((p) => p.estado === "Aprobado");
    } else if (filtroEstado) {
      filtradas = postulaciones.filter((p) => p.estado === filtroEstado);
    } else {
      filtradas = postulaciones.filter(
        (p) => p.estado === "Pendiente" || p.estado === "En corrección"
      );
    }

    return filtradas.sort((a, b) => {
      const fechaA = a.fechaActualizacion?.toDate?.() || new Date(0);
      const fechaB = b.fechaActualizacion?.toDate?.() || new Date(0);
      return fechaB - fechaA;
    });
  })();

  // Helper para mostrar fecha
  const formatDate = (fecha) => {
    if (!fecha) return "-";

    let dateObj;

    if (fecha.toDate) {
      // Timestamp de Firestore
      dateObj = fecha.toDate();
    } else if (typeof fecha === "string") {
      // String ISO -> convertir a Date
      dateObj = new Date(fecha);
    } else {
      // Ya es Date
      dateObj = fecha;
    }

    // Validar fecha válida
    if (isNaN(dateObj.getTime())) return "-";

    return dateObj.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Header>
      <div className="dashboard">
        <div className="summary-cards">
          {Object.entries(conteos).map(([key, value]) => (
            <div
              className={`card ${
                key === "Aprobado"
                  ? "aprobado"
                  : key === "En corrección"
                  ? "en-correccion"
                  : "pendiente"
              } ${filtroEstado === key ? "activa" : ""}`}
              key={key}
              onClick={() => setFiltroEstado(filtroEstado === key ? null : key)}
            >
              <div className="card-value">{value}</div>
              <div className="card-label">{key}</div>
            </div>
          ))}
        </div>

        <section className="table-section">
          <div className="table-header">
            <h2>
              {filtroEstado
                ? `Postulaciones: ${filtroEstado}`
                : "Postulaciones recientes"}
            </h2>
            <div className="acciones-header">
              {filtroEstado && (
                <button
                  className="btnAzul"
                  onClick={() => setFiltroEstado(null)}
                  style={{ marginRight: "10px" }}
                >
                  Ver todas
                </button>
              )}

              {user?.rol === "docente" && (
                <button className="btnAzul" onClick={() => setOpen(true)}>
                  Nueva postulación
                </button>
              )}
            </div>
          </div>

          {user?.rol === "docente" && open && (
            <Modal onClose={() => setOpen(false)}>
              <SubidaDocumentos onClose={() => setOpen(false)} />
            </Modal>
          )}

          <table>
            <thead>
              <tr>
                <th>Código del Proyecto</th>
                <th>Fecha de envío</th>
                <th>Nombre Postulante</th>
                <th>Tipo de Vinculación</th>
                <th>Tipo de Contrato</th>
                <th>Revisiones</th>
                <th>Última revisión</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {postulacionesFiltradas.map((p, i) => (
                <tr
                  key={i}
                  onClick={() => navigate(`/detalle/${p.id}`)}
                  className="clickable-row"
                >
                  <td>{p.codigoProyecto}</td>
                  <td>{formatDate(p.fechaActualizacion)}</td>
                  <td>{p.nombrePostulante}</td>
                  <td>
                    {tiposVinculacion[p.tipoVinculacion] || p.tipoVinculacion}
                  </td>
                  <td>{p.subvinculacion}</td>
                  <td>{p.revisiones}</td>
                  <td>{formatDate(p.ultimaRevisionFecha)}</td>
                  <td>
                    <p className={`estado ${p.estado.replace(" ", "-")}`}>
                      {p.estado}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </Header>
  );
};

export default Dashboard;

import React, { useState, useEffect } from "react";
import Header from "../layout/Header";
import "../styles/Default.css";
import "../styles/Dashboard.css";
import SubidaDocumentos from "../components/Subida";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/Auth/AuthProvider";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../Credenciales";

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

    // Consulta para las postulaciones del usuario (docente) o todas (revisor)
    const q =
      user.rol === "docente"
        ? query(
            collection(db, "postulaciones"),
            where("usuarioId", "==", user.uid)
          )
        : query(collection(db, "postulaciones"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const posts = [];
      const nuevosConteos = {
        Pendiente: 0,
        "En corrección": 0,
        Aprobado: 0,
      };

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({ id: doc.id, ...data });

        if (data.estado in nuevosConteos) {
          nuevosConteos[data.estado]++;
        }
      });

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

  const postulacionesFiltradas = filtroEstado
  ? postulaciones.filter((p) => p.estado === filtroEstado)
  : postulaciones;

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
              onClick={() => setFiltroEstado(filtroEstado === key ? null : key)} // Toggle
            >
              <div className="card-value">{value}</div>
              <div className="card-label">{key}</div>
            </div>
          ))}
        </div>

        <section className="table-section">
          <div className="table-header">
            <h2>Todas las postulaciones</h2>
            {/* Muestra el botón solo si el rol es docente */}
            {user?.rol === "docente" && (
              <button className="btnAzul" onClick={() => setOpen(true)}>
                Nueva postulación
              </button>
            )}
          </div>

          {/* Muestra el modal solo si el rol es docente */}
          {user?.rol === "docente" && open && (
            <Modal onClose={() => setOpen(false)}>
              <SubidaDocumentos onClose={() => setOpen(false)} />
            </Modal>
          )}

          <table>
            <thead>
              <tr>
                <th>Código del Proyecto</th>
                <th>Nombre Postulante</th>
                <th>Tipo de Vinculación</th>
                <th>Tipo de Contrato</th>
                <th>Revisiones</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {postulacionesFiltradas.map((p, i) => (
                <tr
                  key={i}
                  onClick={() => navigate(`/detalle/${p.id}`)} // Usa p.id en lugar de p.codigo
                  className="clickable-row"
                >
                  <td>{p.codigoProyecto}</td>
                  <td>{p.nombrePostulante}</td>
                  <td>
                    {tiposVinculacion[p.tipoVinculacion] || p.tipoVinculacion}
                  </td>
                  <td>{p.subvinculacion}</td>
                  <td>{p.revisiones}</td>
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

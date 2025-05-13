import React, { useState } from "react";
import Header from "../layout/Header";
import "../styles/Default.css";
import "../styles/Dashboard.css";
import SubidaDocumentos from "../components/Subida";
import { useNavigate } from "react-router-dom";

const postulaciones = [
  {
    codigo: "IMP-ING 4083",
    nombre: "Maria Carranza",
    vinculacion: "Estudiante",
    contrato: "Auxiliar de Pregrado",
    revisiones: 2,
    estado: "Aprobado",
  },
  {
    codigo: "INV-ING-4181",
    nombre: "Tatiana Lopez",
    vinculacion: "Asistente",
    contrato: "Nuevo",
    revisiones: 1,
    estado: "Aprobado",
  },
  {
    codigo: "INV-ING-4181",
    nombre: "Julie Alejandra Ibarra",
    vinculacion: "Asistente Graduado",
    contrato: "Renovación",
    revisiones: 2,
    estado: "En corrección",
  },
];

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

  const conteos = {
    Pendiente: 0,
    "En corrección": 1,
    Aprobado: 2,
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
              }`}
              key={key}
            >
              <div className="card-value">{value}</div>
              <div className="card-label">{key}</div>
            </div>
          ))}
        </div>

        <section className="table-section">
          <div className="table-header">
            <h2>Todas las postulaciones</h2>
            <button className="btnAzul" onClick={() => setOpen(true)}>
              Nueva postulación
            </button>
          </div>

          {open && (
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
              {postulaciones.map((p, i) => (
                <tr
                  key={i}
                  onClick={() => navigate(`/detalle/${p.codigo}`)}
                  className="clickable-row"
                >
                  <td>{p.codigo}</td>
                  <td>{p.nombre}</td>
                  <td>{p.vinculacion}</td>
                  <td>{p.contrato}</td>
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

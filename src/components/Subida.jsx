import React, { useEffect, useState } from "react";
import "../styles/components/Subida.css";

const SubidaDocumentos = ({ onClose }) => {
  const [codigoProyecto, setCodigoProyecto] = useState("");
  const [tipoVinculacion, setTipoVinculacion] = useState("");
  const [subvinculacion, setSubvinculacion] = useState("");
  const [nombrePostulante, setNombrePostulante] = useState("");
  const [subvinculaciones, setSubvinculaciones] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [formDisabled, setFormDisabled] = useState(false);
  const [mostrarMensajeCerrado, setMostrarMensajeCerrado] = useState(false);
  const [archivos, setArchivos] = useState({});

  // Opciones estáticas
  const opcionesSubvinculacion = {
    contrato_ops: ["Asistente de Investigación", "Joven Investigador"],
    asistente_graduado: ["Proceso Nuevo", "Proceso de Renovación"],
    estudiantes: ["Auxiliar de Pregrado", "Auxiliar de Posgrado"],
  };

  // Documentos estáticos
  const documentosRequeridos = {
    "Asistente de Investigación": [
      "Formato de Solicitud orden y/o Contrato",
      "Concertación de entregables IN-IV-F-26",
      "Formato Único de Hoja de Vida (DAFP)",
      "Fotocopia de la cédula de ciudadanía ampliada al 150%",
      "Fotocopia de la libreta militar (si aplica)",
      "Fotocopia de certificados laborales",
      "Certificados Académicos (actas de grado-diplomas)",
      "Fotocopia de RUT actualizado",
      "Formato de Confidencialidad de la UMNG",
    ],
    "Joven Investigador": [
      "Acta de pregrado (Máximo 2 años de egreso)",
      "Copia de la cédula ampliada al 150% (Menor de 28 años)",
      "Certificado de participación en semilleros o proyectos",
      "Carta de compromiso de no estar en otro proyecto",
    ],
    "Proceso Nuevo": [
      "Convocatoria de vinculación",
      "Resultados de la convocatoria",
      "Recibo de matrícula",
      "Carta de presentación del líder del proyecto",
      "Certificado de notas (mínimo 3.6 o 4.0 según avance)",
    ],
    "Proceso de Renovación": [
      "Recibo de matrícula",
      "Informe semestral de actividades",
      "Evaluación del docente-tutor",
      "Certificado de notas (mínimo 4.0)",
    ],
    "Auxiliar de Pregrado": [
      "Convocatoria de vinculación",
      "Resultados de la convocatoria",
      "Certificación de estudios (mínimo 70% del programa)",
      "Carta de presentación",
      "Fotocopia de cédula",
    ],
    "Auxiliar de Posgrado": [
      "Convocatoria de vinculación",
      "Resultados de la convocatoria",
      "Certificación de registro académico",
      "Carta de presentación y autodeclaración",
    ],
  };

  useEffect(() => {
    if (tipoVinculacion && opcionesSubvinculacion[tipoVinculacion]) {
      setSubvinculaciones(opcionesSubvinculacion[tipoVinculacion]);
    } else {
      setSubvinculaciones([]);
    }
    setSubvinculacion("");
  }, [tipoVinculacion]);

  useEffect(() => {
    if (subvinculacion && documentosRequeridos[subvinculacion]) {
      setDocumentos(documentosRequeridos[subvinculacion]);
    } else {
      setDocumentos([]);
    }
  }, [subvinculacion]);

  const handleArchivo = (e, nombreDocumento) => {
    const nuevoArchivo = e.target.files[0];
    setArchivos((prev) => ({
      ...prev,
      [nombreDocumento]: nuevoArchivo,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para subir los documentos
    console.log({
      codigoProyecto,
      tipoVinculacion,
      subvinculacion,
      nombrePostulante,
      archivos,
    });
    // Simulamos el envío
    setFormDisabled(true);
    alert("Documentos enviados correctamente");
  };

  return (
    <div className="form-container">
      <h2>Subida de Documentos</h2>

      <form onSubmit={handleSubmit} class="subidaForm">
        <label htmlFor="codigoProyecto">Código del Proyecto:</label>
        <input
          type="text"
          id="codigoProyecto"
          name="codigoProyecto"
          value={codigoProyecto}
          onChange={(e) => setCodigoProyecto(e.target.value)}
          required
        />

        <label htmlFor="tipoVinculacion">
          Seleccione el tipo de vinculación:
        </label>
        <select
          id="tipoVinculacion"
          name="tipoVinculacion"
          value={tipoVinculacion}
          onChange={(e) => setTipoVinculacion(e.target.value)}
          required
          disabled={formDisabled}
        >
          <option value="">Seleccione...</option>
          <option value="contrato_ops">Contrato OPS</option>
          <option value="asistente_graduado">Asistente Graduado</option>
          <option value="estudiantes">Estudiantes</option>
        </select>

        <label htmlFor="subvinculacion">Seleccione la subcategoría:</label>
        <select
          id="subvinculacion"
          name="subvinculacion"
          value={subvinculacion}
          onChange={(e) => setSubvinculacion(e.target.value)}
          required
          disabled={formDisabled}
        >
          <option value="">Seleccione...</option>
          {subvinculaciones.map((sub, i) => (
            <option key={i} value={sub}>
              {sub}
            </option>
          ))}
        </select>

        <label htmlFor="nombrePostulante">Nombre del Postulante:</label>
        <input
          type="text"
          id="nombrePostulante"
          name="nombrePostulante"
          value={nombrePostulante}
          onChange={(e) => setNombrePostulante(e.target.value)}
          required
          disabled={formDisabled}
        />

        <div id="documentosContainer">
          <h3>Documentos Requeridos</h3>
          <div id="documentosLista">
            {documentos.map((doc, i) => (
              <div key={i} style={{ margin: "10px 0" }}>
                <label>{doc}</label>
                <input
                  type="file"
                  onChange={(e) => handleArchivo(e, doc)}
                  disabled={formDisabled}
                  required
                />
              </div>
            ))}
          </div>
        </div>

        {mostrarMensajeCerrado && (
          <div className="mensaje-cerrado">
            Este proyecto está cerrado y no permite subida de documentos.
          </div>
        )}

        <button type="submit" style={{ margin: "20px auto 0 auto"}}>Enviar</button>
      </form>
    </div>
  );
};

export default SubidaDocumentos;

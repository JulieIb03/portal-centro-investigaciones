import React, { useEffect, useState } from "react";
import "../styles/Default.css";
import "../styles/components/Subida.css";

// Estas constantes están fuera del componente para evitar ciclos infinitos
const opcionesSubvinculacion = {
  contrato_ops: ["Asistente de Investigación", "Joven Investigador"],
  asistente_graduado: ["Proceso Nuevo", "Proceso de Renovación"],
  estudiantes: ["Auxiliar de Pregrado", "Auxiliar de Posgrado"],
};

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

const SubidaDocumentos = ({
  codigoProyecto: codigoInicial = "",
  nombrePostulante: nombreInicial = "",
  tipoVinculacion: tipoVinculacionInicial = "",
  subvinculacion: subvinculacionInicial = "",
  onClose,
}) => {
  const [codigoProyecto, setCodigoProyecto] = useState(codigoInicial);
  const [nombrePostulante, setNombrePostulante] = useState(nombreInicial);
  const [tipoVinculacion, setTipoVinculacion] = useState(
    tipoVinculacionInicial
  );
  const [subvinculacion, setSubvinculacion] = useState(subvinculacionInicial);
  const [subvinculaciones, setSubvinculaciones] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [formDisabled] = useState(false);
  const [archivos, setArchivos] = useState({});

  const esReenvio = !!(
    codigoInicial ||
    nombreInicial ||
    tipoVinculacionInicial ||
    subvinculacionInicial
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (tipoVinculacion) {
      setSubvinculaciones(opcionesSubvinculacion[tipoVinculacion] || []);
    } else {
      setSubvinculaciones([]);
    }

    // Solo reinicia subvinculacion si NO viene por props
    if (!subvinculacionInicial) setSubvinculacion("");
  }, [tipoVinculacion, subvinculacionInicial]);

  useEffect(() => {
    if (subvinculacion) {
      setDocumentos(documentosRequeridos[subvinculacion] || []);
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
    // Aquí puedes manejar el envío del formulario
    console.log("Documentos enviados");
    if (onClose) onClose();
  };

  return (
    <div className="form-container">
      <h2>{esReenvio ? "Reenvío de documentos" : "Nueva postulación"}</h2>
      <form className="subidaForm" onSubmit={handleSubmit}>
        <label htmlFor="codigoProyecto">Código del Proyecto:</label>
        <input
          type="text"
          id="codigoProyecto"
          value={codigoProyecto}
          onChange={(e) => setCodigoProyecto(e.target.value)}
          required
          disabled={esReenvio}
        />

        <label htmlFor="tipoVinculacion">Tipo de vinculación:</label>
        <select
          id="tipoVinculacion"
          value={tipoVinculacion}
          onChange={(e) => setTipoVinculacion(e.target.value)}
          required
          disabled={esReenvio}
        >
          <option value="">Seleccione</option>
          <option value="contrato_ops">Contrato OPS</option>
          <option value="asistente_graduado">Asistente Graduado</option>
          <option value="estudiantes">Estudiantes</option>
        </select>

        <label htmlFor="subvinculacion">Subcategoría:</label>
        <select
          id="subvinculacion"
          value={subvinculacion}
          onChange={(e) => setSubvinculacion(e.target.value)}
          disabled={esReenvio}
        >
          <option value="">Seleccione</option>
          {subvinculaciones.map((sub, i) => (
            <option key={i} value={sub}>
              {sub}
            </option>
          ))}
        </select>

        <label htmlFor="nombrePostulante">Nombre del Postulante:</label>
        <input
          id="nombrePostulante"
          type="text"
          value={nombrePostulante}
          onChange={(e) => setNombrePostulante(e.target.value)}
          required
          disabled={esReenvio}
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

        <button type="submit">
          {esReenvio ? "Reenviar" : "Enviar"}
        </button>
      </form>
    </div>
  );
};

export default SubidaDocumentos;

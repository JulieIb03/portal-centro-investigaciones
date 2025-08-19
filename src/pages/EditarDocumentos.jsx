import React, { useState, useEffect } from "react";
import Header from "../layout/Header";
import "../styles/EditarDocumentos.css";
import { db } from "../Credenciales";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  setDoc,
} from "firebase/firestore";
import EditarIcon from "../assets/lapiz.png";
import BorrarIcon from "../assets/compartimiento.png";
import CancelarIcon from "../assets/letra-x.png";
import GuardarIcon from "../assets/aceptar.png";

export default function EditarDocumentos() {
  const [datos, setDatos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [vinculaciones, setVinculaciones] = useState([]);
  const [modoEdicion, setModoEdicion] = useState({});
  const [datosEditados, setDatosEditados] = useState({});
  const [titulosEditados, setTitulosEditados] = useState({});
  const [subvinculacionesInputs, setSubvinculacionesInputs] = useState([
    { nombre: "", documentos: "" },
  ]);
  const [nuevasSubvinculaciones, setNuevasSubvinculaciones] = useState({});
  const [loadingGuardar, setLoadingGuardar] = useState({});
  const [loadingBorrarSub, setLoadingBorrarSub] = useState({});
  const [loadingBorrarVinc, setLoadingBorrarVinc] = useState({});
  const [loadingGuardarModal, setLoadingGuardarModal] = useState(false);

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [accionConfirmar, setAccionConfirmar] = useState(null);
  const [textoConfirmacion, setTextoConfirmacion] = useState("");

  const [erroresVinculacion, setErroresVinculacion] = useState({});
  const [erroresSubvinculacion, setErroresSubvinculacion] = useState({});
  const [erroresDocumentos, setErroresDocumentos] = useState({});
  const [erroresNuevaVinculacion, setErroresNuevaVinculacion] = useState("");
  const [erroresNuevaSubvinculacion, setErroresNuevaSubvinculacion] = useState(
    []
  );

  const solicitarConfirmacion = (texto, accion) => {
    setTextoConfirmacion(texto);
    setAccionConfirmar(() => accion);
    setMostrarConfirmacion(true);
  };

  const confirmarAccion = () => {
    if (accionConfirmar) accionConfirmar();
    setMostrarConfirmacion(false);
  };

  const cancelarAccion = () => {
    setMostrarConfirmacion(false);
  };

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

  const obtenerDatos = async () => {
    const docsRequeridosSnap = await getDocs(
      collection(db, "documentosRequeridos")
    );
    const vinculacionesSnap = await getDocs(collection(db, "vinculaciones"));

    // Mapa de subvinculación -> documentos
    const documentosMap = {};
    docsRequeridosSnap.forEach((doc) => {
      documentosMap[doc.id] = doc.data().documentos || [];
    });

    // Estructura por cada vinculación con sus tipos y documentos
    const resultado = [];
    vinculacionesSnap.forEach((doc) => {
      const tipos = (doc.data().tipos || []).filter(
        (tipo) => tipo.trim() !== ""
      );
      const tiposConDocumentos = tipos.map((tipo) => ({
        nombre: tipo,
        documentos: documentosMap[tipo] || [],
      }));

      if (tipos.length > 0) {
        // Solo agregar si hay tipos válidos
        resultado.push({
          id: doc.id,
          tipos: tiposConDocumentos,
        });
      }
    });

    setVinculaciones(resultado);
  };

  const validarInputs = (vinculacionId) => {
    const nuevosErroresVinculacion = { ...erroresVinculacion };
    const nuevosErroresSubs = { ...erroresSubvinculacion };
    const nuevosErroresDocs = { ...erroresDocumentos };
    const nuevosErroresNuevasSubs = [];

    let valido = true;
    const nombresSubvinculaciones = new Set();

    // 1. Validar título de vinculación
    if (modoEdicion[vinculacionId]) {
      const titulo = titulosEditados[vinculacionId] ?? vinculacionId;
      if (!titulo || titulo.trim() === "") {
        nuevosErroresVinculacion[vinculacionId] =
          "El nombre de la vinculación es requerido";
        valido = false;
      } else {
        nuevosErroresVinculacion[vinculacionId] = "";
      }
    }

    // 2. Validar subvinculaciones editadas
    Object.entries(datosEditados).forEach(([clave, valor]) => {
      if (clave.startsWith(vinculacionId)) {
        // Validar nombre
        if (!valor.nombre || valor.nombre.trim() === "") {
          nuevosErroresSubs[`${clave}-nombre`] =
            "Nombre de subvinculación requerido";
          valido = false;
        } else {
          // Verificar duplicados
          if (nombresSubvinculaciones.has(valor.nombre.trim())) {
            nuevosErroresSubs[`${clave}-nombre`] = "Este nombre ya está en uso";
            valido = false;
          } else {
            nombresSubvinculaciones.add(valor.nombre.trim());
            nuevosErroresSubs[`${clave}-nombre`] = "";
          }
        }

        // Validar documentos
        if (!valor.documentos || valor.documentos.trim() === "") {
          nuevosErroresDocs[`${clave}-documentos`] =
            "Debe ingresar al menos un documento";
          valido = false;
        } else {
          nuevosErroresDocs[`${clave}-documentos`] = "";
        }
      }
    });

    // 3. Validar nuevas subvinculaciones
    const nuevasSubs = nuevasSubvinculaciones[vinculacionId] || [];
    nuevasSubs.forEach((sub, index) => {
      const errorMsgs = [];

      // Validar nombre
      if (!sub.nombre || sub.nombre.trim() === "") {
        errorMsgs.push("Nombre requerido");
        valido = false;
      } else if (nombresSubvinculaciones.has(sub.nombre.trim())) {
        errorMsgs.push("Nombre duplicado");
        valido = false;
      } else {
        nombresSubvinculaciones.add(sub.nombre.trim());
      }

      // Validar documentos
      if (!sub.documentos || sub.documentos.trim() === "") {
        errorMsgs.push("Documentos requeridos");
        valido = false;
      }

      nuevosErroresNuevasSubs[index] = errorMsgs.join(", ");
    });

    // Actualizar todos los estados de error en una sola operación
    setErroresVinculacion(nuevosErroresVinculacion);
    setErroresSubvinculacion(nuevosErroresSubs);
    setErroresDocumentos(nuevosErroresDocs);
    setErroresNuevaSubvinculacion(nuevosErroresNuevasSubs);

    return valido;
  };

  const guardarCambios = async (vinculacionId) => {
    // Validar antes de guardar
    if (!validarInputs(vinculacionId)) {
      return;
    }

    setLoadingGuardar((prev) => ({ ...prev, [vinculacionId]: true }));
    try {
      const cambios = Object.entries(datosEditados).filter(([clave]) =>
        clave.startsWith(vinculacionId)
      );

      // --- 1️⃣ Actualizar subvinculaciones existentes ---
      for (const [clave, { nombre, documentos }] of cambios) {
        const partes = clave.split("-");
        const nombreOriginal = partes.slice(1).join("-").trim();
        const documentosArr = documentos
          .split(",")
          .map((doc) => doc.trim())
          .filter(Boolean);

        if (nombreOriginal !== nombre) {
          // El nombre cambió → actualizamos en documentosRequeridos y tipos en vinculación
          await deleteDoc(doc(db, "documentosRequeridos", nombreOriginal));
          await setDoc(doc(db, "documentosRequeridos", nombre), {
            documentos: documentosArr,
          });

          const vincRef = doc(db, "vinculaciones", vinculacionId);
          await updateDoc(vincRef, {
            tipos: arrayRemove(nombreOriginal),
          });
          await updateDoc(vincRef, {
            tipos: arrayUnion(nombre),
          });
        } else {
          // El nombre no cambió → solo actualizamos documentos
          await setDoc(doc(db, "documentosRequeridos", nombre), {
            documentos: documentosArr,
          });
        }
      }

      // --- 2️⃣ Si cambió el ID de la vinculación ---
      if (
        titulosEditados[vinculacionId] &&
        titulosEditados[vinculacionId] !== vinculacionId
      ) {
        const nuevoId = titulosEditados[vinculacionId];
        const vincRef = doc(db, "vinculaciones", vinculacionId);
        const vincSnap = await getDoc(vincRef);

        if (vincSnap.exists()) {
          await setDoc(doc(db, "vinculaciones", nuevoId), vincSnap.data());
          await deleteDoc(vincRef);
        }
      }

      // --- 3️⃣ Guardar nuevas subvinculaciones ---
      const nuevasSubs = nuevasSubvinculaciones[vinculacionId] || [];
      if (nuevasSubs.length > 0) {
        const vincRef = doc(db, "vinculaciones", vinculacionId);

        for (const sub of nuevasSubs) {
          const nombre = sub.nombre.trim();
          const documentosArr = sub.documentos
            .split(",")
            .map((doc) => doc.trim())
            .filter(Boolean);

          await updateDoc(vincRef, { tipos: arrayUnion(nombre) });
          await setDoc(doc(db, "documentosRequeridos", nombre), {
            documentos: documentosArr,
          });
        }

        // Limpiar después de guardar
        setNuevasSubvinculaciones((prev) => {
          const copia = { ...prev };
          delete copia[vinculacionId];
          return copia;
        });
      }

      // --- 4️⃣ Reset de estados ---
      setModoEdicion((prev) => ({ ...prev, [vinculacionId]: false }));
      setDatosEditados({});
      obtenerDatos();
    } finally {
      setLoadingGuardar((prev) => ({ ...prev, [vinculacionId]: false }));
    }
  };

  const borrarSubvinculacion = async (vinculacionId, nombreTipo) => {
    const clave = `${vinculacionId}-${nombreTipo}`;
    setLoadingBorrarSub((prev) => ({ ...prev, [clave]: true }));
    try {
      await deleteDoc(doc(db, "documentosRequeridos", nombreTipo));
      await updateDoc(doc(db, "vinculaciones", vinculacionId), {
        tipos: arrayRemove(nombreTipo),
      });
      obtenerDatos();
    } finally {
      setLoadingBorrarSub((prev) => ({ ...prev, [clave]: false }));
    }
  };

  const eliminarVinculacionCompleta = async (vinculacionId, tipos) => {
    setLoadingBorrarVinc((prev) => ({ ...prev, [vinculacionId]: true }));
    try {
      const promesas = tipos.map((tipo) =>
        deleteDoc(doc(db, "documentosRequeridos", tipo.nombre))
      );
      await Promise.all(promesas);
      await deleteDoc(doc(db, "vinculaciones", vinculacionId));
      obtenerDatos();
    } finally {
      setLoadingBorrarVinc((prev) => ({ ...prev, [vinculacionId]: false }));
    }
  };

  const cancelarEdicionTarjeta = (vincId) => {
    setModoEdicion((prev) => ({ ...prev, [vincId]: false }));
    // Elimina solo los edits de esa tarjeta
    const nuevosDatos = { ...datosEditados };
    Object.keys(nuevosDatos).forEach((key) => {
      if (key.startsWith(`${vincId}-`)) {
        delete nuevosDatos[key];
      }
    });
    setDatosEditados(nuevosDatos);
    // 🔹 Elimina también las nuevas subvinculaciones creadas en esa tarjeta
    setNuevasSubvinculaciones((prev) => {
      const copia = { ...prev };
      delete copia[vincId];
      return copia;
    });
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  return (
    <Header>
      {mostrarConfirmacion && (
        <div className="modal">
          <div className="modal-contenido" style={{ padding: "20px" }}>
            <h3>Confirmar acción</h3>
            <p>{textoConfirmacion}</p>
            <div className="modal-acciones">
              <button
                onClick={confirmarAccion}
                className="btnAzul"
                style={{ backgroundColor: "var(--color-aprobado)" }}
              >
                Sí
              </button>
              <button
                onClick={cancelarAccion}
                className="btnAzul"
                style={{ backgroundColor: "var(--color-pendiente)" }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="table-header">
        <h2>Gestionar vinculaciones</h2>
        <div className="acciones-header">
          <button className="btnAzul" onClick={() => setMostrarModal(true)}>
            Agregar vinculacion
          </button>
        </div>
      </div>

      <div className="contenedor-documentos">
        <div className="tarjetas-contenedor">
          {vinculaciones.map((vinc, index) => (
            <div key={index} className="tarjeta">
              <div className="tarjeta-header">
                {modoEdicion[vinc.id] ? (
                  <div style={{ width: "100%" }}>
                    <input
                      required
                      value={titulosEditados[vinc.id] ?? vinc.id}
                      onChange={(e) => {
                        setTitulosEditados((prev) => ({
                          ...prev,
                          [vinc.id]: e.target.value,
                        }));
                        setErroresVinculacion((prev) => ({
                          ...prev,
                          [vinc.id]:
                            e.target.value.trim() === ""
                              ? "El nombre de la vinculación no puede estar vacío"
                              : "",
                        }));
                      }}
                      style={{ fontSize: "24px", width: "97%" }}
                    />
                    {erroresVinculacion[vinc.id] && (
                      <p
                        style={{
                          color: "var(--color-pendiente)",
                          margin: "5px 0 0 0",
                          fontSize: "14px",
                        }}
                      >
                        {erroresVinculacion[vinc.id]}
                      </p>
                    )}
                  </div>
                ) : (
                  <h2>{vinc.id}</h2>
                )}
                <div style={{ display: "flex", gap: "9px" }}>
                  {!modoEdicion[vinc.id] && (
                    <>
                      <button
                        className="btnAzul2"
                        onClick={() =>
                          setModoEdicion((prev) => ({
                            ...prev,
                            [vinc.id]: true,
                          }))
                        }
                      >
                        <img
                          src={EditarIcon}
                          alt="Editar"
                          className="w-6 h-6"
                        />
                      </button>
                      <button
                        className="btnAzul2"
                        onClick={() =>
                          solicitarConfirmacion(
                            `¿Estás seguro de que deseas borrar la vinculación "${vinc.id}" y todas sus subvinculaciones?`,
                            () =>
                              eliminarVinculacionCompleta(vinc.id, vinc.tipos)
                          )
                        }
                        disabled={loadingBorrarVinc[vinc.id]}
                      >
                        {loadingBorrarVinc[vinc.id] ? (
                          <div style={{ color: "#0b3c4d" }}>
                            <DotSpinner />
                          </div>
                        ) : (
                          <img
                            src={BorrarIcon}
                            alt="Borrar"
                            className="w-6 h-6"
                          />
                        )}
                      </button>
                    </>
                  )}
                </div>
                {modoEdicion[vinc.id] && (
                  <button
                    className="btnAzul2"
                    onClick={() => guardarCambios(vinc.id)}
                    style={{ width: "45px" }}
                    disabled={loadingGuardar[vinc.id]}
                  >
                    {loadingGuardar[vinc.id] ? (
                      <div style={{ color: "#0b3c4d" }}>
                        <DotSpinner />
                      </div>
                    ) : (
                      <img
                        src={GuardarIcon}
                        alt="Guardar"
                        className="w-6 h-6"
                      />
                    )}
                  </button>
                )}
                {modoEdicion[vinc.id] && (
                  <button
                    className="btnAzul2"
                    onClick={() => cancelarEdicionTarjeta(vinc.id)}
                    style={{ width: "45px" }}
                  >
                    <img
                      src={CancelarIcon}
                      alt="Cancelar"
                      className="w-6 h-6"
                    />
                  </button>
                )}
              </div>

              {vinc.tipos.map((tipo, idx) => {
                // Saltar tipos con nombre vacío
                if (!tipo.nombre || tipo.nombre.trim() === "") return null;

                const clave = `${vinc.id}-${tipo.nombre}`;
                const editando = datosEditados[clave];

                return (
                  <div key={idx} className="subvinculacion">
                    <div className="subvinculacion-header">
                      {editando ? (
                        <>
                          <div style={{ width: "100%" }}>
                            <input
                              required
                              value={editando.nombre}
                              onChange={(e) =>
                                setDatosEditados((prev) => ({
                                  ...prev,
                                  [clave]: {
                                    ...prev[clave],
                                    nombre: e.target.value,
                                  },
                                }))
                              }
                              style={{ width: "97%" }}
                            />
                            {erroresSubvinculacion[`${clave}-nombre`] && (
                              <p
                                style={{
                                  color: "var(--color-pendiente)",
                                  margin: "5px 0 0 0",
                                  fontSize: "14px",
                                }}
                              >
                                {erroresSubvinculacion[`${clave}-nombre`]}
                              </p>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: "10px" }}>
                            <button
                              className="btnAzul2"
                              onClick={() => guardarCambios(vinc.id)}
                              style={{ width: "45px" }}
                              disabled={loadingGuardar[vinc.id]}
                            >
                              {loadingGuardar[vinc.id] ? (
                                <div style={{ color: "#0b3c4d" }}>
                                  <DotSpinner />
                                </div>
                              ) : (
                                <img
                                  src={GuardarIcon}
                                  alt="Guardar"
                                  className="w-6 h-6"
                                />
                              )}
                            </button>
                            <button
                              className="btnAzul2"
                              onClick={() =>
                                setDatosEditados((prev) => {
                                  const nuevos = { ...prev };
                                  delete nuevos[clave];
                                  return nuevos;
                                })
                              }
                              style={{ width: "45px" }}
                            >
                              <img
                                src={CancelarIcon}
                                alt="Cancelar"
                                className="w-6 h-6"
                              />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="tarjeta-header">
                            <h3>{tipo.nombre}</h3>
                            {modoEdicion[vinc.id] && (
                              <div style={{ display: "flex", gap: "9px" }}>
                                <button
                                  className="btnAzul2"
                                  onClick={() =>
                                    setDatosEditados((prev) => ({
                                      ...prev,
                                      [clave]: {
                                        nombre: tipo.nombre,
                                        documentos: tipo.documentos.join(", "),
                                      },
                                    }))
                                  }
                                >
                                  <img
                                    src={EditarIcon}
                                    alt="Editar"
                                    className="w-6 h-6"
                                  />
                                </button>
                                <button
                                  className="btnAzul2"
                                  onClick={() =>
                                    solicitarConfirmacion(
                                      `¿Estás seguro de que deseas borrar la subvinculación "${tipo.nombre}"?`,
                                      () =>
                                        borrarSubvinculacion(
                                          vinc.id,
                                          tipo.nombre
                                        )
                                    )
                                  }
                                  disabled={
                                    loadingBorrarSub[
                                      `${vinc.id}-${tipo.nombre}`
                                    ]
                                  }
                                >
                                  {loadingBorrarSub[
                                    `${vinc.id}-${tipo.nombre}`
                                  ] ? (
                                    <div style={{ color: "#0b3c4d" }}>
                                      <DotSpinner />
                                    </div>
                                  ) : (
                                    <img
                                      src={BorrarIcon}
                                      alt="Borrar"
                                      className="w-6 h-6"
                                    />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {editando ? (
                      <div style={{ width: "100%", marginTop: "10px" }}>
                        <textarea
                          value={editando.documentos}
                          onChange={(e) =>
                            setDatosEditados((prev) => ({
                              ...prev,
                              [clave]: {
                                ...prev[clave],
                                documentos: e.target.value,
                              },
                            }))
                          }
                          style={{ width: "97%" }}
                        />
                        {erroresDocumentos[`${clave}-documentos`] && (
                          <p
                            style={{
                              color: "var(--color-pendiente)",
                              margin: "5px 0 0 0",
                              fontSize: "14px",
                            }}
                          >
                            {erroresDocumentos[`${clave}-documentos`]}
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <p>
                          <strong>Documentos:</strong>
                        </p>
                        {tipo.documentos.length > 0 ? (
                          <ul>
                            {tipo.documentos.map((doc, index) => (
                              <li key={index}>{doc}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>Ninguno</p>
                        )}
                      </>
                    )}
                  </div>
                );
              })}

              {/* Lista de nuevas subvinculaciones */}
              {(nuevasSubvinculaciones[vinc.id] || []).map((sub, subIndex) => {
                const errorKey = `nueva-${vinc.id}-${subIndex}`;
                const errores = erroresNuevaSubvinculacion[subIndex] || "";

                return (
                  <div key={subIndex} style={{ marginBottom: "10px" }}>
                    {/* Campo de nombre */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      <div style={{ width: "100%" }}>
                        <input
                          placeholder="Nombre de subvinculación"
                          value={sub.nombre}
                          required
                          onChange={(e) => {
                            setNuevasSubvinculaciones((prev) => {
                              const copia = { ...prev };
                              copia[vinc.id][subIndex].nombre = e.target.value;
                              return copia;
                            });
                            // Limpiar error al escribir
                            if (errores) {
                              const nuevosErrores = [
                                ...erroresNuevaSubvinculacion,
                              ];
                              nuevosErrores[subIndex] = "";
                              setErroresNuevaSubvinculacion(nuevosErrores);
                            }
                          }}
                          style={{ width: "97%" }}
                        />
                      </div>
                      <button
                        className="btnAzul2"
                        onClick={() => guardarCambios(vinc.id)}
                        style={{ width: "45px" }}
                        disabled={loadingGuardar[vinc.id]}
                      >
                        {loadingGuardar[vinc.id] ? (
                          <div style={{ color: "#0b3c4d" }}>
                            <DotSpinner />
                          </div>
                        ) : (
                          <img
                            src={GuardarIcon}
                            alt="Guardar"
                            className="w-6 h-6"
                          />
                        )}
                      </button>
                      <button
                        className="btnAzul2"
                        onClick={() => {
                          setNuevasSubvinculaciones((prev) => {
                            const copia = { ...prev };
                            copia[vinc.id] = copia[vinc.id].filter(
                              (_, i) => i !== subIndex
                            );
                            if (copia[vinc.id].length === 0)
                              delete copia[vinc.id];
                            return copia;
                          });
                          // Limpiar errores al eliminar
                          const nuevosErrores = [...erroresNuevaSubvinculacion];
                          nuevosErrores.splice(subIndex, 1);
                          setErroresNuevaSubvinculacion(nuevosErrores);
                        }}
                        style={{ width: "45px" }}
                      >
                        <img
                          src={CancelarIcon}
                          alt="Eliminar"
                          className="w-6 h-6"
                        />
                      </button>
                    </div>

                    {/* Mostrar errores de nombre */}
                    {errores.includes("Nombre") && (
                      <p
                        style={{
                          color: "var(--color-pendiente)",
                          margin: "5px 0 0 0",
                          fontSize: "14px",
                        }}
                      >
                        {errores.split(",").find((e) => e.includes("Nombre"))}
                      </p>
                    )}

                    {/* Campo de documentos */}
                    <div style={{ marginBottom: "10px" }}>
                      <textarea
                        placeholder="Documentos requeridos (separados por comas)"
                        value={sub.documentos}
                        required
                        onChange={(e) => {
                          setNuevasSubvinculaciones((prev) => {
                            const copia = { ...prev };
                            copia[vinc.id][subIndex].documentos =
                              e.target.value;
                            return copia;
                          });
                          // Limpiar error al escribir
                          if (errores.includes("Documentos")) {
                            const nuevosErrores = [
                              ...erroresNuevaSubvinculacion,
                            ];
                            nuevosErrores[subIndex] = nuevosErrores[
                              subIndex
                            ].replace(/Documentos[^,]*/, "");
                            setErroresNuevaSubvinculacion(nuevosErrores);
                          }
                        }}
                        style={{ width: "98%" }}
                      />

                      {/* Mostrar errores de documentos */}
                      {errores.includes("Documentos") && (
                        <p
                          style={{
                            color: "var(--color-pendiente)",
                            margin: "5px 0 0 0",
                            fontSize: "14px",
                          }}
                        >
                          {errores
                            .split(",")
                            .find((e) => e.includes("Documentos"))}
                        </p>
                      )}
                    </div>

                    {/* Mostrar otros errores (como duplicados) */}
                    {errores
                      .split(",")
                      .some(
                        (e) =>
                          !["Nombre", "Documentos"].some((prefix) =>
                            e.includes(prefix)
                          )
                      ) && (
                      <p
                        style={{
                          color: "var(--color-pendiente)",
                          margin: "5px 0 0 0",
                          fontSize: "14px",
                        }}
                      >
                        {errores
                          .split(",")
                          .find(
                            (e) =>
                              !["Nombre", "Documentos"].some((prefix) =>
                                e.includes(prefix)
                              )
                          )}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Botón para agregar nueva subvinculación */}
              {modoEdicion[vinc.id] && (
                <button
                  type="button"
                  className="btn-agregar-subvinculacion"
                  style={{ marginBottom: "10px" }}
                  onClick={() => {
                    setNuevasSubvinculaciones((prev) => {
                      const copia = { ...prev };
                      if (!copia[vinc.id]) copia[vinc.id] = [];
                      copia[vinc.id].push({ nombre: "", documentos: "" });
                      return copia;
                    });
                  }}
                >
                  + Agregar subvinculación
                </button>
              )}

              {/* {modoEdicion[vinc.id] && (
                <div style={{ marginTop: "10px" }}>
                  <button
                    onClick={() => guardarCambios(vinc.id)}
                    style={{ width: "100%" }}
                    disabled={loadingGuardar[vinc.id]}
                  >
                    {loadingGuardar[vinc.id] ? (
                      <div style={{ color: "#0b3c4d" }}>
                        <DotSpinner />
                      </div>
                    ) : (
                      "Guardar"
                    )}
                  </button>
                </div>
              )} */}
            </div>
          ))}
        </div>

        {mostrarModal && (
          <div className="modal">
            <div className="modal-contenido">
              <h2 style={{ marginTop: 0 }}>Nueva Vinculación</h2>

              {/** Estado para manejar varias subvinculaciones */}
              {/** Debe declararse en el componente padre */}
              {/* const [subvinculacionesInputs, setSubvinculacionesInputs] = useState([{ nombre: "", documentos: "" }]); */}

              <form
                className="form-nueva-vinculacion"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setLoadingGuardarModal(true); // 🔹 Activar spinner

                  const vincId = e.target.vinculacion.value.trim();
                  const tipos = subvinculacionesInputs
                    .map((item) => item.nombre.trim())
                    .filter(Boolean);

                  if (!vincId || tipos.length === 0) {
                    alert(
                      "Debe proporcionar un nombre de vinculación y al menos una subvinculación válida"
                    );
                    return;
                  }

                  try {
                    await setDoc(doc(db, "vinculaciones", vincId), {
                      tipos: tipos,
                    });

                    for (const item of subvinculacionesInputs) {
                      const documentosArr = item.documentos
                        .split(",")
                        .map((doc) => doc.trim())
                        .filter((doc) => doc.length > 0);

                      await setDoc(
                        doc(db, "documentosRequeridos", item.nombre.trim()),
                        {
                          documentos: documentosArr,
                        }
                      );
                    }

                    obtenerDatos();
                    setMostrarModal(false);
                    setSubvinculacionesInputs([{ nombre: "", documentos: "" }]);
                  } catch (error) {
                    console.error("Error al crear vinculación:", error);
                  } finally {
                    setLoadingGuardarModal(false); // 🔹 Desactivar spinner
                  }
                }}
              >
                {/* Input para la vinculación */}
                <input
                  name="vinculacion"
                  placeholder="Vinculación"
                  required
                  style={{ fontSize: "18px", color: "var(--color-primario)" }}
                />

                {/* Render dinámico de subvinculaciones */}
                {subvinculacionesInputs.map((sub, index) => (
                  <div key={index} className="div-subvinculacion">
                    <input
                      placeholder="Subvinculación"
                      value={sub.nombre}
                      required
                      onChange={(e) => {
                        const newSubs = [...subvinculacionesInputs];
                        newSubs[index].nombre = e.target.value;
                        setSubvinculacionesInputs(newSubs);
                      }}
                      style={{ marginBottom: "10px" }}
                    />
                    <textarea
                      placeholder="Documentos separados por coma"
                      value={sub.documentos}
                      required
                      onChange={(e) => {
                        const newSubs = [...subvinculacionesInputs];
                        newSubs[index].documentos = e.target.value;
                        setSubvinculacionesInputs(newSubs);
                      }}
                    />
                  </div>
                ))}

                {/* Botón para agregar más subvinculaciones */}
                <button
                  type="button"
                  className="btn-agregar-subvinculacion"
                  onClick={() =>
                    setSubvinculacionesInputs((prev) => [
                      ...prev,
                      { nombre: "", documentos: "" },
                    ])
                  }
                >
                  + Agregar subvinculación
                </button>

                <div className="modal-acciones">
                  <div className="modal-acciones">
                    <button type="submit" disabled={loadingGuardarModal}>
                      {loadingGuardarModal ? (
                        <div style={{ color: "#0b3c4d" }}>
                          <DotSpinner />
                        </div>
                      ) : (
                        "Guardar"
                      )}
                    </button>
                    <button
                      className="btnAzul"
                      onClick={() => {
                        setMostrarModal(false);
                        setSubvinculacionesInputs([
                          { nombre: "", documentos: "" },
                        ]);
                      }}
                      type="button"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Header>
  );
}

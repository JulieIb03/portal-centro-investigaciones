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
      const tipos = doc.data().tipos || [];
      const tiposConDocumentos = tipos.map((tipo) => ({
        nombre: tipo,
        documentos: documentosMap[tipo] || [],
      }));
      resultado.push({
        id: doc.id,
        tipos: tiposConDocumentos,
      });
    });

    setVinculaciones(resultado);
  };

  const guardarCambios = async (vinculacionId) => {
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
  };

  const borrarSubvinculacion = async (vinculacionId, nombreTipo) => {
    await deleteDoc(doc(db, "documentosRequeridos", nombreTipo));
    await updateDoc(doc(db, "vinculaciones", vinculacionId), {
      tipos: arrayRemove(nombreTipo),
    });

    obtenerDatos();
  };

  const eliminarVinculacionCompleta = async (vinculacionId, tipos) => {
    // Borrar todos los documentos de documentosRequeridos
    const promesas = tipos.map((tipo) =>
      deleteDoc(doc(db, "documentosRequeridos", tipo.nombre))
    );
    await Promise.all(promesas);

    // Borrar la vinculación
    await deleteDoc(doc(db, "vinculaciones", vinculacionId));

    obtenerDatos();
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
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  return (
    <Header>
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
                  <input
                    value={titulosEditados[vinc.id] ?? vinc.id}
                    onChange={(e) =>
                      setTitulosEditados((prev) => ({
                        ...prev,
                        [vinc.id]: e.target.value,
                      }))
                    }
                    style={{ fontSize: "24px" }}
                  />
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
                        ✏️
                      </button>
                      <button
                        className="btnAzul2"
                        onClick={() =>
                          eliminarVinculacionCompleta(vinc.id, vinc.tipos)
                        }
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
                {modoEdicion[vinc.id] && (
                  <button
                    className="btnAzul2"
                    onClick={() => cancelarEdicionTarjeta(vinc.id)}
                    style={{ width: "45px" }}
                  >
                    ❌
                  </button>
                )}
              </div>

              {vinc.tipos.map((tipo, idx) => {
                const clave = `${vinc.id}-${tipo.nombre}`;
                const editando = datosEditados[clave];

                return (
                  <div key={idx} className="subvinculacion">
                    <div className="subvinculacion-header">
                      {editando ? (
                        <>
                          <input
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
                          />
                          <div>
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
                              ❌
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
                                  ✏️
                                </button>
                                <button
                                  className="btnAzul2"
                                  onClick={() =>
                                    borrarSubvinculacion(vinc.id, tipo.nombre)
                                  }
                                >
                                  🗑️
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {editando ? (
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
                      />
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
              {(nuevasSubvinculaciones[vinc.id] || []).map((sub, subIndex) => (
                <div key={subIndex} style={{ marginBottom: "10px" }}>
                  <input
                    placeholder="Subvinculación"
                    value={sub.nombre}
                    required
                    onChange={(e) => {
                      setNuevasSubvinculaciones((prev) => {
                        const copia = { ...prev };
                        copia[vinc.id][subIndex].nombre = e.target.value;
                        return copia;
                      });
                    }}
                    style={{fontSize:'18px', marginBottom:'10px'}}
                  />
                  <textarea
                    placeholder="Documentos separados por coma"
                    value={sub.documentos}
                    required
                    onChange={(e) => {
                      setNuevasSubvinculaciones((prev) => {
                        const copia = { ...prev };
                        copia[vinc.id][subIndex].documentos = e.target.value;
                        return copia;
                      });
                    }}
                  />
                </div>
              ))}

              {/* Botón para agregar nueva subvinculación */}
              {modoEdicion[vinc.id] && (
                <button
                  type="button"
                  className="btn-agregar-subvinculacion"
                  style={{ marginBottom: "10px" }}
                  onClick={() =>
                    setNuevasSubvinculaciones((prev) => {
                      const copia = { ...prev };
                      if (!copia[vinc.id]) copia[vinc.id] = [];
                      copia[vinc.id].push({ nombre: "", documentos: "" });
                      return copia;
                    })
                  }
                >
                  + Agregar subvinculación
                </button>
              )}

              {modoEdicion[vinc.id] && (
                <div style={{ marginTop: "10px" }}>
                  <button
                    onClick={() => guardarCambios(vinc.id)}
                    style={{ width: "100%" }}
                  >
                    Guardar
                  </button>
                </div>
              )}
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

                  const vincId = e.target.vinculacion.value.trim();

                  // Obtener todas las subvinculaciones y documentos desde el estado
                  const tipos = subvinculacionesInputs
                    .map((item) => item.nombre.trim())
                    .filter(Boolean);

                  try {
                    // 1️⃣ Crear documento en "vinculaciones"
                    await setDoc(doc(db, "vinculaciones", vincId), {
                      tipos: tipos,
                    });

                    // 2️⃣ Crear un documento en "documentosRequeridos" por cada subvinculación
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

                    // 3️⃣ Refrescar datos y cerrar modal
                    obtenerDatos();
                    setMostrarModal(false);
                    setSubvinculacionesInputs([{ nombre: "", documentos: "" }]); // reset
                  } catch (error) {
                    console.error("Error al crear vinculación:", error);
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
                  <button type="submit" className="btnAzul">
                    Guardar
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
              </form>
            </div>
          </div>
        )}
      </div>
    </Header>
  );
}

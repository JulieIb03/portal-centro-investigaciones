import React, { useState, useEffect } from "react";
import Header from "../layout/Header";
import "../styles/EditarDocumentos.css";
import { db } from "../Credenciales";
import {
  collection,
  getDocs,
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

    for (const [clave, { nombre, documentos }] of cambios) {
      const partes = clave.split("-");
      const nombreOriginal = partes.slice(1).join("-");

      // Eliminar viejo si cambió el nombre
      if (nombreOriginal !== nombre) {
        await deleteDoc(doc(db, "documentosRequeridos", nombreOriginal));
        await updateDoc(doc(db, "vinculaciones", vinculacionId), {
          tipos: arrayRemove(nombreOriginal),
        });
      }

      // Guardar nuevo documento
      await setDoc(doc(db, "documentosRequeridos", nombre), {
        documentos: documentos.split(",").map((doc) => doc.trim()),
      });

      await updateDoc(doc(db, "vinculaciones", vinculacionId), {
        tipos: arrayUnion(nombre),
      });

      await updateDoc(doc(db, "vinculaciones", vinculacionId), {
        titulo: titulosEditados[vinculacionId],
      });
    }

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
                    value={vinc.id}
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

              {modoEdicion[vinc.id] && (
                <div style={{ marginTop: "10px" }}>
                  <button
                    className="btnAzul"
                    onClick={() => guardarCambios(vinc.id)}
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
              <h3>Nueva Vinculación</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // lógica para guardar
                  setMostrarModal(false);
                }}
              >
                <input placeholder="Vinculación" required />
                <input placeholder="Subvinculación" required />
                <textarea
                  placeholder="Documentos separados por coma"
                  required
                />
                <div className="modal-acciones">
                  <button type="submit" className="btnAzul">
                    Guardar
                  </button>
                  <button onClick={() => setMostrarModal(false)}>
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

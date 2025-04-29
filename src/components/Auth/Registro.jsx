import React, { useState } from "react";
import "../../styles/Auth.css";
import logo from "../../assets/LogoUMNG.png";
import { useAuth } from "./AuthProvider";
import { API_URL } from "./constants";
import { Navigate, useNavigate } from "react-router-dom";

const Registro = () => {
  const [errorResponse, setErrorResponse] = useState("");

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    rol: "",
    correo: "",
    contrasena: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/registro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          rol: formData.rol,
          correo: formData.correo,
          contrasena: formData.contrasena,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Registro exitoso:", data.body.message);
        navigate("/");
      } else {
        console.log("Error en el registro:", data.body.error);
        setErrorResponse(data.body.error || "Error desconocido");
      }
    } catch (error) {
      console.log(error);
      setErrorResponse("Error de conexión con el servidor");
    }
  }

  const auth = useAuth();

  if (auth.isAuthenticated) {
    return <Navigate to="/home" />;
  }

  return (
    <div className="auth-container">
      <div className="contenedor">
        <div className="header">
          <img src={logo} alt="Logo UMNG" className="header-logo" />
          <h2>Portal Centro de Investigaciones</h2>
        </div>
        <div className="form">
          <form onSubmit={handleSubmit}>
            <h1>REGISTRO</h1>
            <label htmlFor="nombre">Nombre</label>
            <div className="input-container">
              <box-icon name="user" color="#8c8d8e"></box-icon>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <label htmlFor="rol">Rol</label>
            <div className="input-container">
              <select
                id="rol"
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione</option>
                <option value="docente">Docente</option>
                <option value="revisor">Revisor</option>
              </select>
            </div>
            <label htmlFor="correo">Correo</label>
            <div className="input-container">
              <box-icon name="envelope" color="#8c8d8e"></box-icon>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                required
              />
            </div>
            <label htmlFor="contrasena">Contraseña</label>
            <div className="input-container">
              <box-icon name="key" color="#8c8d8e"></box-icon>
              <input
                type="password"
                name="contrasena"
                value={formData.contrasena}
                onChange={handleChange}
                required
              />
            </div>
            {errorResponse && (
              <div className="error-message">{errorResponse}</div>
            )}
            <p>
              ¿Ya tienes una cuenta? <a href="/">Inicia Sesión</a>
            </p>
            <button type="submit">Registrarme</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registro;

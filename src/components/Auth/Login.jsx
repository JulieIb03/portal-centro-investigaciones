import React, { useState } from "react";
import "../../styles/Auth.css";
import logo from "../../assets/LogoUMNG.png";
import { useAuth } from "./AuthProvider";
import { API_URL } from "./constants";
import { Navigate, useNavigate } from "react-router-dom";

const Login = () => {
  const [errorResponse, setErrorResponse] = useState("");

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: formData.correo,
          contrasena: formData.contrasena,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login exitoso");
        navigate("/home");
      } else {
        console.log("Error en el login:", data.body.error);
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
            <h1>INICIO DE SESIÓN</h1>
            <label htmlFor="correo">Correo</label>
            <div className="input-container">
              <box-icon name="envelope" color="#8c8d8e"></box-icon>
              <input
                id="correo"
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
                id="contraseñna"
                type="password"
                name="contrasena"
                value={formData.contrasena}
                onChange={handleChange}
                required
              />
            </div>
            <p>
              ¿No tienes cuenta? <a href="/registro">Regístrate</a>
            </p>
            <button type="submit">Iniciar Sesión</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

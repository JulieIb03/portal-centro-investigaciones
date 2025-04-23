import React, { useState } from "react";
import "../../styles/Auth.css";
import logo from "../../assets/LogoUMNG.png";

const Login = () => {
  const [formData, setFormData] = useState({
    correo: "",
    contraseña: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos de login:", formData); // Lógica de autenticación aquí
  };

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

            <label htmlFor="contraseña">Contraseña</label>
            <div className="input-container">
              <box-icon name="key" color="#8c8d8e"></box-icon>
              <input
                id="contraseña"
                type="password"
                name="contraseña"
                value={formData.contraseña}
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

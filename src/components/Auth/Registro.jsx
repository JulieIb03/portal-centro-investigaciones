import React, { useState } from "react";
import "../../styles/Auth.css";
import logo from "../../assets/LogoUMNG.png";

const Registro = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    rol: "",
    correo: "",
    contraseña: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos enviados:", formData); // Aquí iría la lógica de registro
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
            <label htmlFor="contraseña">Contraseña</label>
            <div className="input-container">
              <box-icon name="key" color="#8c8d8e"></box-icon>
              <input
                type="password"
                name="contraseña"
                value={formData.contraseña}
                onChange={handleChange}
                required
              />
            </div>
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

import React, { useState, useEffect } from "react";
import "../../styles/Default.css";
import "../../styles/Auth.css";
import logo from "../../assets/LogoUMNG.png";
import { Navigate, useNavigate } from "react-router-dom";

import appFirebase from "../../Credenciales";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";

const auth = getAuth(appFirebase);

export default function Login() {
  const [formData, setFormData] = useState({
    correo: "",
    contrasena: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const [mensaje, setMensaje] = useState("");
  const [errorResponse, setErrorResponse] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(
        auth,
        formData.correo,
        formData.contrasena
      );
      setErrorResponse(""); // Limpiar errores

      setMensaje("Inicio de sesión exitoso.");
      setErrorResponse("");
    } catch (err) {
      console.error(err);
      setErrorResponse("Credenciales incorrectas o error en el servidor.");
      setMensaje("");
    }
  };

  const [usuarioAutenticado, setUsuarioAutenticado] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuarioAutenticado(!!user);
    });
    return () => unsubscribe();
  }, []);

  if (usuarioAutenticado) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="auth-container">
      <div className="contenedor">
        <div className="header">
          <img src={logo} alt="Logo UMNG" className="header-logo" />
          <h2>Portal Centro de Investigaciones</h2>
        </div>
        <div className="form">
          <form onSubmit={handleLogin}>
            <h1>INICIO DE SESIÓN</h1>
            <label htmlFor="correo">Correo</label>
            <div className="input-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="27"
                height="22"
                viewBox="0 0 27 22"
                fill="none"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M1.125 0.875L0 2V20L1.125 21.125H25.875L27 20V2L25.875 0.875H1.125ZM2.25 4.54325V18.875H24.75V4.54288L13.4998 14.7704L2.25 4.54325ZM22.9649 3.125H4.03479L13.4998 11.7296L22.9649 3.125Z"
                  fill="#8C8D8E"
                />
              </svg>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="31"
                viewBox="0 0 30 31"
                fill="none"
              >
                <g>
                  <path
                    d="M19.6875 2.14423C18.3699 2.14389 17.0706 2.45219 15.8937 3.04443C14.7167 3.63667 13.6949 4.49637 12.91 5.55464C12.1251 6.61291 11.5991 7.84032 11.374 9.13851C11.1489 10.4367 11.2311 11.7696 11.6138 13.0303L1.875 22.7692V28.3942H7.5L17.2388 18.6553C18.3994 19.0077 19.6223 19.1057 20.8242 18.9427C22.026 18.7797 23.1786 18.3595 24.2034 17.7107C25.2282 17.0619 26.1011 16.1998 26.7625 15.1832C27.424 14.1666 27.8585 13.0193 28.0364 11.8195C28.2143 10.6197 28.1315 9.39573 27.7936 8.23089C27.4556 7.06604 26.8705 5.98773 26.0782 5.06947C25.2858 4.15121 24.3047 3.41457 23.2019 2.90976C22.0991 2.40495 20.9004 2.14384 19.6875 2.14423ZM19.6875 17.1442C19.042 17.1438 18.4 17.0484 17.7823 16.8609L16.7072 16.5349L15.9129 17.3291L12.9307 20.3115L11.6382 19.0192L10.3125 20.3449L11.605 21.6374L10.1182 23.1243L8.82572 21.8317L7.5 23.1574L8.79253 24.4499L6.72337 26.5192H3.75V23.5459L12.9397 14.3562L13.7339 13.5618L13.4083 12.4867C13.0076 11.1658 13.0336 9.7521 13.4827 8.4468C13.9318 7.14149 14.781 6.01103 15.9096 5.21622C17.0382 4.42141 18.3887 4.00273 19.769 4.01972C21.1493 4.03672 22.4891 4.48853 23.5978 5.31089C24.7065 6.13325 25.5276 7.28428 25.9444 8.60025C26.3612 9.91621 26.3525 11.3301 25.9193 12.6408C25.4862 13.9515 24.6508 15.0922 23.532 15.9007C22.4132 16.7092 21.0679 17.1444 19.6875 17.1442Z"
                    fill="#8C8D8E"
                  />
                  <path
                    d="M20.625 11.5192C21.6605 11.5192 22.5 10.6798 22.5 9.64423C22.5 8.60869 21.6605 7.76923 20.625 7.76923C19.5895 7.76923 18.75 8.60869 18.75 9.64423C18.75 10.6798 19.5895 11.5192 20.625 11.5192Z"
                    fill="#8C8D8E"
                  />
                </g>
              </svg>
              <input
                id="contrasena"
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
}

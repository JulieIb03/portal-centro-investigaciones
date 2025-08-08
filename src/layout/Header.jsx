import { Link } from "react-router-dom";
import React, { useState } from "react";
import "../styles/Header.css";
import logo from "../assets/LogoUMNG.png";
import { useAuth } from "../components/Auth/AuthProvider";

export default function Header({ children }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user } = useAuth();

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  return (
    <>
      <header className="main-header">
        <nav className="header-nav">
          <div className="logo-container">
            <Link to="/Dashboard">
              <img src={logo} alt="Logo UMNG" className="header-logo" />
            </Link>
          </div>

          <div className="user-menu">
            <div className="user-info" onClick={toggleDropdown}>
              <svg
                width="20"
                height="22"
                viewBox="0 0 20 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 20V18C18 16.9391 17.5786 15.9217 16.8284 15.1716C16.0783 14.4214 15.0609 14 14 14H6C4.93913 14 3.92172 14.4214 3.17157 15.1716C2.42143 15.9217 2 16.9391 2 18V20"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 10C12.2091 10 14 8.20914 14 6C14 3.79086 12.2091 2 10 2C7.79086 2 6 3.79086 6 6C6 8.20914 7.79086 10 10 10Z"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="username">{user?.nombre || "Usuario"}</span>
              <svg
                width="17"
                height="12"
                viewBox="0 0 17 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2 2L9 9L15.5 2" stroke="white" strokeWidth="3" />
              </svg>
            </div>

            {showDropdown && (
              <div className="dropdown-menu">
                {user?.rol === "revisor" && (
                  <Link to="/EditarDocumentos" className="dropdown-item">
                    <svg
                      id="Layer_1"
                      data-name="Layer 1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 122.88 119.19"
                      fill="white"
                      height="22px"
                    >
                      <path
                        class="cls-1"
                        d="M104.84,1.62,121.25,18a5.58,5.58,0,0,1,0,7.88L112.17,35l-24.3-24.3L97,1.62a5.6,5.6,0,0,1,7.88,0ZM31.26,3.43h36.3L51.12,19.87H31.26A14.75,14.75,0,0,0,20.8,24.2l0,0a14.75,14.75,0,0,0-4.33,10.46v68.07H84.5A14.78,14.78,0,0,0,95,98.43l0,0a14.78,14.78,0,0,0,4.33-10.47V75.29l16.44-16.44V87.93A31.22,31.22,0,0,1,106.59,110l0,.05a31.2,31.2,0,0,1-22,9.15h-72a12.5,12.5,0,0,1-8.83-3.67l0,0A12.51,12.51,0,0,1,0,106.65v-72a31.15,31.15,0,0,1,9.18-22l.05-.05a31.17,31.17,0,0,1,22-9.16ZM72.33,74.8,52.6,80.9c-13.85,3-13.73,6.15-11.16-6.91l6.64-23.44h0l0,0L83.27,15.31l24.3,24.3L72.35,74.83l0,0ZM52.22,54.7l16,16-13,4c-10.15,3.13-10.1,5.22-7.34-4.55l4.34-15.4Z"
                      />
                    </svg>
                    Editar documentos
                  </Link>
                )}
                <Link to="/logout" className="dropdown-item">
                  <svg
                    id="Layer_1"
                    data-name="Layer 1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 89.6 122.88"
                    fill="white"
                    height="22px"
                  >
                    <path d="M66.4,68.66H40.29a7.23,7.23,0,0,1,0-14.45H66.4l-8.48-9.46a7.25,7.25,0,0,1,.51-10.16,7.06,7.06,0,0,1,10.05.5L87.7,56.54a7.27,7.27,0,0,1,.06,9.72L68.48,87.77a7.05,7.05,0,0,1-10.05.51,7.25,7.25,0,0,1-.51-10.16l8.48-9.46ZM42.94,108.57a7.22,7.22,0,0,1-2.83,14.17l-3.37-.68C12.84,117.32,0,114.63,0,80.2V40.63C0,7.65,13.78,5.07,36.6.81L40.17.13A7.21,7.21,0,0,1,42.88,14.3L39.25,15c-15.46,2.89-24.8,4.63-24.8,25.65V80.2c0,22.61,8.77,24.46,25.1,27.7l3.39.67Z" />
                  </svg>
                  Cerrar sesión
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      <main>{children}</main>
    </>
  );
}

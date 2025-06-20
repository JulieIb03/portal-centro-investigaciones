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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="20"
            viewBox="0 0 30 20"
            fill="none"
          >
            <path
              d="M1.11612 9.11612C0.627961 9.60427 0.627961 10.3957 1.11612 10.8839L9.07107 18.8388C9.55922 19.327 10.3507 19.327 10.8388 18.8388C11.327 18.3507 11.327 17.5592 10.8388 17.0711L3.76777 10L10.8388 2.92893C11.327 2.44078 11.327 1.64932 10.8388 1.16117C10.3507 0.67301 9.55922 0.67301 9.07107 1.16117L1.11612 9.11612ZM30 8.75H2V11.25H30V8.75Z"
              fill="white"
            />
          </svg>

          <div className="logo-container">
            <img src={logo} alt="Logo UMNG" className="header-logo" />
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
                <Link to="/logout" className="dropdown-item">
                  <svg
                    fill="white"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16.44px"
                    height="22px"
                    viewBox="0 0 91.839 122.88"
                  >
                    <g>
                      <path d="M81.75,64.617H41.365c-1.738,0-3.147-1.423-3.147-3.178c0-1.756,1.409-3.179,3.147-3.179h40.383L68.559,43.155 c-1.146-1.31-1.025-3.311,0.271-4.469c1.297-1.159,3.278-1.037,4.425,0.273l17.798,20.383c1.065,1.216,1.037,3.029-0.011,4.21 L73.254,83.92c-1.146,1.311-3.128,1.433-4.425,0.273c-1.296-1.158-1.417-3.16-0.271-4.47L81.75,64.617L81.75,64.617z M70.841,99.629c0-1.756,1.423-3.179,3.178-3.179c1.756,0,3.179,1.423,3.179,3.179v14.242c0,2.475-1.017,4.729-2.648,6.36 c-1.633,1.632-3.887,2.648-6.36,2.648H9.009c-2.475,0-4.73-1.014-6.363-2.646C1.016,118.603,0,116.352,0,113.871V9.009 c0-2.48,1.013-4.733,2.644-6.365C4.275,1.013,6.528,0,9.009,0h59.18c2.479,0,4.731,1.016,6.362,2.646 c1.633,1.633,2.646,3.889,2.646,6.363V23.25c0,1.755-1.423,3.178-3.179,3.178c-1.755,0-3.178-1.423-3.178-3.178V9.009 c0-0.722-0.301-1.385-0.785-1.869c-0.482-0.482-1.144-0.783-1.867-0.783H9.009c-0.726,0-1.389,0.3-1.87,0.782 C6.656,7.62,6.357,8.283,6.357,9.009v104.862c0,0.724,0.301,1.385,0.783,1.867c0.484,0.484,1.147,0.785,1.869,0.785h59.18 c0.72,0,1.381-0.302,1.865-0.786c0.485-0.484,0.787-1.146,0.787-1.866V99.629L70.841,99.629z" />
                    </g>
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

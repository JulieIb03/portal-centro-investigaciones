import { Link } from "react-router-dom";
import React, { useState } from "react";
import "../styles/Header.css";
import logo from "../assets/LogoUMNG.png";

export default function Header({ children }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  return (
    <>
      <header className="main-header">
        <nav className="header-nav">
          <box-icon
            className="back-button"
            name="left-arrow-alt"
            color="#ffffff"
          ></box-icon>

          <div className="logo-container">
            <img src={logo} alt="Logo UMNG" className="header-logo" />
          </div>

          <div className="user-menu">
            <div className="user-info" onClick={toggleDropdown}>
              <box-icon className="user-icon" name="user" color="#ffffff"></box-icon>
              <span className="username">Usuario</span>
              <box-icon className="dropdown-icon" name='chevron-down' color='#ffffff' ></box-icon>
            </div>

            {showDropdown && (
              <div className="dropdown-menu">
                <Link to="/logout" className="dropdown-item">
                <box-icon name='log-out' color='#ffffff' ></box-icon> Cerrar sesión
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

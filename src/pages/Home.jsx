import React from "react";
import "../styles/Default.css";
import Header from "../layout/Header";

const Home = () => {
  return (
    <Header>
      <div>
        <h1>Bienvenido al Portal de Investigaciones</h1>
        <p>
          <a href="/login">Iniciar Sesión</a> |{" "}
          <a href="/registro">Registrarse</a>
        </p>
      </div>
    </Header>
  );
};

export default Home;

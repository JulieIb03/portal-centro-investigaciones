// eslint-disable-next-line
import "boxicons";
import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Registro from "./components/Auth/Registro";
import Login from "./components/Auth/Login";
import Home from "./pages/Home";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import { AuthProvider } from "./components/Auth/AuthProvider"; // asegúrate de ajustar la ruta según tu estructura
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

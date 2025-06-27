import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Registro from "./components/Auth/Registro";
import Login from "./components/Auth/Login";
import Logout from "./components/Auth/Logout";
import Dashboard from "./pages/Dashboard";
import DetallePostulacion from "./pages/DetallePostulacion";
import Revision from "./pages/Revision";
import { AuthProvider } from "./components/Auth/AuthProvider";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/logout" element={<Logout />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/detalle/:id" element={<DetallePostulacion />} />
            <Route path="/revision/:id" element={<Revision />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

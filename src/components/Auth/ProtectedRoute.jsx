import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute() {
  const { usuario } = useAuth();

  return usuario ? <Outlet /> : <Navigate to="/" />;
}
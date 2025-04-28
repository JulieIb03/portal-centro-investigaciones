import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

function ProtectedRoute () {
    const auth = useAuth()

    return auth.isAuthenticated ? <Outlet /> : <Navigate to="/" />
}

export default ProtectedRoute;
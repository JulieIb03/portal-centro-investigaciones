import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        navigate("/"); // Redirigir al login
      })
      .catch((error) => {
        console.error("Error al cerrar sesión:", error);
      });
  }, [navigate]);

  return null; 
}

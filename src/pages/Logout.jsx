import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token");
    navigate("/login");
  }, [navigate]);

  return null; // o un pequeño "Cerrando sesión..."
}

export default Logout;

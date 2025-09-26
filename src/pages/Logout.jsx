import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Logout() {
  const navigate = useNavigate();
  const hasRun = useRef(false); // evita doble ejecución en React 18 StrictMode

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const doLogout = async () => {
      const refresh = localStorage.getItem("refresh");
      try {
        await api.post("/auth/logout/", { refresh });
      } catch {
        // no bloqueamos el flujo
      } finally {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
      }
    };

    doLogout();
  }, [navigate]);

  return null; // o un "Cerrando sesión..."
}

export default Logout;

// src/components/RedirectToInitial.jsx
import { Navigate } from "react-router-dom";

function RedirectToInitial() {
  const token = localStorage.getItem("token");
  return <Navigate to={token ? "/dashboard" : "/login"} replace />;
}

export default RedirectToInitial;

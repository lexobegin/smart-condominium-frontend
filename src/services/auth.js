// src/services/auth.js
import api from "./axios";

// Función para obtener el usuario actualmente logueado desde localStorage
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem("user");
    console.log("Usuario obtenido de localStorage:", user);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error al leer el usuario de localStorage:", error);
    return null;
  }
};

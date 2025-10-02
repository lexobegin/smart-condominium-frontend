// services/usuarios.js
import api from "./axios";

export const fetchUsuarios = async (page = 1, search = "", filters = {}) => {
  const params = new URLSearchParams({
    page: page,
    ...(search && { search: search }),
    ...filters,
  });

  const response = await api.get(`/usuarios/?${params}`);
  return response.data;
};

export const fetchUsuario = async (id) => {
  const response = await api.get(`/usuarios/${id}/`);
  return response.data;
};

export const createUsuario = async (data) => {
  const response = await api.post("/usuarios/", data);
  return response.data;
};

export const updateUsuario = async (id, data) => {
  const response = await api.put(`/usuarios/${id}/`, data);
  return response.data;
};

export const deleteUsuario = async (id) => {
  const response = await api.delete(`/usuarios/${id}/`);
  return response.data;
};

export const registrarRostroUsuario = async (usuarioId, imagenBase64) => {
  const response = await api.post(`/registrar-rostro/${usuarioId}/`, {
    imagen: imagenBase64,
  });
  return response.data;
};

// Opciones para tipos de usuario
export const TIPOS_USUARIO = [
  { value: "residente", label: "Residente" },
  { value: "administrador", label: "Administrador" },
  { value: "seguridad", label: "Seguridad" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "portero", label: "Portero" },
];

// Opciones para géneros
export const GENEROS = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Femenino" },
  { value: "O", label: "Otro" },
];

// Opciones para estados
export const ESTADOS_USUARIO = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
  { value: "suspendido", label: "Suspendido" },
];

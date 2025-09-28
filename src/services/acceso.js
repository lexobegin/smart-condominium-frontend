// services/acceso.js
import api from "./axios";

export const fetchRegistrosAcceso = async (
  page = 1,
  search = "",
  filters = {}
) => {
  const params = new URLSearchParams({
    page: page,
    ...(search && { search: search }),
    ...filters,
  });

  const response = await api.get(`/registros-acceso/?${params}`);
  return response.data;
};

export const fetchRegistroAcceso = async (id) => {
  const response = await api.get(`/registros-acceso/${id}/`);
  return response.data;
};

export const createRegistroAcceso = async (data) => {
  const response = await api.post("/registros-acceso/", data);
  return response.data;
};

export const updateRegistroAcceso = async (id, data) => {
  const response = await api.put(`/registros-acceso/${id}/`, data);
  return response.data;
};

export const deleteRegistroAcceso = async (id) => {
  const response = await api.delete(`/registros-acceso/${id}/`);
  return response.data;
};

// Opciones para tipos de acceso
export const TIPOS_ACCESO = [
  { value: "peatonal", label: "Peatonal" },
  { value: "vehicular", label: "Vehicular" },
];

// Opciones para direcciones
export const DIRECCIONES = [
  { value: "entrada", label: "Entrada" },
  { value: "salida", label: "Salida" },
];

// Opciones para métodos de acceso
export const METODOS_ACCESO = [
  { value: "facial", label: "Reconocimiento Facial" },
  { value: "tarjeta", label: "Tarjeta de Acceso" },
  { value: "codigo", label: "Código de Acceso" },
  { value: "manual", label: "Registro Manual" },
  { value: "placa", label: "Reconocimiento de Placa" },
];

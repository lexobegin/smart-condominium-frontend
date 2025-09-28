// services/camaras.js
import api from "./axios";

export const fetchCamaras = async (page = 1, search = "") => {
  const response = await api.get(
    `/camaras-seguridad/?page=${page}&search=${search}`
  );
  return response.data;
};

export const fetchCamara = async (id) => {
  const response = await api.get(`/camaras-seguridad/${id}/`);
  return response.data;
};

export const createCamara = async (data) => {
  const response = await api.post("/camaras-seguridad/", data);
  return response.data;
};

export const updateCamara = async (id, data) => {
  const response = await api.put(`/camaras-seguridad/${id}/`, data);
  return response.data;
};

export const deleteCamara = async (id) => {
  const response = await api.delete(`/camaras-seguridad/${id}/`);
  return response.data;
};

// Opciones para tipos de cámara (basado en tu API)
export const TIPOS_CAMARA = [
  { value: "entrada_principal", label: "Entrada Principal" },
  { value: "estacionamiento", label: "Estacionamiento" },
  { value: "areas_comunes", label: "Áreas Comunes" },
  { value: "ascensores", label: "Ascensores" },
  { value: "pasillos", label: "Pasillos" },
  { value: "porteria", label: "Portería" },
  { value: "otros", label: "Otros" },
];

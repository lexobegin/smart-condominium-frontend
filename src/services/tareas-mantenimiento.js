// services/mantenimiento-preventivo.js
import api from "./axios"; // tu instancia de Axios

export const fetchMantenimientosPreventivos = async (page = 1, search = "") => {
  const response = await api.get(
    `/mantenimiento-preventivo/?page=${page}&search=${search}`
  );
  return response.data;
};

export const fetchMantenimientoPreventivo = async (id) => {
  const response = await api.get(`/mantenimiento-preventivo/${id}/`);
  return response.data;
};

export const createMantenimientoPreventivo = async (data) => {
  const response = await api.post("/mantenimiento-preventivo/", data);
  return response.data;
};

export const updateMantenimientoPreventivo = async (id, data) => {
  const response = await api.put(`/mantenimiento-preventivo/${id}/`, data);
  return response.data;
};

export const deleteMantenimientoPreventivo = async (id) => {
  const response = await api.delete(`/mantenimiento-preventivo/${id}/`);
  return response.data;
};

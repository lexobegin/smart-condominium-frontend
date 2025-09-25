// services/categorias-mantenimiento.js
import api from "./axios"; // tu instancia de Axios

export const fetchSolicitudesMantenimientos = async (page = 1, search = "") => {
  const response = await api.get(
    `/solicitudes-mantenimiento/?page=${page}&search=${search}`
  );
  return response.data;
};

export const fetchSolicitudMantenimiento = async (id) => {
  const response = await api.get(`/solicitudes-mantenimiento/${id}/`);
  return response.data;
};

export const createSolicitudMantenimiento = async (data) => {
  const response = await api.post("/solicitudes-mantenimiento/", data);
  return response.data;
};

export const updateSolicitudMantenimiento = async (id, data) => {
  const response = await api.put(`/solicitudes-mantenimiento/${id}/`, data);
  return response.data;
};

export const deleteSolicitudMantenimiento = async (id) => {
    try {
    const response = await api.delete(`/solicitudes-mantenimiento/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error eliminando categoría ${id}:`, error);
    throw error.response?.data || { detail: "Error eliminando categoría" };
  }
};

// services/mantenimiento-preventivo.js
import api from "./axios"; // tu instancia de Axios

export const fetchTareasMantenimientos = async (page = 1, search = "") => {
  const response = await api.get(
    `/tareas-mantenimiento/?page=${page}&search=${search}`
  );
  return response.data;
};

export const fetchTareaMantenimiento = async (id) => {
  const response = await api.get(`/tareas-mantenimiento/${id}/`);
  return response.data;
};

export const createTareaMantenimiento = async (data) => {
  const response = await api.post("/tareas-mantenimiento/", data);
  return response.data;
};

export const updateTareaMantenimiento = async (id, data) => {
  const response = await api.put(`/tareas-mantenimiento/${id}/`, data);
  return response.data;
};

export const deleteTareaMantenimiento = async (id) => {
  const response = await api.delete(`/tareas-mantenimiento/${id}/`);
  return response.data;
};

// services/areas-comunes.js
import api from "./axios"; // tu instancia de Axios

export const fetchAreasComunes = async (page = 1, search = "") => {
  const response = await api.get(
    `/areas-comunes/?page=${page}&search=${search}`
  );
  return response.data;
};

export const fetchAreaComun = async (id) => {
  const response = await api.get(`/areas-comunes/${id}/`);
  return response.data;
};

export const createAreaComun = async (data) => {
  const response = await api.post("/areas-comunes/", data);
  return response.data;
};

export const updateAreaComun = async (id, data) => {
  const response = await api.put(`/areas-comunes/${id}/`, data);
  return response.data;
};

export const deleteAreaComun = async (id) => {
  const response = await api.delete(`/areas-comunes/${id}/`);
  return response.data;
};

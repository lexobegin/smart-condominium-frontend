// services/categorias-mantenimiento.js
import api from "./axios"; // tu instancia de Axios

export const fetchCategoriasMantenimientos = async (page = 1, search = "") => {
  const response = await api.get(
    `/categorias-mantenimiento/?page=${page}&search=${search}`
  );
  return response.data;
};

export const fetchCategoriaMantenimiento = async (id) => {
  const response = await api.get(`/categorias-mantenimiento/${id}/`);
  return response.data;
};

export const createCategoriaMantenimiento = async (data) => {
  const response = await api.post("/categorias-mantenimiento/", data);
  return response.data;
};

export const updateCategoriaMantenimiento = async (id, data) => {
  const response = await api.put(`/categorias-mantenimiento/${id}/`, data);
  return response.data;
};

export const deleteCategoriaMantenimiento = async (id) => {
    const response = await api.delete(`/categorias-mantenimiento/${id}/`);
    return response.data;
};

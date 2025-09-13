// src/services/users.js
import api from "./axios"; // tu instancia de Axios que ya tienes

/*export async function fetchUsers() {
  const resp = await api.get("/usuarios/"); // Ajusta la ruta según tu backend
  return resp.data;
}*/

/*export const fetchUsers = async (page = 1) => {
  const response = await api.get(`/usuarios/?page=${page}`);
  return response.data;
};*/

export const fetchUsers = async (page = 1, search = "") => {
  const response = await api.get(`/usuarios/?page=${page}&search=${search}`);
  return response.data;
};

export async function fetchUser(userId) {
  const resp = await api.get(`/usuarios/${userId}/`);
  return resp.data;
}

export async function createUser(data) {
  const resp = await api.post("/usuarios/", data);
  return resp.data;
}

export async function updateUser(userId, data) {
  const resp = await api.put(`/usuarios/${userId}/`, data);
  return resp.data;
}

export async function deleteUser(userId) {
  const resp = await api.delete(`/usuarios/${userId}/`);
  return resp.data;
}

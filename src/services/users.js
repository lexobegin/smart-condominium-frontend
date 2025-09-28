// src/services/users.js
import api from "./axios";

/** Lista paginada con búsqueda opcional (?page=&search=) */
export async function fetchUsers(page = 1, search = "") {
  const { data } = await api.get("/usuarios/", {
    params: { page, ...(search ? { search } : {}) },
  });
  return data; // { count, results, ... }
}

export const listarUsers = async () => {
  const response = await api.get("/usuarios/todos/");
  return response.data;
};

export const listarUsersSeguridad = async () => {
  const response = await api.get("/usuarios/todos/?tipo=seguridad");
  return response.data;
};

export const listarResidentes = async () => {
  const response = await api.get("/usuarios/todos/?tipo=residente");
  return response.data;
};

/** Detalle por ID */
export async function fetchUser(userId) {
  const { data } = await api.get(`/usuarios/${userId}/`);
  return data;
}

/** Crear (usa UsuarioRegistroSerializer en tu backend) */
export async function createUser(payload) {
  const { data } = await api.post("/usuarios/", payload);
  return data;
}

/** Actualizar (PATCH para no enviar campos read_only como email) */
export async function updateUser(userId, payload) {
  const { data } = await api.patch(`/usuarios/${userId}/`, payload);
  return data;
}

/** Eliminar */
export async function deleteUser(userId) {
  await api.delete(`/usuarios/${userId}/`);
  return true; // DRF suele devolver 204 sin cuerpo
}

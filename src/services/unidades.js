// src/services/unidades.js
import api from "./axios";

/** Lista paginada con búsqueda opcional (?page=&search=) */
export async function fetchUnidades(page = 1, search = "") {
  const { data } = await api.get("/unidades/", {
    params: { page, ...(search ? { search } : {}) },
  });
  return data; // { count, results, ... }
}

export const listarUnidades = async () => {
  const response = await api.get("/unidades/todos/");
  return response.data;
};

/** Detalle por ID */
export async function fetchUnidad(id) {
  const { data } = await api.get(`/unidades/${id}/`);
  return data;
}

/** Crear */
export async function createUnidad(payload) {
  const { data } = await api.post("/unidades/", payload);
  return data;
}

/**
 * Actualizar (PUT = reemplazo completo).
 * Si prefieres actualización parcial, cambia a api.patch.
 */
export async function updateUnidad(id, payload) {
  const { data } = await api.put(`/unidades/${id}/`, payload);
  return data;

  // Alternativa parcial:
  // const { data } = await api.patch(`/unidades/${id}/`, payload);
  // return data;
}

/** Eliminar */
export async function deleteUnidad(id) {
  await api.delete(`/unidades/${id}/`);
  return true; // DRF suele devolver 204 sin cuerpo
}

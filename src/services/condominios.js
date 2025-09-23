// src/services/condominios.js
import api from "./axios";

/**
 * Lista paginada y con búsqueda opcional.
 * Ej: GET /condominios/?page=1&search=las
 */
export async function fetchCondominios(page = 1, search = "") {
  const { data } = await api.get("/condominios/", {
    params: { page, ...(search ? { search } : {}) },
  });
  return data; // { count, next, previous, results: [...] }
}

/** Obtiene un condominio por ID */
export async function fetchCondominio(id) {
  const { data } = await api.get(`/condominios/${id}/`);
  return data;
}

/** Crea un nuevo condominio */
export async function createCondominio(payload) {
  const { data } = await api.post("/condominios/", payload);
  return data;
}

/**
 * Actualiza un condominio (PUT = reemplazo completo).
 * Si prefieres actualización parcial, cambia a api.patch.
 */
export async function updateCondominio(id, payload) {
  const { data } = await api.put(`/condominios/${id}/`, payload);
  return data;

  // Alternativa parcial:
  // const { data } = await api.patch(`/condominios/${id}/`, payload);
  // return data;
}

/** Elimina un condominio */
export async function deleteCondominio(id) {
  await api.delete(`/condominios/${id}/`);
  return true; // DRF suele devolver 204 sin cuerpo
}

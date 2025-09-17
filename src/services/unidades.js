// src/services/unidades.js
import api from "./axios";

export async function fetchUnidades(page = 1, search = "") {
  const params = new URLSearchParams();
  params.append("page", page);
  if (search) params.append("search", search);

  const resp = await api.get(`/unidades/?${params.toString()}`);
  return resp.data;
}

export async function fetchUnidad(id) {
  const resp = await api.get(`/unidades/${id}/`);
  return resp.data;
}

export async function createUnidad(data) {
  const resp = await api.post("/unidades/", data);
  return resp.data;
}

export async function updateUnidad(id, data) {
  const resp = await api.put(`/unidades/${id}/`, data);
  return resp.data;
}

export async function deleteUnidad(id) {
  const resp = await api.delete(`/unidades/${id}/`);
  return resp.data;
}

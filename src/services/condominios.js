// src/services/condominios.js
import api from "./axios";

export async function fetchCondominios() {
  const resp = await api.get("/condominios/");
  return resp.data;
}

export async function fetchCondominio(id) {
  const resp = await api.get(`/condominios/${id}/`);
  return resp.data;
}

export async function createCondominio(data) {
  const resp = await api.post("/condominios/", data);
  return resp.data;
}

export async function updateCondominio(id, data) {
  const resp = await api.put(`/condominios/${id}/`, data);
  return resp.data;
}

export async function deleteCondominio(id) {
  const resp = await api.delete(`/condominios/${id}/`);
  return resp.data;
}

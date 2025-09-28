// services/visitantes.js
import api from "./axios";

export const fetchVisitantes = async (page = 1, search = "", filters = {}) => {
  const params = new URLSearchParams({
    page: page,
    ...(search && { search: search }),
    ...filters,
  });

  const response = await api.get(`/visitantes/?${params}`);
  return response.data;
};

export const fetchVisitante = async (id) => {
  const response = await api.get(`/visitantes/${id}/`);
  return response.data;
};

export const createVisitante = async (data) => {
  const response = await api.post("/visitantes/", data);
  return response.data;
};

export const updateVisitante = async (id, data) => {
  const response = await api.put(`/visitantes/${id}/`, data);
  return response.data;
};

export const deleteVisitante = async (id) => {
  const response = await api.delete(`/visitantes/${id}/`);
  return response.data;
};

export const registrarSalida = async (id, data = {}) => {
  const response = await api.post(`/visitantes/${id}/registrar-salida/`, data);
  return response.data;
};

// Opciones para motivos de visita comunes
export const MOTIVOS_VISITA = [
  { value: "visita_familiar", label: "Visita Familiar" },
  { value: "visita_amigo", label: "Visita a Amigo" },
  { value: "entrega_comida", label: "Entrega de Comida" },
  { value: "entrega_paquete", label: "Entrega de Paquete" },
  { value: "servicio_tecnico", label: "Servicio Técnico" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "limpieza", label: "Limpieza" },
  { value: "reunion", label: "Reunión" },
  { value: "trabajo", label: "Trabajo" },
  { value: "otro", label: "Otro" },
];

// services/notificaciones.js
import api from "./axios";

export const fetchNotificaciones = async (
  page = 1,
  search = "",
  filters = {}
) => {
  const params = new URLSearchParams({
    page: page,
    ...(search && { search: search }),
    ...filters,
  });

  const response = await api.get(`/notificaciones/?${params}`);
  return response.data;
};

export const fetchNotificacion = async (id) => {
  const response = await api.get(`/notificaciones/${id}/`);
  return response.data;
};

export const createNotificacion = async (data) => {
  const response = await api.post("/notificaciones/", data);
  return response.data;
};

export const updateNotificacion = async (id, data) => {
  const response = await api.put(`/notificaciones/${id}/`, data);
  return response.data;
};

export const deleteNotificacion = async (id) => {
  const response = await api.delete(`/notificaciones/${id}/`);
  return response.data;
};

export const marcarComoLeida = async (id) => {
  const response = await api.patch(`/notificaciones/${id}/marcar-leida/`);
  return response.data;
};

export const marcarComoEnviada = async (id) => {
  const response = await api.patch(`/notificaciones/${id}/marcar-enviada/`);
  return response.data;
};

// Opciones para tipos de notificación
export const TIPOS_NOTIFICACION = [
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "reserva", label: "Reserva" },
  { value: "pago", label: "Pago" },
  { value: "seguridad", label: "Seguridad" },
  { value: "general", label: "General" },
  { value: "emergencia", label: "Emergencia" },
  { value: "evento", label: "Evento" },
  { value: "sistema", label: "Sistema" },
];

// Opciones para prioridades
export const PRIORIDADES = [
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

// Opciones para estados
export const ESTADOS_NOTIFICACION = [
  { value: "enviada", label: "Enviada" },
  { value: "leida", label: "Leída" },
  { value: "pendiente", label: "Pendiente" },
];

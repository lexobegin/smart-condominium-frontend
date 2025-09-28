// services/incidentes.js
import api from "./axios";

export const fetchIncidentes = async (page = 1, search = "", filters = {}) => {
  const params = new URLSearchParams({
    page: page,
    ...(search && { search: search }),
    ...filters,
  });

  const response = await api.get(`/incidentes-seguridad/?${params}`);
  return response.data;
};

export const fetchIncidente = async (id) => {
  const response = await api.get(`/incidentes-seguridad/${id}/`);
  return response.data;
};

export const createIncidente = async (data) => {
  const response = await api.post("/incidentes-seguridad/", data);
  return response.data;
};

export const updateIncidente = async (id, data) => {
  const response = await api.put(`/incidentes-seguridad/${id}/`, data);
  return response.data;
};

export const deleteIncidente = async (id) => {
  const response = await api.delete(`/incidentes-seguridad/${id}/`);
  return response.data;
};

// Opciones para tipos de incidente
export const TIPOS_INCIDENTE = [
  { value: "intrusion", label: "Intrusión" },
  { value: "vandalismo", label: "Vandalismo" },
  { value: "robo", label: "Robo" },
  { value: "accidente", label: "Accidente" },
  { value: "incendio", label: "Incendio" },
  { value: "fuga_agua", label: "Fuga de Agua" },
  { value: "falla_electrica", label: "Falla Eléctrica" },
  { value: "mascota_suelta", label: "Mascota Suelta" },
  { value: "vehiculo_mal_estacionado", label: "Vehículo Mal Estacionado" },
  { value: "ruido_excesivo", label: "Ruido Excesivo" },
  { value: "sospechoso", label: "Persona Sospechosa" },
  { value: "otro", label: "Otro" },
];

// Opciones para niveles de gravedad
export const GRAVEDADES = [
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" },
];

// Opciones para estados del incidente
export const ESTADOS_INCIDENTE = [
  { value: "reportado", label: "Reportado" },
  { value: "investigando", label: "Investigando" },
  { value: "resuelto", label: "Resuelto" },
  { value: "cerrado", label: "Cerrado" },
];

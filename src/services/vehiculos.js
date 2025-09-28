// services/vehiculos.js
import api from "./axios";

export const fetchVehiculos = async (page = 1, search = "", filters = {}) => {
  const params = new URLSearchParams({
    page: page,
    ...(search && { search: search }),
    ...filters,
  });

  const response = await api.get(`/vehiculos/?${params}`);
  return response.data;
};

export const listarVehiculos = async () => {
  const response = await api.get("/vehiculos/todos/");
  return response.data;
};

export const fetchVehiculo = async (id) => {
  const response = await api.get(`/vehiculos/${id}/`);
  return response.data;
};

export const createVehiculo = async (data) => {
  const response = await api.post("/vehiculos/", data);
  return response.data;
};

export const updateVehiculo = async (id, data) => {
  const response = await api.put(`/vehiculos/${id}/`, data);
  return response.data;
};

export const deleteVehiculo = async (id) => {
  const response = await api.delete(`/vehiculos/${id}/`);
  return response.data;
};

// Opciones para marcas comunes de vehículos
export const MARCAS_VEHICULOS = [
  { value: "toyota", label: "Toyota" },
  { value: "honda", label: "Honda" },
  { value: "nissan", label: "Nissan" },
  { value: "hyundai", label: "Hyundai" },
  { value: "kia", label: "Kia" },
  { value: "ford", label: "Ford" },
  { value: "chevrolet", label: "Chevrolet" },
  { value: "volkswagen", label: "Volkswagen" },
  { value: "bmw", label: "BMW" },
  { value: "mercedes_benz", label: "Mercedes-Benz" },
  { value: "audi", label: "Audi" },
  { value: "mazda", label: "Mazda" },
  { value: "subaru", label: "Subaru" },
  { value: "mitsubishi", label: "Mitsubishi" },
  { value: "suzuki", label: "Suzuki" },
  { value: "renault", label: "Renault" },
  { value: "peugeot", label: "Peugeot" },
  { value: "citroen", label: "Citroën" },
  { value: "fiat", label: "Fiat" },
  { value: "volvo", label: "Volvo" },
  { value: "jeep", label: "Jeep" },
  { value: "land_rover", label: "Land Rover" },
  { value: "otra", label: "Otra" },
];

// Opciones para colores comunes
export const COLORES_VEHICULOS = [
  { value: "blanco", label: "Blanco" },
  { value: "negro", label: "Negro" },
  { value: "gris", label: "Gris" },
  { value: "plateado", label: "Plateado" },
  { value: "azul", label: "Azul" },
  { value: "rojo", label: "Rojo" },
  { value: "verde", label: "Verde" },
  { value: "amarillo", label: "Amarillo" },
  { value: "naranja", label: "Naranja" },
  { value: "marron", label: "Marrón" },
  { value: "beige", label: "Beige" },
  { value: "dorado", label: "Dorado" },
  { value: "otro", label: "Otro" },
];

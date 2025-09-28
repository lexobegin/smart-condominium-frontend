import api from "./api";

// Reporte de indicadores financieros
export const getReportesFinancieros = async () => {
  try {
    const response = await api.get("/reportes/financieros/");
    return response.data;
  } catch (error) {
    console.error("Error al obtener reportes financieros:", error);
    throw error;
  }
};

// Reporte de uso de áreas comunes
export const getReportesAreasComunes = async (condominioId = null) => {
  try {
    let url = "/reportes/areas-comunes/";
    if (condominioId) {
      url += `?condominio_id=${condominioId}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error al obtener reportes de áreas comunes:", error);
    throw error;
  }
};

// Reportes visuales (para gráficas)
export const getReportesVisuales = async () => {
  try {
    const response = await api.get("/reportes/visuales/");
    return response.data;
  } catch (error) {
    console.error("Error al obtener reportes visuales:", error);
    throw error;
  }
};

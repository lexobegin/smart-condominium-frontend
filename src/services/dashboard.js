// src/services/users.js
import api from "./axios";

export const fetchDashboardData = async () => {
  const response = await api.get("/admin/dashboard/");
  return response.data;
};

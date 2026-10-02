import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const investmentAPI = axios.create({
  baseURL: `${API_URL}/api/investments`,
});

investmentAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getMyInvestments = async () => {
  const response = await investmentAPI.get("/");
  return response.data;
};
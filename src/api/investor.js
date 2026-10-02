import axios from "axios";

const investorAPI = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/investors",
});

investorAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getInvestors = async () => {
  const response = await investorAPI.get("/");
  return response.data;
};

import { API_ORIGIN } from "./config.js";
import axios from "axios";

const API_URL = API_ORIGIN;

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
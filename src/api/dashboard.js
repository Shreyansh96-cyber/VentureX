import { API_ORIGIN } from "./config.js";
import axios from "axios";

const API_URL = API_ORIGIN;

const dashboardAPI = axios.create({
  baseURL: `${API_URL}/api/dashboard`,
});

dashboardAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getFounderDashboardStats = async () => {
  const response = await dashboardAPI.get("/founder/stats");
  return response.data;
};

export const getFounderFundingAnalytics = async () => {
  const response = await dashboardAPI.get("/founder/funding-analytics");
  return response.data;
};
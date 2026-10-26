import { API_ORIGIN } from "./config.js";
import axios from "axios";

const savedStartupAPI = axios.create({
  baseURL: `${API_ORIGIN}/api/saved-startups`,
});

savedStartupAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getSavedStartups = async (userId) => {
  if (!userId) return [];
  const response = await savedStartupAPI.get(`/user/${userId}`);
  return response.data || [];
};

export const saveStartup = async (startupId) => {
  const response = await savedStartupAPI.post("/", { startupId });
  return response.data;
};

export const unsaveStartup = async (startupId) => {
  const response = await savedStartupAPI.delete(`/${startupId}`);
  return response.data;
};

export const checkSavedStartup = async (userId, startupId) => {
  if (!userId || !startupId) return false;
  const response = await savedStartupAPI.get(`/check/${userId}/${startupId}`);
  return !!response.data?.saved;
};

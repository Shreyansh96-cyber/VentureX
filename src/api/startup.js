import { API_ORIGIN } from "./config.js";
import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_STARTUP_API_URL ||
    `${API_ORIGIN}/api/startups`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
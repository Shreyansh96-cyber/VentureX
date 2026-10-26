import { API_ORIGIN } from "./config.js";
import axios from "axios";

const API_URL = API_ORIGIN;

const mentorAPI = axios.create({
  baseURL: `${API_URL}/api/mentors`,
});

mentorAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getMentors = async () => {
  const response = await mentorAPI.get("/");
  return response.data;
};

export const getMentorById = async (mentorId) => {
  const response = await mentorAPI.get(`/${mentorId}`);
  return response.data;
};

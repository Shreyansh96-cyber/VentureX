import { API_ORIGIN } from "./config.js";
import axios from "axios";

const API_URL = API_ORIGIN;

const mentorSessionAPI = axios.create({
  baseURL: `${API_URL}/api/mentor-sessions`,
});

mentorSessionAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getMentorSessions = async (mentorId) => {
  const response = await mentorSessionAPI.get(`/mentor/${mentorId}`);
  return response.data;
};

export const getRequesterSessions = async (requesterId) => {
  const response = await mentorSessionAPI.get(`/requester/${requesterId}`);
  return response.data;
};

export const createMentorSession = async (payload) => {
  const response = await mentorSessionAPI.post("/", payload);
  return response.data;
};

export const updateMentorSessionStatus = async (sessionId, status) => {
  const response = await mentorSessionAPI.put(`/${sessionId}/status`, { status });
  return response.data;
};

export const getMentorMeetingToken = async (sessionId) => {
  const response = await mentorSessionAPI.post(`/${sessionId}/meeting-token`);
  return response.data;
};

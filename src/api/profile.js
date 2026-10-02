import axios from "axios";

const apiOrigin = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

const profileAPI = axios.create({
  baseURL: `${apiOrigin}/api/profile`,
});

profileAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getMyProfile = async () => {
  const response = await profileAPI.get("/me");
  return response.data;
};

export const updateMyProfile = async (profile) => {
  const response = await profileAPI.put("/me", profile);
  return response.data;
};

export const uploadMyProfilePhoto = async (file) => {
  const formData = new FormData();
  formData.append("profileImage", file);
  const response = await profileAPI.post("/me/photo", formData);
  return response.data;
};

export const getProfileImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (/^(https?:|data:|blob:)/i.test(imagePath)) return imagePath;
  return `${apiOrigin}${imagePath.startsWith("/") ? imagePath : `/${imagePath}`}`;
};

export const changeMyPassword = async (passwords) => {
  const response = await profileAPI.put("/me/password", passwords);
  return response.data;
};
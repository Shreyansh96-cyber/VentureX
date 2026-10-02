import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const notificationAPI = axios.create({
	baseURL: `${API_URL}/api/notifications`,
});

notificationAPI.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

export const getNotifications = async (userId) => {
	const response = await notificationAPI.get(`/${userId}`);
	return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
	const response = await notificationAPI.put(`/${notificationId}/read`);
	return response.data;
};

export const markAllNotificationsAsRead = async (userId) => {
	const response = await notificationAPI.put(`/${userId}/read-all`);
	return response.data;
};
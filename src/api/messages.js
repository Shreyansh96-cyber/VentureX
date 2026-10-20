import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const messagesAPI = axios.create({
	baseURL: `${API_URL}/api/messages`,
});

messagesAPI.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

export const getConversations = async () => {
	const response = await messagesAPI.get("/");
	return response.data;
};

export const startConversation = async (startupId) => {
	const response = await messagesAPI.post("/", { startupId });
	return response.data.conversation;
};

export const getMessages = async (conversationId, { before, limit = 30 } = {}) => {
	const response = await messagesAPI.get(`/${conversationId}/messages`, {
		params: { before, limit },
	});
	return response.data;
};

export const sendMessage = async (conversationId, text, clientMessageId) => {
	const response = await messagesAPI.post(`/${conversationId}/messages`, {
		text,
		clientMessageId,
	});
	return response.data.message;
};

export const markConversationRead = async (conversationId) => {
	const response = await messagesAPI.put(`/${conversationId}/read`);
	return response.data;
};
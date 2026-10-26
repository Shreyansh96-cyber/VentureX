import { API_ORIGIN } from "./config.js";
import axios from "axios";

const investorAPI = axios.create({
  baseURL: `${API_ORIGIN}/api/investors`,
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

export const getInvestorById = async (investorId) => {
  const investors = await getInvestors();
  const investor = investors.find((item) => String(item._id) === String(investorId));
  if (!investor) {
    const error = new Error("Investor not found.");
    error.response = { status: 404, data: { message: error.message } };
    throw error;
  }
  return investor;
};

import axios from "axios";
import { API_ORIGIN } from "./config.js";

const API = axios.create({
  baseURL: API_ORIGIN + "/api/contact",
  withCredentials: true,
});

export const submitContactForm = (payload) => API.post("/send", payload);

export default API;

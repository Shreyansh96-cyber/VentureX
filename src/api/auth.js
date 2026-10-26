import axios from "axios";
import { API_ORIGIN } from "./config.js";

const API = axios.create({
  baseURL: API_ORIGIN + "/api/auth",
  withCredentials: true,
});

export default API;

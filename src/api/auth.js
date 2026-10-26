
import axios from "axios";

const isDevTunnel = window.location.hostname.endsWith(
  ".devtunnels.ms"
);

const API_BASE_URL = isDevTunnel
  ? `${window.location.protocol}//${window.location.hostname.replace("-5173.", "-5000.")}/api/auth`
  : "http://localhost:5000/api/auth";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export default API;

const isDevTunnel = window.location.hostname.endsWith(".devtunnels.ms");
const devTunnelApiOrigin = isDevTunnel
  ? window.location.protocol + "//" + window.location.hostname.replace("-5173.", "-5000.")
  : "";

const configuredApiOrigin = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

export const API_ORIGIN =
  configuredApiOrigin ||
  devTunnelApiOrigin ||
  (import.meta.env.DEV ? "http://localhost:5000" : "");

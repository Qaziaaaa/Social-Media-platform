/// <reference types="vite/client" />
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true,
});

const STORAGE_KEY = "social_access_token";
let accessToken: string | null = null;

function loadToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    try { localStorage.setItem(STORAGE_KEY, token); } catch { /* noop */ }
  } else {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  }
}

export function getAccessToken() {
  return accessToken;
}

const isAuthPage = () =>
  window.location.pathname === "/login" || window.location.pathname === "/register";

function redirectToLogin() {
  if (isAuthPage()) return;
  setAccessToken(null);
  window.location.href = "/login";
}

async function attemptRefresh() {
  const { data } = await axios.post(
    "/auth/refresh",
    {},
    { withCredentials: true, baseURL: api.defaults.baseURL },
  );
  return data;
}

api.interceptors.request.use((config) => {
  const token = accessToken || loadToken();
  if (token) {
    accessToken = token;
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status !== 401 || !error.config || error.config._retry) {
      return Promise.reject(error);
    }

    error.config._retry = true;

    try {
      const data = await attemptRefresh();
      if (data.success) {
        setAccessToken(data.data.accessToken);
        error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(error.config);
      }
    } catch {
      // refresh failed
    }

    redirectToLogin();
    return Promise.reject(error);
  },
);

// Initialize token from storage on load
accessToken = loadToken();

export default api;

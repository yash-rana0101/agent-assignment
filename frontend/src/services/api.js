import axios from "axios";

/**
 * Base Axios instance pointing at the backend API.
 * In development: Vite proxies /api → localhost:5000 (see vite.config.js).
 * In production:  VITE_API_URL must point to the deployed backend, e.g.
 *                 https://your-backend.vercel.app/api
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Response interceptor - handle 401 globally (token expired / invalid)
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear local storage on auth failure
      localStorage.removeItem("user");
      // Only redirect if not already on login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

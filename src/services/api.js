
import axios from "axios";

const api = axios.create({
  baseURL: "/api/",
  timeout: 10000,
});

let refreshPromise = null;

// Refresh token once, even if multiple requests need it
async function refreshAccessToken() {
  if (!refreshPromise) {
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      throw new Error("Refresh token not found.");
    }

    refreshPromise = axios
      .post("/api/auth/refresh/", { refresh: refreshToken })
      .then((response) => {
        const newAccessToken = response.data.access;

        if (!newAccessToken) {
          throw new Error("New access token missing.");
        }

        localStorage.setItem("access_token", newAccessToken);

        if (response.data.refresh) {
          localStorage.setItem("refresh_token", response.data.refresh);
        }

        return newAccessToken;
      })
      .catch((error) => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.dispatchEvent(new Event("auth-changed"));
        window.location.href = "/login";
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

// Check token expiry before sending a request
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("access_token");

  if (!token) return config;

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );

    const expiresAt = payload.exp * 1000;

    // Refresh 30 seconds before expiry
    if (expiresAt <= Date.now() + 30000) {
      const newToken = await refreshAccessToken();
      config.headers.Authorization = `Bearer ${newToken}`;
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    if (error.response || error.message === "Refresh token not found.") {
      throw error;
    }

    // Invalid token format: let the response interceptor handle it
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Fallback: refresh if server still returns 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("auth/login/") ||
      originalRequest.url?.includes("auth/refresh/") ||
      originalRequest.url?.includes("accounts/google-login/")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newToken = await refreshAccessToken();

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export default api;

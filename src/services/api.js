
import axios from "axios";

const api = axios.create({
  baseURL: "/api/",
  timeout: 10000,
});

// Attach access token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Automatically refresh expired access tokens
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("auth/login/") &&
      !originalRequest.url?.includes("auth/refresh/")
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        window.dispatchEvent(new Event("auth-changed"));

        window.location.href = "/login";

        return Promise.reject(error);
      }

      try {
        // Request a new access token
        const response = await axios.post(
          "/api/auth/refresh/",
          {
            refresh: refreshToken,
          }
        );

        const newAccessToken = response.data.access;

        localStorage.setItem("access_token", newAccessToken);

        // Save rotated refresh token if provided
        if (response.data.refresh) {
          localStorage.setItem(
            "refresh_token",
            response.data.refresh
          );
        }

        // Retry the original request with the new token
        originalRequest.headers = originalRequest.headers || {};

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(originalRequest);

      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        window.dispatchEvent(new Event("auth-changed"));

        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

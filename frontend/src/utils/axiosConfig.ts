import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:12345/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// === REQUEST INTERCEPTOR ===
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// === RESPONSE INTERCEPTOR ===
const RETRY_FLAG = "_axiosRetry";

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest[RETRY_FLAG] &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest[RETRY_FLAG] = true;

      try {
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken, expiresIn } = response.data;

        localStorage.setItem("accessToken", accessToken);
        if (expiresIn) {
          localStorage.setItem(
            "tokenExpiresAt",
            (Date.now() + expiresIn * 1000).toString()
          );
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("tokenExpiresAt");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

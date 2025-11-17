// src/config/axiosConfig.ts
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:12345/api";

// 1. Axios cho AUTH (có token)
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// 2. Axios cho PUBLIC (không gửi token)
export const publicApi = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// === DANH SÁCH PUBLIC ENDPOINTS (GET) ===
const PUBLIC_GET_PATHS = [
  "/categories",
  "/brands",
  "/products",
  "/articles",
  "/reviews",
  "/media",
  "/inventories",
  "/auth/verify-email",
  "/auth/resend-verification",
  "/auth/forgot-password",
  "/auth/verify-token",
  "/auth/reset-password",
];

// === REQUEST INTERCEPTOR: CHỈ THÊM TOKEN CHO NON-PUBLIC ===
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    const isPublicGet = PUBLIC_GET_PATHS.some(
      (path) => config.url?.startsWith(path) && config.method === "get"
    );

    if (token && !isPublicGet) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// === RESPONSE INTERCEPTOR ===
const RETRY_FLAG = "_axiosRetry";

api.interceptors.response.use(
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
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("tokenExpiresAt");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    if (axios.isAxiosError(error)) {
      const { response } = error;
      const errorData = response?.data;

      switch (response?.status) {
        case 400:
          if (errorData?.details) {
            Object.values(errorData.details).forEach((msg) =>
              toast.error(String(msg))
            );
          } else {
            toast.error(errorData?.message || "Dữ liệu không hợp lệ!");
          }
          break;
        case 401:
          toast.error(errorData?.message || "Email hoặc mật khẩu không đúng!");
          break;
        case 403:
          toast.error(
            errorData?.message ||
              "Tài khoản bị khóa hoặc không có quyền truy cập!"
          );
          break;
        case 404:
          toast.error(errorData?.message || "Không tìm thấy tài nguyên!");
          break;
        case 409:
          toast.error(errorData?.message || "Email đã được sử dụng!");
          break;
        case 500:
          toast.error(
            errorData?.message || "Lỗi máy chủ. Vui lòng thử lại sau!"
          );
          break;
        default:
          toast.error(errorData?.message || "Đã xảy ra lỗi không xác định!");
      }
    } else {
      console.error("Unknown error:", error);
      toast.error("Không thể kết nối đến server. Vui lòng thử lại!");
    }

    return Promise.reject(error);
  }
);

// Export mặc định giữ nguyên để tương thích (nếu cần)
export default api;

import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:12345/api";

// 1. Axios cho AUTH (có token)
export const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// 2. Axios cho PUBLIC (không gửi token)
export const publicApi = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// === DANH SÁCH PUBLIC ENDPOINTS (CHỈ GET) ===
// Các endpoint này cho phép GET không cần token
// Nhưng POST/PUT/DELETE/PATCH vẫn cần token (admin only)
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

// === REQUEST INTERCEPTOR: THÊM TOKEN CHO MỌI REQUEST (trừ public GET endpoints) ===
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    const method = config.method?.toLowerCase();
    const url = config.url || "";

    // Chỉ cho phép GET không cần token cho các public paths
    // POST/PUT/DELETE/PATCH luôn cần token (admin operations)
    const isPublicGet =
      method === "get" && PUBLIC_GET_PATHS.some((path) => url.startsWith(path));

    // LUÔN gửi token nếu có (trừ khi là public GET endpoint)
    if (token) {
      // Nếu không phải public GET, bắt buộc phải có token
      // Nếu là public GET, vẫn gửi token nếu có (để backend biết user đã login)
      config.headers.Authorization = `Bearer ${token}`;
    } else if (!isPublicGet) {
      // Nếu không có token và không phải public GET, đây là lỗi
      console.warn(`No token available for ${method?.toUpperCase()} ${url}`);
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

    // Handle 401 errors (Unauthorized)
    if (
      error.response?.status === 401 &&
      !originalRequest[RETRY_FLAG] &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      originalRequest[RETRY_FLAG] = true;

      try {
        const refreshResponse = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken, expiresIn } = refreshResponse.data;

        if (!accessToken) {
          throw new Error("No access token received");
        }

        localStorage.setItem("accessToken", accessToken);
        if (expiresIn) {
          localStorage.setItem(
            "tokenExpiresAt",
            (Date.now() + expiresIn * 1000).toString()
          );
        }

        // Ensure headers object exists and update Authorization
        if (!originalRequest.headers) {
          originalRequest.headers = {};
        }

        // Remove the old Authorization header if it exists
        delete originalRequest.headers.Authorization;

        // Add the new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Also update axios default headers for this instance
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        // Create a fresh request with the new token to avoid interceptor loop
        const retryConfig = {
          ...originalRequest,
          headers: {
            ...originalRequest.headers,
            Authorization: `Bearer ${accessToken}`,
          },
        };

        // Use axios directly to avoid going through interceptors again
        return axios(retryConfig);
      } catch (refreshError: any) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("tokenExpiresAt");

        // Don't redirect if already on login page
        if (!window.location.pathname.includes("/login")) {
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
          setTimeout(() => {
            window.location.href = "/login";
          }, 1000);
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors with toast messages
    if (axios.isAxiosError(error)) {
      const { response } = error;
      const errorData = response?.data;

      // Don't show toast for 401 on login/auth endpoints (handled by component)
      if (
        response?.status === 401 &&
        (originalRequest.url?.includes("/auth/login") ||
          originalRequest.url?.includes("/auth/refresh"))
      ) {
        return Promise.reject(error);
      }

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
          // Already handled above
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
      toast.error("Không thể kết nối đến server. Vui lòng thử lại!");
    }

    return Promise.reject(error);
  }
);

// Export mặc định
export default api;

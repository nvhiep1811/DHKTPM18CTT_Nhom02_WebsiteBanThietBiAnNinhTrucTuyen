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

// === REQUEST INTERCEPTOR: THÊM TOKEN CHO MỌI REQUEST (trừ public endpoints) ===
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    
    // Check if this is a public GET endpoint
    const isPublicGet = PUBLIC_GET_PATHS.some(
      (path) => config.url?.startsWith(path) && config.method?.toLowerCase() === "get"
    );

    // Always add token for authenticated API unless it's a public GET
    if (token && !isPublicGet) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token attached to request:", {
        url: config.url,
        method: config.method,
        tokenPreview: token.substring(0, 20) + "..."
      });
    } else {
      console.log("⚠️ No token attached:", {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        isPublicGet
      });
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// === RESPONSE INTERCEPTOR ===
const RETRY_FLAG = "_axiosRetry";

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Debug logging
    console.error("API Error:", {
      status: error.response?.status,
      url: originalRequest?.url,
      method: originalRequest?.method,
      hasRetryFlag: originalRequest?.[RETRY_FLAG],
      errorData: error.response?.data
    });

    // Handle 401 errors (Unauthorized)
    if (
      error.response?.status === 401 &&
      !originalRequest[RETRY_FLAG] &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      originalRequest[RETRY_FLAG] = true;

      try {
        console.log("🔄 Attempting to refresh token...");
        const refreshResponse = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        console.log("Refresh response:", refreshResponse.data);

        const { accessToken, expiresIn } = refreshResponse.data;
        
        if (!accessToken) {
          console.error("❌ No accessToken in refresh response!");
          throw new Error("No access token received");
        }

        localStorage.setItem("accessToken", accessToken);
        if (expiresIn) {
          localStorage.setItem(
            "tokenExpiresAt",
            (Date.now() + expiresIn * 1000).toString()
          );
        }

        console.log("✅ Token refreshed successfully");
        console.log("New token preview:", accessToken.substring(0, 30) + "...");
        
        // CRITICAL FIX: Ensure headers object exists and update Authorization
        if (!originalRequest.headers) {
          originalRequest.headers = {};
        }
        
        // Remove the old Authorization header if it exists
        delete originalRequest.headers.Authorization;
        
        // Add the new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Also update axios default headers for this instance
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        console.log("🔄 Retrying original request with new token...");
        console.log("Request URL:", originalRequest.url);
        console.log("Request method:", originalRequest.method);
        console.log("New Authorization header:", originalRequest.headers.Authorization?.substring(0, 50) + "...");
        
        // Create a fresh request with the new token to avoid interceptor loop
        const retryConfig = {
          ...originalRequest,
          headers: {
            ...originalRequest.headers,
            Authorization: `Bearer ${accessToken}`
          }
        };
        
        // Use axios directly to avoid going through interceptors again
        const retryResponse = await axios(retryConfig);
        console.log("✅ Retry successful!");
        return retryResponse;
      } catch (refreshError: any) {
        console.error("❌ Token refresh failed:", refreshError);
        console.error("Refresh error response:", refreshError.response?.data);
        console.error("Refresh error status:", refreshError.response?.status);
        
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
      if (response?.status === 401 && 
          (originalRequest.url?.includes("/auth/login") || 
           originalRequest.url?.includes("/auth/refresh"))) {
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
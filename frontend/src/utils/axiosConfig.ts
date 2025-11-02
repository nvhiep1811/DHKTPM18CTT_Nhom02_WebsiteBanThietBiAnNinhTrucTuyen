import axios from "axios";
import { toast } from "react-toastify";

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

export default axiosInstance;

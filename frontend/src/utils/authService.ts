import axios from "axios";
import axiosInstance from "./axiosConfig";

interface AuthResponse {
  accessToken: string;
  expiresIn: number;
}

export const authService = {
  // Login
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("tokenExpiresAt");
      window.location.href = "/login";
    }
  },

  // Refresh token
  async refreshToken(): Promise<string | null> {
    try {
      const response = await axios.post<AuthResponse>(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:12345/api"
        }/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const { accessToken, expiresIn } = response.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem(
        "tokenExpiresAt",
        (Date.now() + expiresIn * 1000).toString()
      );

      return accessToken;
    } catch (error) {
      await this.logout();
      return null;
    }
  },

  // Lấy access token
  getAccessToken(): string | null {
    return localStorage.getItem("accessToken");
  },

  // Kiểm tra token có hết hạn chưa
  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem("tokenExpiresAt");
    if (!expiresAt) return true;
    return Date.now() >= parseInt(expiresAt);
  },

  // Kiểm tra user đã đăng nhập chưa
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return token !== null && !this.isTokenExpired();
  },

  changePassword(currentPassword: string, newPassword: string) {
    return axiosInstance.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
  },
};

import axios from "axios";
import { api, publicApi } from "./axiosConfig";

interface AuthResponse {
  accessToken: string;
  expiresIn: number;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:12345/api";

export const authService = {
  // Login
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("tokenExpiresAt");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  },

  // Refresh token
  async refreshToken(): Promise<string | null> {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_URL}/auth/refresh`,
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
    } catch {
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

  async changePassword(currentPassword: string, newPassword: string) {
    return await api.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
  },

  async verifyToken(token: string) {
    return await publicApi.get("/auth/verify-token", {
      // Sửa: dùng publicApi vì public
      params: { token },
    });
  },

  async forgotPassword(email: string) {
    return await publicApi.post("/auth/forgot-password", null, {
      // Sửa: dùng publicApi
      params: { email },
    });
  },

  async resetPassword(token: string, newPassword: string) {
    return await publicApi.post("/auth/reset-password", null, {
      // Sửa: dùng publicApi
      params: {
        token,
        newPassword,
      },
    });
  },
};

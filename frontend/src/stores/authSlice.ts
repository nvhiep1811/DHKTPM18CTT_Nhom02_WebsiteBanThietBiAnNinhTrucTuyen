import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { decodeToken } from "../utils/jwt";
import type { User } from "../types/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // === Khi login thành công ===
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;

      // Lưu vào localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
    },

    // === Khi logout ===
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;

      localStorage.removeItem("accessToken");
      localStorage.removeItem("tokenExpiresAt");
      localStorage.removeItem("user");
    },

    // === Phục hồi trạng thái đăng nhập từ localStorage ===
    restoreAuth: (state) => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const payload = decodeToken(token);
      if (!payload) return;

      // Kiểm tra hết hạn token (nếu có exp)
      const isExpired = payload.exp && Date.now() >= payload.exp * 1000;
      if (isExpired) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        state.isAuthenticated = false;
        return;
      }

      // Tạo user từ token hoặc từ localStorage
      let user: User | null = null;
      try {
        user = (localStorage.getItem("user") &&
          JSON.parse(localStorage.getItem("user")!)) || {
          id: payload.sub,
          name: payload.name,
          email: payload.email,
          role: payload.role,
          avatarUrl: payload.avatarUrl,
        };
      } catch {
        // fallback nếu JSON.parse lỗi
        user = {
          id: payload.sub,
          name: payload.name,
          email: payload.email,
          role: payload.role,
          avatarUrl: payload.avatarUrl,
        };
      }

      state.user = user;
      state.accessToken = token;
      state.isAuthenticated = true;
    },
  },
});

export const { loginSuccess, logout, restoreAuth } = authSlice.actions;
export default authSlice.reducer;

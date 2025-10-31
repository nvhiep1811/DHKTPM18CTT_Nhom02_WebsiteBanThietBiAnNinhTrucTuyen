import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { decodeToken } from "../utils/jwt";
import type { User } from "../types/types";
import axiosInstance from "../utils/axiosConfig";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const loadInitialAuthState = (): AuthState => {
  const token = localStorage.getItem("accessToken");
  const storedUser = localStorage.getItem("user");

  if (token && storedUser) {
    try {
      const user = JSON.parse(storedUser);
      const payload = decodeToken(token);
      const isExpired = !payload?.exp || Date.now() >= payload.exp * 1000;

      if (!isExpired) {
        // Hydrate sẵn user => UI sẽ hiển thị ngay
        return {
          user,
          accessToken: token,
          isAuthenticated: true,
          isLoading: false, // không cần loading ở initial render
        };
      }
    } catch (err) {
      console.warn("Invalid local user data", err);
    }
  }

  // Nếu không có dữ liệu hợp lệ
  return {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
  };
};

const initialState: AuthState = loadInitialAuthState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      localStorage.removeItem("accessToken");
      localStorage.removeItem("tokenExpiresAt");
      localStorage.removeItem("user");
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Restore auth từ localStorage
    restoreAuthStart: (state) => {
      state.isLoading = true;
    },

    restoreAuthSuccess: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;
    },

    restoreAuthFailure: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
  },
});

export const {
  loginSuccess,
  logout,
  setLoading,
  restoreAuthStart,
  restoreAuthSuccess,
  restoreAuthFailure,
} = authSlice.actions;

export const restoreAuth = () => async (dispatch: any) => {
  const token = localStorage.getItem("accessToken");
  if (!token) return dispatch(restoreAuthFailure());

  const payload = decodeToken(token);
  if (!payload?.exp || Date.now() >= payload.exp * 1000) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    return dispatch(restoreAuthFailure());
  }

  try {
    const response = await axiosInstance.get("/auth/me");
    const userProfile = response.data;
    const user: User = {
      id: userProfile.id,
      email: userProfile.email,
      name: userProfile.name,
      phone: userProfile.phone,
      role: userProfile.role,
      avatarUrl: userProfile.avatarUrl,
    };
    localStorage.setItem("user", JSON.stringify(user));
    dispatch(restoreAuthSuccess({ user, accessToken: token }));
  } catch (error) {
    console.warn("Failed to sync user:", error);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      dispatch(restoreAuthSuccess({ user, accessToken: token }));
    } else {
      dispatch(restoreAuthFailure());
    }
  }
};

export default authSlice.reducer;

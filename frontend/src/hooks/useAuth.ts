import axios from "axios";
import { cartService } from "../utils/cartService";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const useAuth = () => {
  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        credentials,
        {
          withCredentials: true,
        }
      );

      // Save token
      localStorage.setItem("authToken", response.data.token);

      // Merge guest cart to user session
      await cartService.mergeGuestCart();

      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/auth/logout`,
        {},
        {
          withCredentials: true,
        }
      );

      localStorage.removeItem("authToken");

      // Don't clear guest cart on logout (optional behavior)
      // User can continue shopping as guest
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return { login, logout };
};

import type { BrandQueryParams, ProductQueryParams } from "../types/query";
import type {
  Brand,
  CategorySummary,
  ProductDetail,
  ProductSummary,
} from "../types/types";
import axiosInstance from "./axiosConfig";

// Category API
export const categoryApi = {
  getAll: async () => {
    const response = await axiosInstance.get<CategorySummary[]>(
      "/categories/active"
    );
    return response.data;
  },
  getById: async (id: string) => {
    const response = await axiosInstance.get(`/categories/${id}`);
    return response.data;
  },
};

// Brand API
export const brandApi = {
  getAll: async (params?: BrandQueryParams) => {
    const response = await axiosInstance.get<{
      content: Brand[];
      page: { totalPages: number; totalElements: number };
    }>("/brands", { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await axiosInstance.get(`/brands/${id}`);
    return response.data;
  },
};

// Products API
export const productApi = {
  getAll: async (params?: ProductQueryParams) => {
    const response = await axiosInstance.get<{
      content: ProductSummary[];
      page: { totalPages: number; totalElements: number };
    }>("/products", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<ProductDetail>(`/products/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await axiosInstance.post("/products", data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
  },
};

// Cart API
export const cartApi = {
  getCart: async () => {
    const response = await axiosInstance.get("/cart");
    return response.data;
  },

  addItem: async (productId: string, quantity: number) => {
    const response = await axiosInstance.post("/cart/items", {
      productId,
      quantity,
    });
    return response.data;
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    const response = await axiosInstance.put(`/cart/items/${itemId}`, {
      quantity,
    });
    return response.data;
  },

  removeItem: async (itemId: string) => {
    const response = await axiosInstance.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await axiosInstance.delete("/cart");
    return response.data;
  },
};

// Orders API
export const orderApi = {
  getOrders: async () => {
    const response = await axiosInstance.get("/orders");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get(`/orders/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await axiosInstance.post("/orders", data);
    return response.data;
  },
  /**
   * ✅ Kiểm tra trạng thái xác nhận đơn hàng
   */
  checkConfirmationStatus: async (orderId: string) => {
    const response = await axiosInstance.get(`/orders/${orderId}/confirmation-status`);
    return response.data; // { orderId, isConfirmed, status }
  },

  /**
   * ✅ Xác nhận đơn hàng qua token
   */
  confirmOrder: async (token: string) => {
    const response = await axiosInstance.get(`/orders/confirm?token=${token}`);
    return response.data; // { success, message }
  }
};

// User API
export const userApi = {
  getProfile: async () => {
    const response = await axiosInstance.get("/users/me");
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await axiosInstance.put(`/users/me`, data);
    return response.data;
  },
};

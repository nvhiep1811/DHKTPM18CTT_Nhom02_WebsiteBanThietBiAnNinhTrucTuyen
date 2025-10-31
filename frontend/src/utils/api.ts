import axiosInstance from "./axiosConfig";

// Products API
export const productApi = {
  getAll: async () => {
    const response = await axiosInstance.get("/products");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get(`/products/${id}`);
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
};

// User API
export const userApi = {
  getProfile: async () => {
    const response = await axiosInstance.get("/users/profile");
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await axiosInstance.put("/users/profile", data);
    return response.data;
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await axiosInstance.put("/users/change-password", {
      oldPassword,
      newPassword,
    });
    return response.data;
  },
};

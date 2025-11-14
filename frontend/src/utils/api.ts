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
  getAllForAdmin: async () => {
    const response = await axiosInstance.get("/categories");
    return response.data;
  },
  getById: async (id: string) => {
    const response = await axiosInstance.get(`/categories/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await axiosInstance.post("/categories", data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/categories/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/categories/${id}`);
    return response.data;
  }
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
  create: async (data: any) => {
    const response = await axiosInstance.post("/brands", data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/brands/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/brands/${id}`);
    return response.data;
  }
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

  getSummaryById: async (id: string) => {
    const response = await axiosInstance.get(`/products/summary/${id}`);
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

  // DELETE /api/products/{id} - Xóa sản phẩm (Admin only)
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
    const response = await axiosInstance.get("/orders/my-orders");
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

  // Admin endpoints
  getAll: async () => {
    const response = await axiosInstance.get("/orders");
    return response.data;
  },
  updateOrder: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/orders/${id}`, data);
    return response.data;
  },

  deleteOrder: async (id: string) => {
    const response = await axiosInstance.delete(`/orders/${id}`);
    return response.data;
  },

  confirmOrder: async (id: string) => {
    const response = await axiosInstance.patch(`/orders/confirm/${id}`);
    return response.data;
  },

  cancelOrder: async (id: string) => {
    const response = await axiosInstance.patch(`/orders/cancel/${id}`);
    return response.data;
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
  deleteMyAccount: async () => {
    const response = await axiosInstance.delete("/users/me");
    return response.data;
  },
  //admin
  getAllUsers: async () => {
    const response = await axiosInstance.get("/users");
    return response.data;
  },
  getUserById: async (id: string) => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },
  restoreUser: async (id: string) => {
    const response = await axiosInstance.put(`/users/${id}/restore`);
    return response.data;
  },
  getUserStats: async () => {
    const response = await axiosInstance.get("/users/stats");
    return response.data;
  },
  enableUser: async (id: string) => {
    const response = await axiosInstance.put(`/users/admin/${id}/enable`);
    return response.data;
  },
  disableUser: async (id: string) => {
    const response = await axiosInstance.put(`/users/admin/${id}/disable`);
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  }
};

export const ArticleApi = {
  getAll: async (params?: { page?: number; size?: number; active?: boolean }) => {
    const response = await axiosInstance.get("/articles", { params });
    return response.data;
  },
  create: async (data: any) => {
    const response = await axiosInstance.post("/articles", data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/articles/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/articles/${id}`);
    return response.data;
  },
  getArticle: async (slug: string) => {
    const response = await axiosInstance.get(`/articles/${slug}`);
    return response.data;
  }
};

export const DiscountApi = {
  getAll: async () => {
    const response = await axiosInstance.get("/discounts");
    return response.data;
  },
  create: async (data: any) => {
    const response = await axiosInstance.post("/discounts", data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/discounts/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/discounts/${id}`);
    return response.data;
  },
  getDiscountById: async (id: string) => {
    const response = await axiosInstance.get(`/discounts/${id}`);
    return response.data;
  }
}

export const InventoryApi = {
  getAll: async () => {
    const response = await axiosInstance.get("/inventories");
    return response.data;
  },
  getByProductId: async (productId: string) => {
    const response = await axiosInstance.get(`/inventories/${productId}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await axiosInstance.post("/inventories", data);
    return response.data;
  },
  updateStock: async (productId: string, quantityChange: number) => {
    const response = await axiosInstance.patch(`/inventories/${productId}/update-stock`, null, {
      params: { quantityChange }
    });
    return response.data;
  }
}

export const WarrantyRequestApi = {
  // Admin endpoints
  getAllWarrantyRequests: async (params?: { page?: number; size?: number }) => {
    const response = await axiosInstance.get("/warranty-requests", { params });
    return response.data;
  },
  getWarrantyRequestById: async (id: string) => {
    const response = await axiosInstance.get(`/warranty-requests/${id}`);
    return response.data;
  },
  getWarrantyRequestsByOrderItem: async (orderItemId: string) => {
    const response = await axiosInstance.get(`/warranty-requests/order-item/${orderItemId}`);
    return response.data;
  },
  updateWarrantyRequest: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/warranty-requests/${id}`, data);
    return response.data;
  },
  deleteWarrantyRequest: async (id: string) => {
    const response = await axiosInstance.delete(`/warranty-requests/${id}`);
    return response.data;
  },
  approveWarrantyRequest: async (id: string) => {
    const response = await axiosInstance.patch(`/warranty-requests/approve/${id}`);
    return response.data;
  },
  rejectWarrantyRequest: async (id: string) => {
    const response = await axiosInstance.patch(`/warranty-requests/reject/${id}`);
    return response.data;
  },
  resolveWarrantyRequest: async (id: string) => {
    const response = await axiosInstance.patch(`/warranty-requests/resolve/${id}`);
    return response.data;
  },

  // User endpoints
  getMyWarrantyRequests: async () => {
    const response = await axiosInstance.get("/warranty-requests/user/my");
    return response.data;
  },
  createWarrantyRequest: async (data: any) => {
    const response = await axiosInstance.post("/warranty-requests", data);
    return response.data;
  }
}

export const SupportTicketApi = {
  // User endpoints
  getMyTickets: async (params?: { page?: number; size?: number }) => {
    const response = await axiosInstance.get("/tickets", { params });
    return response.data;
  },
  createTicket: async (data: any) => {
    const response = await axiosInstance.post("/tickets", data);
    return response.data;
  },
  getTicket: async (id: string) => {
    const response = await axiosInstance.get(`/tickets/${id}`);
    return response.data;
  },
  closeTicket: async (id: string) => {
    const response = await axiosInstance.put(`/tickets/${id}/close`);
    return response.data;
  },

  // Admin endpoints
  getAllTickets: async (params?: { page?: number; size?: number }) => {
    const response = await axiosInstance.get("/tickets/admin/all", { params });
    return response.data;
  },
  updateTicketStatus: async (id: string, status: string) => {
    const response = await axiosInstance.put(`/tickets/admin/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  }
}

export const ReviewApi = {
  getAll: async (params?: { page?: number; size?: number }) => {
    const response = await axiosInstance.get("/reviews", { params });
    return response.data;
  },

  getReviewsByProduct: async (productId: string) => {
    const response = await axiosInstance.get(`/reviews/product/${productId}`);
    return response.data;
  },

  getReviewsByUser: async (userId: string) => {
    const response = await axiosInstance.get(`/reviews/user/${userId}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await axiosInstance.get(`/reviews/${id}`);
    return response.data;
  },

  create: async (data: { productId: string; rating: number; comment: string; orderItemId: number }) => {
    const response = await axiosInstance.post('/reviews', data);
    return response.data;
  },

  update: async (id: number, data: { rating?: number; comment?: string }) => {
    const response = await axiosInstance.put(`/reviews/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/reviews/${id}`);
    return response.data;
  },

  approve: async (id: number) => {
    const response = await axiosInstance.patch(`/reviews/approve/${id}`);
    return response.data;
  },

  reject: async (id: number) => {
    const response = await axiosInstance.patch(`/reviews/reject/${id}`);
    return response.data;
  }
}
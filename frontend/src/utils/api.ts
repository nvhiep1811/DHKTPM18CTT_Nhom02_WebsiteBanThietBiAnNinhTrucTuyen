import type { BrandQueryParams, ProductQueryParams } from "../types/query";
import type {
  Brand,
  CategorySummary,
  ProductDetail,
  ProductSummary,
} from "../types/types";
import { api, publicApi } from "./axiosConfig";

// Category API
export const categoryApi = {
  // PUBLIC: Lấy danh sách categories đang active
  getAll: async () => {
    const response = await publicApi.get<CategorySummary[]>(
      "/categories/active"
    );
    return response.data;
  },
  // AUTH: Admin lấy tất cả categories
  getAllForAdmin: async () => {
    const response = await api.get("/categories");
    return response.data;
  },
  // PUBLIC: Lấy category theo ID
  getById: async (id: string) => {
    const response = await publicApi.get(`/categories/${id}`);
    return response.data;
  },
  // AUTH: Tạo category mới (Admin)
  create: async (data: any) => {
    const response = await api.post("/categories", data);
    return response.data;
  },
  // AUTH: Cập nhật category (Admin)
  update: async (id: string, data: any) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },
  // AUTH: Xóa category (Admin)
  delete: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

// Brand API
export const brandApi = {
  // PUBLIC: Lấy danh sách brands
  getAll: async (params?: BrandQueryParams) => {
    const response = await publicApi.get<{
      content: Brand[];
      page: { totalPages: number; totalElements: number };
    }>("/brands", { params });
    return response.data;
  },
  // PUBLIC: Lấy brand theo ID
  getById: async (id: string) => {
    const response = await publicApi.get(`/brands/${id}`);
    return response.data;
  },
  // AUTH: Tạo brand mới (Admin)
  create: async (data: any) => {
    const response = await api.post("/brands", data);
    return response.data;
  },
  // AUTH: Cập nhật brand (Admin)
  update: async (id: string, data: any) => {
    const response = await api.put(`/brands/${id}`, data);
    return response.data;
  },
  // AUTH: Xóa brand (Admin)
  delete: async (id: string) => {
    const response = await api.delete(`/brands/${id}`);
    return response.data;
  },
};

// Products API
export const productApi = {
  // PUBLIC: Lấy danh sách products
  getAll: async (params?: ProductQueryParams) => {
    const response = await publicApi.get<{
      content: ProductSummary[];
      page: { totalPages: number; totalElements: number };
    }>("/products", { params });
    return response.data;
  },
  // PUBLIC: Lấy chi tiết product theo ID
  getById: async (id: string) => {
    const response = await publicApi.get<ProductDetail>(`/products/${id}`);
    return response.data;
  },
  // PUBLIC: Lấy summary của product
  getSummaryById: async (id: string) => {
    const response = await publicApi.get(`/products/summary/${id}`);
    return response.data;
  },
  // AUTH: Tạo product mới (Admin)
  create: async (data: any) => {
    const response = await api.post("/products", data);
    return response.data;
  },
  // AUTH: Cập nhật product (Admin)
  update: async (id: string, data: any) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },
  // AUTH: Xóa product (Admin)
  delete: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

// Orders API - TẤT CẢ REQUIRE AUTH
export const orderApi = {
  // User: Lấy đơn hàng của mình
  getOrders: async () => {
    const response = await api.get("/orders/my-orders");
    return response.data;
  },
  // User/Admin: Lấy chi tiết đơn hàng
  getById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  // User: Tạo đơn hàng mới
  create: async (data: any) => {
    const response = await api.post("/orders", data);
    return response.data;
  },
  // Admin: Lấy tất cả đơn hàng
  getAll: async () => {
    const response = await api.get("/orders");
    return response.data;
  },
  // Admin: Cập nhật đơn hàng
  updateOrder: async (id: string, data: any) => {
    const response = await api.put(`/orders/${id}`, data);
    return response.data;
  },
  // Admin: Xóa đơn hàng
  deleteOrder: async (id: string) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
  // Admin: Xác nhận đơn hàng
  confirmOrder: async (id: string) => {
    const response = await api.patch(`/orders/confirm/${id}`);
    return response.data;
  },
  // User/Admin: Hủy đơn hàng
  cancelOrder: async (id: string) => {
    const response = await api.patch(`/orders/cancel/${id}`);
    return response.data;
  },
};

// User API - TẤT CẢ REQUIRE AUTH
export const userApi = {
  // User: Lấy profile của mình
  getProfile: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },
  // User: Cập nhật profile
  updateProfile: async (data: any) => {
    const response = await api.put(`/users/me`, data);
    return response.data;
  },
  // User: Xóa tài khoản của mình
  deleteMyAccount: async () => {
    const response = await api.delete("/users/me");
    return response.data;
  },
  // Admin: Lấy tất cả users
  getAllUsers: async () => {
    const response = await api.get("/users");
    return response.data;
  },
  // Admin: Lấy user theo ID
  getUserById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  // Admin: Khôi phục user
  restoreUser: async (id: string) => {
    const response = await api.put(`/users/${id}/restore`);
    return response.data;
  },
  // Admin: Lấy thống kê users
  getUserStats: async () => {
    const response = await api.get("/users/stats");
    return response.data;
  },
  // Admin: Kích hoạt user
  enableUser: async (id: string) => {
    const response = await api.put(`/users/admin/${id}/enable`);
    return response.data;
  },
  // Admin: Vô hiệu hóa user
  disableUser: async (id: string) => {
    const response = await api.put(`/users/admin/${id}/disable`);
    return response.data;
  },
  // Admin: Xóa user
  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// VNPay API
export { vnpayApi } from "./vnpayService";

// Article API
export const ArticleApi = {
  // PUBLIC: Lấy danh sách articles
  getAll: async (params?: {
    page?: number;
    size?: number;
    active?: boolean;
  }) => {
    const response = await publicApi.get("/articles", { params });
    return response.data;
  },
  // PUBLIC: Lấy article theo slug
  getArticle: async (slug: string) => {
    const response = await publicApi.get(`/articles/${slug}`);
    return response.data;
  },
  // AUTH: Tạo article mới (Admin)
  create: async (data: any) => {
    const response = await api.post("/articles", data);
    return response.data;
  },
  // AUTH: Cập nhật article (Admin)
  update: async (id: string, data: any) => {
    const response = await api.put(`/articles/${id}`, data);
    return response.data;
  },
  // AUTH: Xóa article (Admin)
  delete: async (id: string) => {
    const response = await api.delete(`/articles/${id}`);
    return response.data;
  },
};

// Discount API - TẤT CẢ REQUIRE AUTH (Admin)
export const DiscountApi = {
  getAll: async () => {
    const response = await api.get("/discounts");
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post("/discounts", data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/discounts/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/discounts/${id}`);
    return response.data;
  },
  getDiscountById: async (id: string) => {
    const response = await api.get(`/discounts/${id}`);
    return response.data;
  },
};

// Inventory API
export const InventoryApi = {
  // PUBLIC: Lấy tất cả inventories
  getAll: async () => {
    const response = await publicApi.get("/inventories");
    return response.data;
  },
  // PUBLIC: Lấy inventory theo product ID
  getByProductId: async (productId: string) => {
    const response = await publicApi.get(`/inventories/${productId}`);
    return response.data;
  },
  // AUTH: Tạo inventory mới (Admin)
  create: async (data: any) => {
    const response = await api.post("/inventories", data);
    return response.data;
  },
  // AUTH: Cập nhật stock (Admin)
  updateStock: async (productId: string, quantityChange: number) => {
    const response = await api.patch(
      `/inventories/${productId}/update-stock`,
      null,
      {
        params: { quantityChange },
      }
    );
    return response.data;
  },
};

// Warranty Request API
export const WarrantyRequestApi = {
  // AUTH - User: Lấy warranty requests của mình
  getMyWarrantyRequests: async () => {
    const response = await api.get("/warranty-requests/user/my");
    return response.data;
  },
  // AUTH - User: Tạo warranty request mới
  createWarrantyRequest: async (data: any) => {
    const response = await api.post("/warranty-requests", data);
    return response.data;
  },
  // AUTH - Admin: Lấy tất cả warranty requests
  getAllWarrantyRequests: async (params?: { page?: number; size?: number }) => {
    const response = await api.get("/warranty-requests", { params });
    return response.data;
  },
  // AUTH - Admin: Lấy warranty request theo ID
  getWarrantyRequestById: async (id: string) => {
    const response = await api.get(`/warranty-requests/${id}`);
    return response.data;
  },
  // AUTH - Admin: Lấy warranty requests theo order item
  getWarrantyRequestsByOrderItem: async (orderItemId: string) => {
    const response = await api.get(
      `/warranty-requests/order-item/${orderItemId}`
    );
    return response.data;
  },
  // AUTH - Admin: Cập nhật warranty request
  updateWarrantyRequest: async (id: string, data: any) => {
    const response = await api.put(`/warranty-requests/${id}`, data);
    return response.data;
  },
  // AUTH - Admin: Xóa warranty request
  deleteWarrantyRequest: async (id: string) => {
    const response = await api.delete(`/warranty-requests/${id}`);
    return response.data;
  },
  // AUTH - Admin: Phê duyệt warranty request
  approveWarrantyRequest: async (id: string) => {
    const response = await api.patch(`/warranty-requests/approve/${id}`);
    return response.data;
  },
  // AUTH - Admin: Từ chối warranty request
  rejectWarrantyRequest: async (id: string) => {
    const response = await api.patch(`/warranty-requests/reject/${id}`);
    return response.data;
  },
  // AUTH - Admin: Hoàn thành warranty request
  resolveWarrantyRequest: async (id: string) => {
    const response = await api.patch(`/warranty-requests/resolve/${id}`);
    return response.data;
  },
};

// Support Ticket API
export const SupportTicketApi = {
  // AUTH - User: Lấy tickets của mình
  getMyTickets: async (params?: { page?: number; size?: number }) => {
    const response = await api.get("/tickets", { params });
    return response.data;
  },
  // AUTH - User: Tạo ticket mới
  createTicket: async (data: any) => {
    const response = await api.post("/tickets", data);
    return response.data;
  },
  // AUTH - User: Lấy chi tiết ticket
  getTicket: async (id: string) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },
  // AUTH - User: Đóng ticket
  closeTicket: async (id: string) => {
    const response = await api.put(`/tickets/${id}/close`);
    return response.data;
  },
  // AUTH - Admin: Lấy tất cả tickets
  getAllTickets: async (params?: { page?: number; size?: number }) => {
    const response = await api.get("/tickets/admin/all", { params });
    return response.data;
  },
  // AUTH - Admin: Cập nhật trạng thái ticket
  updateTicketStatus: async (id: string, status: string) => {
    const response = await api.put(`/tickets/admin/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },
};

// Review API
export const ReviewApi = {
  // PUBLIC: Lấy tất cả reviews
  getAll: async (params?: { page?: number; size?: number }) => {
    const response = await publicApi.get("/reviews", { params });
    return response.data;
  },
  // PUBLIC: Lấy reviews theo product
  getReviewsByProduct: async (productId: string) => {
    const response = await publicApi.get(`/reviews/product/${productId}`);
    return response.data;
  },
  // PUBLIC: Lấy reviews theo user
  getReviewsByUser: async (userId: string) => {
    const response = await publicApi.get(`/reviews/user/${userId}`);
    return response.data;
  },
  // PUBLIC: Lấy review theo ID
  getById: async (id: number) => {
    const response = await publicApi.get(`/reviews/${id}`);
    return response.data;
  },
  // AUTH - User: Tạo review mới
  create: async (data: {
    productId: string;
    rating: number;
    comment: string;
    orderItemId: number;
  }) => {
    const response = await api.post("/reviews", data);
    return response.data;
  },
  // AUTH - User: Cập nhật review của mình
  update: async (id: number, data: { rating?: number; comment?: string }) => {
    const response = await api.put(`/reviews/${id}`, data);
    return response.data;
  },
  // AUTH - User/Admin: Xóa review
  delete: async (id: number) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },
  // AUTH - Admin: Phê duyệt review
  approve: async (id: number) => {
    const response = await api.patch(`/reviews/approve/${id}`);
    return response.data;
  },
  // AUTH - Admin: Từ chối review
  reject: async (id: number) => {
    const response = await api.patch(`/reviews/reject/${id}`);
    return response.data;
  },
};

// Chat API
export const chatApi = {
  ask: async (message: string) => {
    const response = await publicApi.post("/chat/ask", { message });
    return response.data as {
      answer: string;
      suggestions?: Array<{
        id: string;
        name: string;
        sku?: string;
        rating?: number;
        reviewCount?: number;
        thumbnailUrl?: string;
        price?: string | number;
      }>;
      sources?: string[];
    };
  },
};

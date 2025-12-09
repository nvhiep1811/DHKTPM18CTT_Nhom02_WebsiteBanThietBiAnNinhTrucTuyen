export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatarUrl?: string;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatarUrl?: string;
  enabled: boolean;
}

export interface ProductSummary {
  id: string;
  sku: string;
  name: string;
  listedPrice: number;
  price: number;
  thumbnailUrl: string;
  inStock: boolean;
  availableStock?: number;
  category: CategorySummary;
  brand?: Brand;
  rating: number;
  reviewCount: number;
  sales?: number;
}

export interface CategorySummary {
  id: number;
  name: string;
  imageUrl?: string;
  description: string;
  active: boolean;
}

export interface Brand {
  id: number;
  name: string;
  productCount?: number;
}

export interface ProductDetail {
  id: string;
  sku: string;
  name: string;
  listedPrice: number;
  price: number;
  active: boolean;
  brand: Brand;
  category: CategorySummary;
  shortDesc: string;
  longDesc: string;
  thumbnailUrl: string;
  rating: number;
  reviewCount: number;
  mediaAssets: MediaAsset[];
  availableStock: number;
  inStock: boolean;
  reviews: Review[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  deletedAt: string | null;
  features: string[];
  specifications: Record<string, string>;
}

export interface InventorySummary {
  onHand: number;
  reserved: number;
  inStock: boolean;
  product: ProductSummary;
}

export interface MediaAsset {
  id?: string;
  url?: string;
  altText?: string;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  productId: string;
  userId: string;
  userName: string;
  orderItemId: number;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  publishedAt?: string;
  active: boolean;
  adminName?: string;
}

// Export VNPay types
export * from "./vnpay";
export interface Discount {
  id: string;
  code: string;
  discountType: "PERCENT" | "FIXED_AMOUNT" | "FREE_SHIP";
  discountValue: number;
  minOrderValue: number;
  active: boolean;
  startAt: string; // ISO date string
  endAt: string; // ISO date string
}

export interface DiscountDetail {
  id: string;
  code: string;
  discountType: "PERCENT" | "FIXED_AMOUNT" | "FREE_SHIP";
  discountValue: number;
  minOrderValue: number | null;
  maxUsage: number | null;
  perUserLimit: number | null;
  used: number;
  startAt: string;
  endAt: string;
  active: boolean;
}

export interface WarrantyRequest {
  id: string;
  issueType: string;
  description: string;
  status:
    | "SUBMITTED"
    | "ACCEPTED"
    | "REJECTED"
    | "REPAIRED"
    | "REPLACED"
    | "RETURNED";
  requestedAt: string; // ISO date string
  resolvedAt: string; // ISO date string
  product: ProductSummary;
  orderItemId: string;
  unitPrice: number;
  quantity: number;
}

export interface SupportTicket {
  id: string;
  title: string;
  subject: string;
  content: string;
  createdAt: string; // ISO date string
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  userId: string;
}

export interface Address {
  id: number;
  name: string;
  phone: string;
  street: string;
  ward: string;
  province: string;
  isDefault: boolean;
  userId: string;
}

export interface Order {
  id: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "WAITING_FOR_DELIVERY"
    | "IN_TRANSIT"
    | "DELIVERED"
    | "CANCELLED";
  paymentStatus: "UNPAID" | "PAID" | "FAILED" | "REFUNDED" | "PENDING" | "PROCESSING" | "PARTIAL_REFUND";

  subTotal: number;
  discountTotal: number;
  shippingFee: number;
  grandTotal: number;

  hasPaid: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  confirmedAt?: string; // ISO date string
  cancelledAt?: string; // ISO date string

  shippingAddress: Record<string, string>; // Map<String, String> from Java

  discount?: Discount;
  user: UserSummary;
}

export interface Payment {
  id: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  method: "COD" | "BANK_TRANSFER" | "E_WALLET";
  provider: "MOMO" | "VNPAY" | "NONE";
  status: "UNPAID" | "PAID" | "FAILED" | "REFUNDED" | "PENDING" | "PROCESSING" | "PARTIAL_REFUND";
  amount: number;
  transactionId?: string;
  paidAt?: string; // ISO date string
  gatewayResponse?: Record<string, any>;
  orderId: string;
}

export interface Shipment {
  id: number;
  status: "PENDING" | "IN_TRANSIT" | "DELIVERED" | "RETURNED";
  deliveredAt?: string; // ISO date string
  shippedAt?: string; // ISO date string
  orderId: string;
}

export interface OrderItem {
  id: number;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  product: ProductSummary;
  orderId: string;
}

export interface OrderDetails {
  id: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "WAITING_FOR_DELIVERY"
    | "IN_TRANSIT"
    | "DELIVERED"
    | "CANCELLED";
  paymentStatus: "UNPAID" | "PAID" | "FAILED" | "REFUNDED" | "PENDING" | "PROCESSING" | "PARTIAL_REFUND";

  subTotal: number;
  discountTotal: number;
  shippingFee: number;
  grandTotal: number;

  hasPaid: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  confirmedAt?: string; // ISO date string
  cancelledAt?: string; // ISO date string

  shippingAddress: Record<string, string>;

  discount?: Discount;
  user: UserSummary;

  orderItems: OrderItem[];
  payment?: Payment;
  shipment?: Shipment;
}

export interface OrderItemRequest {
  productId: string;
  quantity: number;
}

export interface OrderCreateRequest {
  items: OrderItemRequest[];
  shippingFee: number;
  discountCode?: string;
  shippingAddress: Record<string, string>;
  userId?: string;
}

export interface AnalyticsData {
  // Thống kê tổng quan
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  avgOrderValue: number;
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  totalUsers: number;
  activeUsers: number;
  conversionRate: number;

  // Top sản phẩm
  topProducts: ProductSummary[];

  // Đơn hàng gần đây
  recentOrders: Order[];

  // Dữ liệu biểu đồ
  revenueChartData: RevenueChartData[];
  orderStatusChartData: OrderStatusChartData[];
  topProductsChartData: TopProductChartData[];
}

export interface RevenueChartData {
  date: string;
  revenue: number;
  orders: number;
}

export interface OrderStatusChartData {
  name: string;
  value: number;
  color: string;
}

export interface TopProductChartData {
  name: string;
  reviews: number;
  rating: number;
}

// Analytics Types
export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'WAITING_FOR_DELIVERY' 
  | 'IN_TRANSIT' 
  | 'DELIVERED' 
  | 'CANCELLED';

export interface RevenueDataPoint {
  date: string; // Format: yyyy-MM-dd
  revenue: number;
  orderCount: number;
}

export interface OrderStatusDistribution {
  status: OrderStatus;
  count: number;
}

export interface TopProduct {
  id: string;
  name: string;
  thumbnailUrl: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface AnalyticsSummary {
  hasData: boolean;
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  avgOrderValue: number;
  totalUsers: number;
  activeUsers: number;
  conversionRate: number;
  orderStatusDistribution: OrderStatusDistribution[];
  revenueTrend: RevenueDataPoint[];
  topProducts: TopProduct[];
}
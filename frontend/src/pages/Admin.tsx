import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  X,
  Save,
  Upload,
  Tag,
  BarChart3,
  FileText,
  Download,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import * as XLSX from 'xlsx';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  productCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Brand {
  id: string;
  name: string;
  productCount?: number;
  createdAt?: string;
}

interface MediaAsset {
  id: string;
  url: string;
  altText?: string;
  productId: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  shortDesc?: string;
  longDesc?: string;
  listedPrice: number;
  active: boolean;
  deletedAt?: string;
  brandId?: string;
  brandName?: string;
  categoryId: string;
  categoryName: string;
  // Media assets - multiple images
  mediaAssets?: MediaAsset[];
  // Computed/Display fields
  stock?: number;
  discount?: number;
  rating?: number;
  soldCount?: number;
  image?: string; // Deprecated: for backward compatibility, use first mediaAsset URL
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  items: OrderItem[];
  shippingAddress: string;
  paymentMethod: string;
  notes?: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Promotion {
  id: string;
  code: string; // Mã khuyến mãi duy nhất
  name: string;
  description: string;
  discountType: 'PERCENT' | 'FIXED_AMOUNT' | 'FREE_SHIP';
  discountValue: number;
  minOrderValue?: number; // Giá trị đơn hàng tối thiểu
  maxUsage?: number; // Số lần sử dụng tối đa
  perUserLimit?: number; // Giới hạn mỗi người dùng
  used: number; // Số lần đã sử dụng
  startAt: string; // Thời gian bắt đầu
  endAt: string; // Thời gian kết thúc
  active: boolean; // Trạng thái kích hoạt
}

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  enabled: boolean;
  avatarUrl?: string;
  provider: 'local' | 'google' | 'facebook';
  role: 'USER' | 'ADMIN';
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Computed fields
  totalOrders?: number;
  totalSpent?: number;
  addresses?: Address[];
}

interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  ward: string;
  province: string;
  isDefault: boolean;
  userId: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  summary?: string; // Tóm tắt (max 1000 ký tự)
  content: string;
  publishedAt: string;
  active: boolean;
  adminId?: string;
  adminName?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Banner {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  position: 'HOME_HERO' | 'HOME_SECONDARY' | 'PRODUCT_PAGE' | 'SIDEBAR';
  displayOrder: number;
  active: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
  createdAt?: string;
  productCount?: number;
}

interface Inventory {
  id: string;
  onHand: number; // Số lượng tồn kho thực tế
  reserved: number; // Số lượng đang được giữ chỗ (đang trong giỏ hàng/đơn hàng chưa thanh toán)
  productId: string;
  productName?: string; // Để hiển thị
  productSku?: string; // Để tìm kiếm
}

interface TicketResponse {
  id: string;
  ticketId: string;
  message: string;
  createdAt: string;
  isAdmin: boolean;
  authorName: string;
}

interface SupportTicket {
  id: string;
  title: string;
  subject: string;
  content: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  userId: string;
  userName: string;
  userEmail: string;
  responses?: TicketResponse[];
  updatedAt?: string;
}

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'promotions' | 'users' | 'articles' | 'banners' | 'tickets' | 'categories' | 'brands' | 'inventory' | 'analytics'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Analytics state
  const [reportPeriod, setReportPeriod] = useState<'today' | 'yesterday' | 'week' | 'last-week' | 'month' | 'last-month' | 'quarter' | 'year' | 'last-year' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  
  // Categories state
  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      name: 'Camera An Ninh',
      description: 'Camera giám sát, camera IP, camera Wifi',
      imageUrl: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=400',
      productCount: 15,
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Khóa Thông Minh',
      description: 'Khóa cửa vân tay, khóa mật khẩu, khóa điện tử',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      productCount: 12,
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Báo Động',
      description: 'Hệ thống báo động chống trộm, cảm biến',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      productCount: 8,
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      name: 'Chuông Cửa',
      description: 'Chuông cửa có hình, chuông cửa thông minh',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      productCount: 6,
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ]);

  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      sku: 'CAM-WIFI-4K-001',
      name: 'Camera IP Wifi 4K Ultra HD',
      shortDesc: 'Camera IP Wifi 4K Ultra HD với độ phân giải cao',
      longDesc: 'Camera IP Wifi 4K Ultra HD với độ phân giải cao, hỗ trợ xem từ xa qua điện thoại. Tầm nhìn ban đêm 30m, góc nhìn rộng 110°, kết nối Wifi 2.4GHz/5GHz.',
      listedPrice: 2500000,
      active: true,
      brandId: '1',
      brandName: 'Hikvision',
      categoryId: '1',
      categoryName: 'Camera An Ninh',
      mediaAssets: [
        {
          id: '1-1',
          url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          altText: 'Camera IP Wifi 4K - Góc chính diện',
          productId: '1'
        },
        {
          id: '1-2',
          url: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          altText: 'Camera IP Wifi 4K - Góc nghiêng',
          productId: '1'
        },
        {
          id: '1-3',
          url: 'https://images.unsplash.com/photo-1558002038-1055907df827?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          altText: 'Camera IP Wifi 4K - Tầm nhìn ban đêm',
          productId: '1'
        }
      ],
      stock: 25,
      discount: 10,
      rating: 4.5,
      soldCount: 150,
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      sku: 'LOCK-FP-SAM-001',
      name: 'Khóa Cửa Thông Minh Vân Tay',
      shortDesc: 'Khóa cửa thông minh với công nghệ vân tay, mật khẩu và thẻ từ',
      longDesc: 'Khóa cửa thông minh Samsung với công nghệ vân tay hiện đại, hỗ trợ 100 vân tay, mật khẩu và thẻ từ. Pin sử dụng 12 tháng, chất liệu hợp kim kẽm cao cấp.',
      listedPrice: 4200000,
      active: true,
      brandId: '2',
      brandName: 'Samsung',
      categoryId: '2',
      categoryName: 'Khóa Thông Minh',
      mediaAssets: [
        {
          id: '2-1',
          url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          altText: 'Khóa Cửa Thông Minh - Mặt trước',
          productId: '2'
        },
        {
          id: '2-2',
          url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          altText: 'Khóa Cửa Thông Minh - Cảm biến vân tay',
          productId: '2'
        }
      ],
      stock: 12,
      discount: 15,
      rating: 4.8,
      soldCount: 89,
      image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      createdAt: '2024-02-01T10:00:00Z',
      updatedAt: '2024-02-01T10:00:00Z'
    },
    {
      id: '3',
      sku: 'ALARM-AJAX-WL-001',
      name: 'Hệ Thống Báo Động Không Dây',
      shortDesc: 'Hệ thống báo động không dây hiện đại với tầm hoạt động 2000m',
      longDesc: 'Hệ thống báo động không dây Ajax với tần số 868 MHz, tầm hoạt động lên đến 2000m. Độ ồn 85dB, pin sử dụng lên đến 4 năm.',
      listedPrice: 1800000,
      active: false,
      brandId: '3',
      brandName: 'Ajax',
      categoryId: '3',
      categoryName: 'Báo Động',
      mediaAssets: [
        {
          id: '3-1',
          url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          altText: 'Hệ thống báo động Ajax - Thiết bị chính',
          productId: '3'
        },
        {
          id: '3-2',
          url: 'https://images.unsplash.com/photo-1585888816961-a5ee75b7ec3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          altText: 'Hệ thống báo động Ajax - Remote điều khiển',
          productId: '3'
        },
        {
          id: '3-3',
          url: 'https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          altText: 'Hệ thống báo động Ajax - Cảm biến chuyển động',
          productId: '3'
        }
      ],
      stock: 0,
      discount: 0,
      rating: 4.2,
      soldCount: 45,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      createdAt: '2024-03-01T10:00:00Z',
      updatedAt: '2024-03-01T10:00:00Z'
    }
  ]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    shortDesc: '',
    longDesc: '',
    listedPrice: '',
    active: true,
    brandId: '',
    brandName: '',
    categoryId: '',
    categoryName: '',
    stock: '',
    image: '',
    discount: ''
  });
  const [productImagePreviews, setProductImagePreviews] = useState<string[]>([]);
  const [categoryImagePreview, setCategoryImagePreview] = useState<string>('');
  const [userAvatarPreview, setUserAvatarPreview] = useState<string>('');
  const [bannerImagePreview, setBannerImagePreview] = useState<string>('');
  const [brandLogoPreview, setBrandLogoPreview] = useState<string>('');
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    active: true
  });
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [promotionFormData, setPromotionFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'PERCENT' as 'PERCENT' | 'FIXED_AMOUNT' | 'FREE_SHIP',
    discountValue: '',
    minOrderValue: '',
    maxUsage: '',
    perUserLimit: '',
    startAt: '',
    endAt: '',
    active: true
  });
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    email: '',
    name: '',
    phone: '',
    avatarUrl: '',
    provider: 'local' as 'local' | 'google' | 'facebook',
    role: 'USER' as 'USER' | 'ADMIN'
  });
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articleFormData, setArticleFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    active: true,
    adminName: ''
  });
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerFormData, setBannerFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    position: 'HOME_HERO' as 'HOME_HERO' | 'HOME_SECONDARY' | 'PRODUCT_PAGE' | 'SIDEBAR',
    displayOrder: '',
    startDate: '',
    endDate: '',
    active: true
  });
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandFormData, setBrandFormData] = useState({
    name: '',
    logoUrl: ''
  });
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(null);
  const [inventoryFormData, setInventoryFormData] = useState({
    productId: '',
    productName: '',
    productSku: '',
    onHand: '',
    reserved: ''
  });
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [viewingTicket, setViewingTicket] = useState<SupportTicket | null>(null);
  const [ticketResponse, setTicketResponse] = useState('');

  // Users state
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'nguyenvana@example.com',
      name: 'Nguyễn Văn A',
      phone: '0123456789',
      enabled: true,
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
      provider: 'local',
      role: 'USER',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      totalOrders: 5,
      totalSpent: 15000000,
      addresses: [
        {
          id: '1',
          name: 'Nguyễn Văn A',
          phone: '0123456789',
          street: '123 Đường ABC',
          ward: 'Phường Bến Nghé',
          province: 'TP. Hồ Chí Minh',
          isDefault: true,
          userId: '1'
        }
      ]
    },
    {
      id: '2',
      email: 'tranthib@example.com',
      name: 'Trần Thị B',
      phone: '0987654321',
      enabled: true,
      avatarUrl: 'https://i.pravatar.cc/150?img=2',
      provider: 'google',
      role: 'USER',
      createdAt: '2024-02-20T14:15:00Z',
      updatedAt: '2024-02-20T14:15:00Z',
      totalOrders: 3,
      totalSpent: 8000000,
      addresses: [
        {
          id: '2',
          name: 'Trần Thị B',
          phone: '0987654321',
          street: '456 Đường XYZ',
          ward: 'Phường Thảo Điền',
          province: 'TP. Hồ Chí Minh',
          isDefault: true,
          userId: '2'
        }
      ]
    },
    {
      id: '3',
      email: 'levanc@example.com',
      name: 'Lê Văn C',
      phone: '0912345678',
      enabled: false,
      avatarUrl: 'https://i.pravatar.cc/150?img=3',
      provider: 'local',
      role: 'USER',
      createdAt: '2024-03-10T09:00:00Z',
      updatedAt: '2024-03-10T09:00:00Z',
      totalOrders: 1,
      totalSpent: 1800000,
      addresses: [
        {
          id: '3',
          name: 'Lê Văn C',
          phone: '0912345678',
          street: '789 Đường DEF',
          ward: 'Phường Võ Thị Sáu',
          province: 'TP. Hồ Chí Minh',
          isDefault: true,
          userId: '3'
        }
      ]
    },
    {
      id: '4',
      email: 'admin@securityshop.com',
      name: 'Admin User',
      phone: '0909090909',
      enabled: true,
      avatarUrl: 'https://i.pravatar.cc/150?img=4',
      provider: 'local',
      role: 'ADMIN',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    {
      id: '5',
      email: 'phamthid@example.com',
      name: 'Phạm Thị D',
      phone: '0856789012',
      enabled: true,
      avatarUrl: 'https://i.pravatar.cc/150?img=5',
      provider: 'facebook',
      role: 'USER',
      createdAt: '2024-04-05T13:20:00Z',
      updatedAt: '2024-04-05T13:20:00Z',
      totalOrders: 8,
      totalSpent: 25000000
    }
  ]);

  // Mock data
  const stats: DashboardStats = {
    totalUsers: users.length,
    totalProducts: products.length,
    totalOrders: 10,
    totalRevenue: 355000000
  };

  // Analytics data - Dữ liệu doanh thu theo tháng
  const revenueData = [
    { month: 'T1', revenue: 45000000, orders: 120 },
    { month: 'T2', revenue: 52000000, orders: 145 },
    { month: 'T3', revenue: 48000000, orders: 135 },
    { month: 'T4', revenue: 65000000, orders: 180 },
    { month: 'T5', revenue: 58000000, orders: 165 },
    { month: 'T6', revenue: 72000000, orders: 200 },
    { month: 'T7', revenue: 68000000, orders: 190 },
    { month: 'T8', revenue: 75000000, orders: 210 },
    { month: 'T9', revenue: 82000000, orders: 230 },
    { month: 'T10', revenue: 88000000, orders: 245 },
    { month: 'T11', revenue: 95000000, orders: 265 },
    { month: 'T12', revenue: 102000000, orders: 285 }
  ];

  // Dữ liệu tồn kho theo danh mục
  const inventoryData = [
    { category: 'Camera', stock: 250, lowStock: 15, outOfStock: 3 },
    { category: 'Khóa cửa', stock: 180, lowStock: 12, outOfStock: 2 },
    { category: 'Báo động', stock: 320, lowStock: 8, outOfStock: 1 },
    { category: 'Chuông cửa', stock: 150, lowStock: 10, outOfStock: 0 },
    { category: 'Phụ kiện', stock: 420, lowStock: 20, outOfStock: 5 }
  ];

  // Dữ liệu lượng truy cập
  const trafficData = [
    { day: 'T2', visits: 1250, newUsers: 340, pageViews: 4850 },
    { day: 'T3', visits: 1480, newUsers: 420, pageViews: 5620 },
    { day: 'T4', visits: 1320, newUsers: 380, pageViews: 5100 },
    { day: 'T5', visits: 1650, newUsers: 490, pageViews: 6280 },
    { day: 'T6', visits: 1890, newUsers: 560, pageViews: 7150 },
    { day: 'T7', visits: 2100, newUsers: 620, pageViews: 8240 },
    { day: 'CN', visits: 1950, newUsers: 580, pageViews: 7650 }
  ];

  // Phân phối sản phẩm theo giá
  const priceDistribution = [
    { range: '< 1 triệu', count: 45, value: 15 },
    { range: '1-3 triệu', count: 128, value: 35 },
    { range: '3-5 triệu', count: 89, value: 28 },
    { range: '5-10 triệu', count: 54, value: 17 },
    { range: '> 10 triệu', count: 18, value: 5 }
  ];

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  // Hàm lấy tên kỳ báo cáo
  const getReportPeriodName = () => {
    const periodNames: Record<typeof reportPeriod, string> = {
      'today': 'Hôm nay',
      'yesterday': 'Hôm qua',
      'week': 'Tuần này',
      'last-week': 'Tuần trước',
      'month': 'Tháng này',
      'last-month': 'Tháng trước',
      'quarter': 'Quý này',
      'year': 'Năm nay',
      'last-year': 'Năm trước',
      'custom': customStartDate && customEndDate 
        ? `Từ ${new Date(customStartDate).toLocaleDateString('vi-VN')} đến ${new Date(customEndDate).toLocaleDateString('vi-VN')}`
        : 'Tùy chọn'
    };
    return periodNames[reportPeriod];
  };

  // Hàm tạo báo cáo Excel
  const handleGenerateReport = () => {
    try {
      // Validate custom dates
      if (reportPeriod === 'custom') {
        if (!customStartDate || !customEndDate) {
          toast.error('Vui lòng chọn ngày bắt đầu và kết thúc!');
          return;
        }
        if (new Date(customStartDate) > new Date(customEndDate)) {
          toast.error('Ngày bắt đầu phải trước ngày kết thúc!');
          return;
        }
      }

      // Tạo workbook mới
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Tổng quan
      const summaryData = [
        ['BÁO CÁO THỐNG KÊ TỔNG HỢP'],
        ['Kỳ báo cáo:', getReportPeriodName()],
        ['Ngày tạo:', new Date().toLocaleString('vi-VN')],
        [],
        ['CHỈ SỐ TỔNG QUAN'],
        ['Tổng doanh thu', revenueData.reduce((sum, item) => sum + item.revenue, 0)],
        ['Tổng đơn hàng', revenueData.reduce((sum, item) => sum + item.orders, 0)],
        ['Tổng tồn kho', inventoryData.reduce((sum, item) => sum + item.stock, 0)],
        ['Sản phẩm sắp hết', inventoryData.reduce((sum, item) => sum + item.lowStock, 0)],
        ['Sản phẩm hết hàng', inventoryData.reduce((sum, item) => sum + item.outOfStock, 0)],
        ['Tổng lượt truy cập', trafficData.reduce((sum, item) => sum + item.visits, 0)],
        ['Người dùng mới', trafficData.reduce((sum, item) => sum + item.newUsers, 0)],
        ['Tổng trang xem', trafficData.reduce((sum, item) => sum + item.pageViews, 0)]
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng quan');

      // Sheet 2: Doanh thu theo tháng
      const revenueSheetData = [
        ['DOANH THU VÀ ĐƠN HÀNG THEO THÁNG'],
        [],
        ['Tháng', 'Doanh thu (VNĐ)', 'Số đơn hàng'],
        ...revenueData.map(item => [
          item.month,
          item.revenue,
          item.orders
        ]),
        [],
        ['TỔNG CỘNG', 
         revenueData.reduce((sum, item) => sum + item.revenue, 0),
         revenueData.reduce((sum, item) => sum + item.orders, 0)
        ]
      ];
      const revenueSheet = XLSX.utils.aoa_to_sheet(revenueSheetData);
      revenueSheet['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Doanh thu');

      // Sheet 3: Tồn kho theo danh mục
      const inventorySheetData = [
        ['TỒN KHO THEO DANH MỤC'],
        [],
        ['Danh mục', 'Còn hàng', 'Sắp hết', 'Hết hàng', 'Tổng'],
        ...inventoryData.map(item => [
          item.category,
          item.stock,
          item.lowStock,
          item.outOfStock,
          item.stock + item.lowStock + item.outOfStock
        ]),
        [],
        ['TỔNG CỘNG',
         inventoryData.reduce((sum, item) => sum + item.stock, 0),
         inventoryData.reduce((sum, item) => sum + item.lowStock, 0),
         inventoryData.reduce((sum, item) => sum + item.outOfStock, 0),
         inventoryData.reduce((sum, item) => sum + item.stock + item.lowStock + item.outOfStock, 0)
        ]
      ];
      const inventorySheet = XLSX.utils.aoa_to_sheet(inventorySheetData);
      inventorySheet['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(workbook, inventorySheet, 'Tồn kho');

      // Sheet 4: Lượng truy cập
      const trafficSheetData = [
        ['LƯỢNG TRUY CẬP THEO TUẦN'],
        [],
        ['Ngày', 'Lượt truy cập', 'Người dùng mới', 'Trang xem'],
        ...trafficData.map(item => [
          item.day,
          item.visits,
          item.newUsers,
          item.pageViews
        ]),
        [],
        ['TỔNG CỘNG',
         trafficData.reduce((sum, item) => sum + item.visits, 0),
         trafficData.reduce((sum, item) => sum + item.newUsers, 0),
         trafficData.reduce((sum, item) => sum + item.pageViews, 0)
        ]
      ];
      const trafficSheet = XLSX.utils.aoa_to_sheet(trafficSheetData);
      trafficSheet['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(workbook, trafficSheet, 'Lượng truy cập');

      // Sheet 5: Phân phối giá
      const priceSheetData = [
        ['PHÂN PHỐI SẢN PHẨM THEO GIÁ'],
        [],
        ['Mức giá', 'Số lượng', 'Tỷ lệ (%)'],
        ...priceDistribution.map(item => [
          item.range,
          item.count,
          item.value
        ]),
        [],
        ['TỔNG CỘNG',
         priceDistribution.reduce((sum, item) => sum + item.count, 0),
         100
        ]
      ];
      const priceSheet = XLSX.utils.aoa_to_sheet(priceSheetData);
      priceSheet['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(workbook, priceSheet, 'Phân phối giá');

      // Sheet 6: Sản phẩm (từ dữ liệu products)
      const productSheetData = [
        ['DANH SÁCH SẢN PHẨM'],
        [],
        ['Mã SKU', 'Tên sản phẩm', 'Giá (VNĐ)', 'Danh mục', 'Thương hiệu', 'Tồn kho', 'Trạng thái'],
        ...products.map(p => [
          p.sku,
          p.name,
          p.listedPrice,
          p.categoryName,
          p.brandName || 'N/A',
          p.stock || 0,
          p.active ? 'Đang bán' : 'Ngưng bán'
        ])
      ];
      const productSheet = XLSX.utils.aoa_to_sheet(productSheetData);
      productSheet['!cols'] = [
        { wch: 20 }, 
        { wch: 40 }, 
        { wch: 15 }, 
        { wch: 20 }, 
        { wch: 15 }, 
        { wch: 12 }, 
        { wch: 15 }
      ];
      XLSX.utils.book_append_sheet(workbook, productSheet, 'Sản phẩm');

      // Sheet 7: Người dùng
      const userSheetData = [
        ['DANH SÁCH NGƯỜI DÙNG'],
        [],
        ['ID', 'Tên', 'Email', 'Vai trò', 'Trạng thái', 'Tổng chi tiêu (VNĐ)'],
        ...users.map(u => [
          u.id,
          u.name,
          u.email,
          u.role,
          u.enabled ? 'Hoạt động' : 'Bị khóa',
          u.totalSpent || 0
        ])
      ];
      const userSheet = XLSX.utils.aoa_to_sheet(userSheetData);
      userSheet['!cols'] = [
        { wch: 10 }, 
        { wch: 25 }, 
        { wch: 30 }, 
        { wch: 15 }, 
        { wch: 15 }, 
        { wch: 20 }
      ];
      XLSX.utils.book_append_sheet(workbook, userSheet, 'Người dùng');

      // Xuất file Excel
      const fileName = `bao-cao-thong-ke-${reportPeriod}-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast.success('Đã tạo và tải xuống báo cáo Excel thành công!');
    } catch (error) {
      console.error('Lỗi khi tạo báo cáo:', error);
      toast.error('Có lỗi xảy ra khi tạo báo cáo!');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: '1',
      code: 'CAMERA20',
      name: 'Giảm giá 20% Camera An Ninh',
      description: 'Giảm 20% cho tất cả sản phẩm camera an ninh trong tháng này',
      discountType: 'PERCENT',
      discountValue: 20,
      minOrderValue: 1000000,
      maxUsage: 100,
      perUserLimit: 1,
      used: 15,
      startAt: '2025-01-01T00:00:00Z',
      endAt: '2025-01-31T23:59:59Z',
      active: true
    },
    {
      id: '2',
      code: 'FREESHIP',
      name: 'Miễn phí vận chuyển',
      description: 'Miễn phí vận chuyển cho đơn hàng từ 2 triệu đồng',
      discountType: 'FREE_SHIP',
      discountValue: 0,
      minOrderValue: 2000000,
      maxUsage: 200,
      perUserLimit: 3,
      used: 45,
      startAt: '2025-01-15T00:00:00Z',
      endAt: '2025-02-15T23:59:59Z',
      active: true
    },
    {
      id: '3',
      code: 'YEAREND500',
      name: 'Khuyến mãi cuối năm',
      description: 'Giảm 500k cho đơn hàng từ 5 triệu đồng',
      discountType: 'FIXED_AMOUNT',
      discountValue: 500000,
      minOrderValue: 5000000,
      maxUsage: 50,
      perUserLimit: 1,
      used: 50,
      startAt: '2024-12-01T00:00:00Z',
      endAt: '2024-12-31T23:59:59Z',
      active: false
    },
    {
      id: '4',
      code: 'SMARTLOCK15',
      name: 'Flash Sale Khóa Thông Minh',
      description: 'Giảm 15% cho tất cả khóa thông minh',
      discountType: 'PERCENT',
      discountValue: 15,
      minOrderValue: 500000,
      maxUsage: 30,
      perUserLimit: 1,
      used: 0,
      startAt: '2025-01-20T00:00:00Z',
      endAt: '2025-01-25T23:59:59Z',
      active: false
    }
  ]);

  // Articles state
  const [articles, setArticles] = useState<Article[]>([
    {
      id: '1',
      title: 'Top 5 Camera An Ninh Tốt Nhất Năm 2025',
      slug: 'top-5-camera-an-ninh-tot-nhat-2025',
      summary: 'Khám phá 5 dòng camera an ninh được đánh giá cao nhất năm 2025 với tính năng vượt trội, giá cả hợp lý và độ bền cao.',
      content: 'Nội dung bài viết chi tiết về top 5 camera an ninh tốt nhất năm 2025. Bài viết phân tích kỹ lưỡng về các tính năng, ưu nhược điểm của từng sản phẩm...',
      publishedAt: '2025-01-10T10:00:00Z',
      active: true,
      adminName: 'Admin',
      createdAt: '2025-01-09T15:30:00Z',
      updatedAt: '2025-01-10T10:00:00Z'
    },
    {
      id: '2',
      title: 'Hướng Dẫn Lắp Đặt Khóa Cửa Thông Minh',
      slug: 'huong-dan-lap-dat-khoa-cua-thong-minh',
      summary: 'Hướng dẫn từng bước chi tiết cách lắp đặt khóa cửa thông minh tại nhà một cách an toàn và hiệu quả.',
      content: 'Bài hướng dẫn chi tiết cách lắp đặt khóa cửa thông minh tại nhà. Bao gồm các bước chuẩn bị, lắp đặt, kết nối và kiểm tra...',
      publishedAt: '2025-01-08T14:00:00Z',
      active: true,
      adminName: 'Admin',
      createdAt: '2025-01-07T10:00:00Z',
      updatedAt: '2025-01-08T14:00:00Z'
    },
    {
      id: '3',
      title: 'Khuyến Mãi Lớn Tháng 1 - Giảm Giá 20%',
      slug: 'khuyen-mai-lon-thang-1',
      summary: 'Chương trình khuyến mãi đặc biệt trong tháng 1 - Giảm giá 20% toàn bộ sản phẩm camera an ninh và thiết bị thông minh.',
      content: 'Chương trình khuyến mãi đặc biệt trong tháng 1 với ưu đãi giảm giá 20% cho tất cả các sản phẩm camera an ninh...',
      publishedAt: '2025-01-05T08:00:00Z',
      active: true,
      adminName: 'Admin',
      createdAt: '2025-01-04T16:00:00Z',
      updatedAt: '2025-01-05T08:00:00Z'
    },
    {
      id: '4',
      title: 'Xu Hướng An Ninh Thông Minh 2025',
      slug: 'xu-huong-an-ninh-thong-minh-2025',
      summary: 'Cập nhật những xu hướng công nghệ an ninh thông minh mới nhất trong năm 2025, từ AI đến IoT.',
      content: 'Những xu hướng mới trong ngành an ninh thông minh năm 2025. Công nghệ AI, nhận diện khuôn mặt, kết nối IoT...',
      publishedAt: '2025-01-12T09:00:00Z',
      active: false,
      adminName: 'Admin',
      createdAt: '2025-01-12T09:00:00Z',
      updatedAt: '2025-01-12T11:30:00Z'
    }
  ]);

  // Banners state
  const [banners, setBanners] = useState<Banner[]>([
    {
      id: '1',
      title: 'Banner Trang Chủ - Khuyến Mãi Đầu Năm',
      description: 'Giảm giá 20% tất cả sản phẩm camera',
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920',
      linkUrl: '/products?category=camera',
      position: 'HOME_HERO',
      displayOrder: 1,
      active: true,
      startDate: '2025-01-01T00:00:00Z',
      endDate: '2025-01-31T23:59:59Z',
      createdAt: '2024-12-28T10:00:00Z'
    },
    {
      id: '2',
      title: 'Banner Khóa Thông Minh',
      description: 'Khóa cửa thông minh - An toàn tuyệt đối',
      imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1920',
      linkUrl: '/products?category=smart-lock',
      position: 'HOME_SECONDARY',
      displayOrder: 2,
      active: true,
      createdAt: '2024-12-20T14:00:00Z'
    },
    {
      id: '3',
      title: 'Banner Sidebar - Miễn Phí Vận Chuyển',
      description: 'Miễn phí vận chuyển cho đơn từ 2 triệu',
      imageUrl: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=600',
      linkUrl: '/promotions',
      position: 'SIDEBAR',
      displayOrder: 1,
      active: true,
      startDate: '2025-01-10T00:00:00Z',
      endDate: '2025-02-28T23:59:59Z',
      createdAt: '2025-01-05T09:00:00Z'
    },
    {
      id: '4',
      title: 'Banner Sản Phẩm - Flash Sale',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
      linkUrl: '/products?sale=true',
      position: 'PRODUCT_PAGE',
      displayOrder: 1,
      active: false,
      createdAt: '2024-12-15T08:00:00Z'
    }
  ]);

  // Brand state
  const [brands, setBrands] = useState<Brand[]>([
    {
      id: '1',
      name: 'Hikvision',
      logoUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200',
      createdAt: '2024-01-15T10:00:00Z',
      productCount: 15
    },
    {
      id: '2',
      name: 'Dahua',
      logoUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=200',
      createdAt: '2024-02-20T10:00:00Z',
      productCount: 12
    },
    {
      id: '3',
      name: 'Xiaomi',
      logoUrl: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=200',
      createdAt: '2024-03-10T10:00:00Z',
      productCount: 8
    }
  ]);

  // Inventory state
  const [inventories, setInventories] = useState<Inventory[]>([
    {
      id: '1',
      productId: '1',
      productName: 'Camera IP Wifi 4K Ultra HD',
      productSku: 'CAM-4K-001',
      onHand: 50,
      reserved: 5
    },
    {
      id: '2',
      productId: '2',
      productName: 'Khóa Cửa Thông Minh Vân Tay',
      productSku: 'LOCK-FP-002',
      onHand: 30,
      reserved: 3
    },
    {
      id: '3',
      productId: '3',
      productName: 'Chuông Cửa Video HD',
      productSku: 'BELL-HD-003',
      onHand: 20,
      reserved: 0
    }
  ]);

  // Support Tickets state
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: '1',
      title: 'Không thể đăng nhập vào tài khoản',
      subject: 'Tài khoản',
      content: 'Xin chào,\n\nTôi đã quên mật khẩu và không thể đăng nhập vào tài khoản của mình. Tôi đã thử sử dụng chức năng "Quên mật khẩu" nhiều lần nhưng email khôi phục không được gửi đến hộp thư của tôi.\n\nTôi đã kiểm tra cả trong thư mục spam và rác nhưng vẫn không thấy email nào từ hệ thống.\n\nEmail đăng ký: nguyenvana@example.com\nSố điện thoại: 0123456789\n\nXin vui lòng hỗ trợ tôi khôi phục lại tài khoản hoặc đặt lại mật khẩu. Cảm ơn!',
      status: 'OPEN',
      createdAt: '2025-01-15T10:30:00Z',
      userId: '1',
      userName: 'Nguyễn Văn A',
      userEmail: 'nguyenvana@example.com'
    },
    {
      id: '2',
      title: 'Sản phẩm camera bị lỗi không kết nối',
      subject: 'Kỹ thuật',
      content: 'Kính gửi bộ phận hỗ trợ,\n\nTôi vừa nhận được sản phẩm Camera IP Wifi 4K Ultra HD từ đơn hàng ORD001 hôm qua. Tuy nhiên khi cài đặt, camera không thể kết nối với điện thoại của tôi.\n\nTôi đã thực hiện các bước:\n1. Tải ứng dụng theo hướng dẫn\n2. Kết nối camera với nguồn điện\n3. Quét mã QR trên camera\n4. Kết nối Wifi\n\nNhưng ở bước 4, camera báo lỗi "Không thể kết nối". Tôi đã thử reset camera nhiều lần theo hướng dẫn trong sách nhưng vẫn không được.\n\nĐiện thoại: iPhone 13\nĐường truyền: Wifi 5GHz, tốc độ 100Mbps\n\nCần hỗ trợ kỹ thuật gấp. Cảm ơn!',
      status: 'IN_PROGRESS',
      createdAt: '2025-01-14T15:20:00Z',
      userId: '2',
      userName: 'Trần Thị B',
      userEmail: 'tranthib@example.com'
    },
    {
      id: '3',
      title: 'Thắc mắc về chính sách đổi trả',
      subject: 'Chính sách',
      content: 'Tôi muốn biết thời gian đổi trả sản phẩm là bao lâu? Nếu sản phẩm bị lỗi từ nhà sản xuất thì có được đổi mới không?',
      status: 'RESOLVED',
      createdAt: '2025-01-13T09:15:00Z',
      userId: '5',
      userName: 'Phạm Thị D',
      userEmail: 'phamthid@example.com'
    },
    {
      id: '4',
      title: 'Yêu cầu hóa đơn VAT',
      subject: 'Hóa đơn',
      content: 'Đơn hàng ORD003 của tôi cần xuất hóa đơn VAT cho công ty. Thông tin công ty: ABC Corp, MST: 0123456789.',
      status: 'CLOSED',
      createdAt: '2025-01-12T14:45:00Z',
      userId: '1',
      userName: 'Nguyễn Văn A',
      userEmail: 'nguyenvana@example.com'
    },
    {
      id: '5',
      title: 'Sản phẩm giao sai địa chỉ',
      subject: 'Vận chuyển',
      content: 'Đơn hàng ORD002 được giao đến địa chỉ sai. Tôi đã cung cấp đầy đủ thông tin nhưng không biết vì sao bị nhầm lẫn.',
      status: 'OPEN',
      createdAt: '2025-01-15T08:00:00Z',
      userId: '2',
      userName: 'Trần Thị B',
      userEmail: 'tranthib@example.com'
    },
    {
      id: '6',
      title: 'Hỏi về bảo hành sản phẩm',
      subject: 'Bảo hành',
      content: 'Khóa thông minh của tôi còn bảo hành không? Đã mua từ 6 tháng trước và hiện tại có vấn đề về pin.',
      status: 'IN_PROGRESS',
      createdAt: '2025-01-14T11:30:00Z',
      userId: '3',
      userName: 'Lê Văn C',
      userEmail: 'levanc@example.com'
    }
  ]);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD001',
      customerName: 'Nguyễn Văn A',
      customerEmail: 'nguyenvana@example.com',
      customerPhone: '0123456789',
      total: 2500000,
      status: 'pending',
      date: '2025-01-15',
      items: [
        { productId: '1', productName: 'Camera IP Wifi 4K Ultra HD', quantity: 1, price: 2500000 }
      ],
      shippingAddress: '123 Đường ABC, Quận 1, TP.HCM',
      paymentMethod: 'COD'
    },
    {
      id: 'ORD002',
      customerName: 'Trần Thị B',
      customerEmail: 'tranthib@example.com',
      customerPhone: '0987654321',
      total: 4200000,
      status: 'processing',
      date: '2025-01-14',
      items: [
        { productId: '2', productName: 'Khóa Cửa Thông Minh Vân Tay', quantity: 1, price: 4200000 }
      ],
      shippingAddress: '456 Đường XYZ, Quận 2, TP.HCM',
      paymentMethod: 'Bank Transfer'
    },
    {
      id: 'ORD003',
      customerName: 'Lê Văn C',
      customerEmail: 'levanc@example.com',
      customerPhone: '0912345678',
      total: 1800000,
      status: 'shipped',
      date: '2025-01-13',
      items: [
        { productId: '3', productName: 'Hệ Thống Báo Động Không Dây', quantity: 1, price: 1800000 }
      ],
      shippingAddress: '789 Đường DEF, Quận 3, TP.HCM',
      paymentMethod: 'COD'
    },
    {
      id: 'ORD004',
      customerName: 'Phạm Thị D',
      customerEmail: 'phamthid@example.com',
      customerPhone: '0856789012',
      total: 3500000,
      status: 'delivered',
      date: '2025-01-12',
      items: [
        { productId: '1', productName: 'Camera IP Wifi 4K Ultra HD', quantity: 1, price: 2500000 },
        { productId: '3', productName: 'Hệ Thống Báo Động Không Dây', quantity: 1, price: 1000000 }
      ],
      shippingAddress: '321 Đường GHI, Quận 4, TP.HCM',
      paymentMethod: 'Credit Card'
    },
    {
      id: 'ORD005',
      customerName: 'Hoàng Văn E',
      customerEmail: 'hoangvane@example.com',
      customerPhone: '0765432109',
      total: 5200000,
      status: 'pending',
      date: '2025-01-11',
      items: [
        { productId: '2', productName: 'Khóa Cửa Thông Minh Vân Tay', quantity: 1, price: 4200000 },
        { productId: '3', productName: 'Hệ Thống Báo Động Không Dây', quantity: 1, price: 1000000 }
      ],
      shippingAddress: '654 Đường JKL, Quận 5, TP.HCM',
      paymentMethod: 'Bank Transfer'
    },
    {
      id: 'ORD006',
      customerName: 'Đỗ Thị F',
      customerEmail: 'dothif@example.com',
      customerPhone: '0698765432',
      total: 2800000,
      status: 'processing',
      date: '2025-01-10',
      items: [
        { productId: '1', productName: 'Camera IP Wifi 4K Ultra HD', quantity: 1, price: 2500000 },
        { productId: '3', productName: 'Hệ Thống Báo Động Không Dây', quantity: 1, price: 300000 }
      ],
      shippingAddress: '987 Đường MNO, Quận 6, TP.HCM',
      paymentMethod: 'COD'
    },
    {
      id: 'ORD007',
      customerName: 'Bùi Văn G',
      customerEmail: 'buivang@example.com',
      customerPhone: '0587654321',
      total: 4100000,
      status: 'shipped',
      date: '2025-01-09',
      items: [
        { productId: '2', productName: 'Khóa Cửa Thông Minh Vân Tay', quantity: 1, price: 4100000 }
      ],
      shippingAddress: '147 Đường PQR, Quận 7, TP.HCM',
      paymentMethod: 'Credit Card'
    },
    {
      id: 'ORD008',
      customerName: 'Vũ Thị H',
      customerEmail: 'vuthih@example.com',
      customerPhone: '0476543210',
      total: 1900000,
      status: 'delivered',
      date: '2025-01-08',
      items: [
        { productId: '3', productName: 'Hệ Thống Báo Động Không Dây', quantity: 1, price: 1900000 }
      ],
      shippingAddress: '258 Đường STU, Quận 8, TP.HCM',
      paymentMethod: 'Bank Transfer'
    },
    {
      id: 'ORD009',
      customerName: 'Đinh Văn I',
      customerEmail: 'dinhvani@example.com',
      customerPhone: '0365432109',
      total: 6300000,
      status: 'pending',
      date: '2025-01-07',
      items: [
        { productId: '1', productName: 'Camera IP Wifi 4K Ultra HD', quantity: 1, price: 2500000 },
        { productId: '2', productName: 'Khóa Cửa Thông Minh Vân Tay', quantity: 1, price: 3800000 }
      ],
      shippingAddress: '369 Đường VWX, Quận 9, TP.HCM',
      paymentMethod: 'COD'
    },
    {
      id: 'ORD010',
      customerName: 'Cao Thị K',
      customerEmail: 'caothik@example.com',
      customerPhone: '0254321098',
      total: 3200000,
      status: 'processing',
      date: '2025-01-06',
      items: [
        { productId: '1', productName: 'Camera IP Wifi 4K Ultra HD', quantity: 1, price: 2500000 },
        { productId: '3', productName: 'Hệ Thống Báo Động Không Dây', quantity: 1, price: 700000 }
      ],
      shippingAddress: '741 Đường YZA, Quận 10, TP.HCM',
      paymentMethod: 'Credit Card'
    }
  ]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Không hoạt động';
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đã gửi';
      case 'delivered': return 'Đã giao';
      default: return status;
    }
  };

  // Image Upload Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const newPreviews: string[] = [];

    newFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === newFiles.length) {
            setProductImagePreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemoveImage = (index: number) => {
    setProductImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Single Image Upload Handlers
  const handleSingleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCategoryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSingleImageUpload(e, setCategoryImagePreview);
  };

  const handleUserAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSingleImageUpload(e, setUserAvatarPreview);
  };

  const handleBannerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSingleImageUpload(e, setBannerImagePreview);
  };

  const handleBrandLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSingleImageUpload(e, setBrandLogoPreview);
  };

  // CRUD Functions
  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      sku: '',
      name: '',
      shortDesc: '',
      longDesc: '',
      listedPrice: '',
      active: true,
      brandId: '',
      brandName: '',
      categoryId: '',
      categoryName: '',
      stock: '',
      image: '',
      discount: ''
    });
    setProductImagePreviews([]);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      shortDesc: product.shortDesc || '',
      longDesc: product.longDesc || '',
      listedPrice: product.listedPrice.toString(),
      active: product.active,
      brandId: product.brandId || '',
      brandName: product.brandName || '',
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      stock: product.stock?.toString() || '',
      image: product.image || '',
      discount: product.discount?.toString() || ''
    });
    
    // Load existing images
    if (product.mediaAssets && product.mediaAssets.length > 0) {
      setProductImagePreviews(product.mediaAssets.map(asset => asset.url));
    } else {
      setProductImagePreviews([]);
    }
    
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      const product = products.find(p => p.id === productId);
      if (product && product.categoryId) {
        // Decrease category product count
        setCategories(categories.map(c => 
          c.id === product.categoryId 
            ? { ...c, productCount: c.productCount - 1 }
            : c
        ));
      }
      setProducts(products.filter(p => p.id !== productId));
      toast.success('Đã xóa sản phẩm thành công!');
    }
  };

  const handleSaveProduct = () => {
    if (!formData.name || !formData.listedPrice || !formData.categoryId || !formData.sku) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    if (parseFloat(formData.listedPrice) <= 0) {
      toast.error('Giá sản phẩm phải lớn hơn 0!');
      return;
    }

    const category = categories.find(c => c.id === formData.categoryId);
    if (!category) {
      toast.error('Danh mục không hợp lệ!');
      return;
    }

    // Create MediaAssets from uploaded images
    const mediaAssets: MediaAsset[] = productImagePreviews.map((preview, index) => ({
      id: `${Date.now()}-${index}`,
      url: preview, // In production, this would be the uploaded file URL from server
      altText: `${formData.name} - Ảnh ${index + 1}`,
      productId: editingProduct?.id || Date.now().toString()
    }));

    const productData = {
      sku: formData.sku,
      name: formData.name,
      shortDesc: formData.shortDesc,
      longDesc: formData.longDesc,
      listedPrice: parseFloat(formData.listedPrice),
      active: formData.active,
      brandId: formData.brandId || undefined,
      brandName: formData.brandName || undefined,
      categoryId: formData.categoryId,
      categoryName: category.name,
      mediaAssets: mediaAssets.length > 0 ? mediaAssets : undefined,
      stock: parseInt(formData.stock) || 0,
      discount: formData.discount ? parseFloat(formData.discount) : 0,
      image: mediaAssets.length > 0 ? mediaAssets[0].url : formData.image, // Fallback compatibility
      rating: 0,
      soldCount: 0
    };

    if (editingProduct) {
      // Update
      const oldCategoryId = editingProduct.categoryId;
      
      // Update product counts if category changed
      if (oldCategoryId !== formData.categoryId) {
        setCategories(categories.map(c => {
          if (c.id === oldCategoryId) {
            return { ...c, productCount: c.productCount - 1 };
          }
          if (c.id === formData.categoryId) {
            return { ...c, productCount: c.productCount + 1 };
          }
          return c;
        }));
      }
      
      setProducts(products.map(p => 
        p.id === editingProduct.id 
          ? { ...p, ...productData, updatedAt: new Date().toISOString() }
          : p
      ));
      toast.success('Đã cập nhật sản phẩm thành công!');
    } else {
      // Create
      const newProduct: Product = {
        id: Date.now().toString(),
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setProducts([...products, newProduct]);
      
      // Increase category product count
      setCategories(categories.map(c => 
        c.id === formData.categoryId 
          ? { ...c, productCount: c.productCount + 1 }
          : c
      ));
      
      toast.success('Đã thêm sản phẩm thành công!');
    }

    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // Product view handler
  const handleViewProduct = (product: Product) => {
    setViewingProduct(product);
  };

  const handleCloseProductDetailModal = () => {
    setViewingProduct(null);
  };

  // Category handlers
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      description: '',
      imageUrl: '',
      active: true
    });
    setCategoryImagePreview('');
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      imageUrl: category.imageUrl || '',
      active: category.active
    });
    setCategoryImagePreview(category.imageUrl || '');
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category && category.productCount > 0) {
      toast.error(`Không thể xóa danh mục có ${category.productCount} sản phẩm!`);
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      setCategories(categories.filter(c => c.id !== categoryId));
      toast.success('Đã xóa danh mục thành công!');
    }
  };

  const handleSaveCategory = () => {
    if (!categoryFormData.name) {
      toast.error('Vui lòng nhập tên danh mục!');
      return;
    }

    const categoryData = {
      name: categoryFormData.name,
      description: categoryFormData.description,
      imageUrl: categoryImagePreview || categoryFormData.imageUrl, // Use uploaded image preview
      active: categoryFormData.active
    };

    if (editingCategory) {
      // Update
      setCategories(categories.map(c => 
        c.id === editingCategory.id 
          ? { ...c, ...categoryData, updatedAt: new Date().toISOString() }
          : c
      ));
      toast.success('Đã cập nhật danh mục thành công!');
    } else {
      // Create
      const now = new Date().toISOString();
      const newCategory: Category = {
        id: Date.now().toString(),
        ...categoryData,
        productCount: 0,
        createdAt: now,
        updatedAt: now
      };
      setCategories([...categories, newCategory]);
      toast.success('Đã thêm danh mục thành công!');
    }

    setIsCategoryModalOpen(false);
  };

  const handleToggleCategoryStatus = (categoryId: string) => {
    setCategories(categories.map(c => 
      c.id === categoryId 
        ? { ...c, active: !c.active }
        : c
    ));
    toast.success('Đã cập nhật trạng thái danh mục!');
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  // Order handlers
  const handleViewOrder = (order: Order) => {
    setViewingOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
      // In a real app, this would make an API call
      toast.success('Đã xóa đơn hàng thành công!');
    }
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    // In a real app, this would make an API call
    toast.success('Đã cập nhật trạng thái đơn hàng thành công!');
  };

  const handleCloseOrderModal = () => {
    setIsOrderModalOpen(false);
    setViewingOrder(null);
    setEditingOrder(null);
  };

  // === Promotion CRUD handlers ===
  const handleAddPromotion = () => {
    setEditingPromotion(null);
    setPromotionFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'PERCENT',
      discountValue: '',
      minOrderValue: '',
      maxUsage: '',
      perUserLimit: '',
      startAt: '',
      endAt: '',
      active: true
    });
    setIsPromotionModalOpen(true);
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    // Convert ISO datetime to date input format (YYYY-MM-DD)
    const startDate = promotion.startAt ? promotion.startAt.split('T')[0] : '';
    const endDate = promotion.endAt ? promotion.endAt.split('T')[0] : '';
    
    setPromotionFormData({
      code: promotion.code,
      name: promotion.name,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue.toString(),
      minOrderValue: promotion.minOrderValue?.toString() || '',
      maxUsage: promotion.maxUsage?.toString() || '',
      perUserLimit: promotion.perUserLimit?.toString() || '',
      startAt: startDate,
      endAt: endDate,
      active: promotion.active
    });
    setIsPromotionModalOpen(true);
  };

  const handleDeletePromotion = (promotionId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) {
      setPromotions(promotions.filter(p => p.id !== promotionId));
      toast.success('Đã xóa khuyến mãi thành công!');
    }
  };

  const handleSavePromotion = () => {
    if (!promotionFormData.code || !promotionFormData.name || !promotionFormData.discountValue || 
        !promotionFormData.startAt || !promotionFormData.endAt) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    // Convert date to ISO format
    const startAt = `${promotionFormData.startAt}T00:00:00Z`;
    const endAt = `${promotionFormData.endAt}T23:59:59Z`;

    const promotionData = {
      code: promotionFormData.code.toUpperCase(),
      name: promotionFormData.name,
      description: promotionFormData.description,
      discountType: promotionFormData.discountType,
      discountValue: parseFloat(promotionFormData.discountValue),
      minOrderValue: promotionFormData.minOrderValue ? parseFloat(promotionFormData.minOrderValue) : undefined,
      maxUsage: promotionFormData.maxUsage ? parseInt(promotionFormData.maxUsage) : undefined,
      perUserLimit: promotionFormData.perUserLimit ? parseInt(promotionFormData.perUserLimit) : undefined,
      startAt: startAt,
      endAt: endAt,
      active: promotionFormData.active,
      used: editingPromotion?.used || 0
    };

    if (editingPromotion) {
      // Update
      setPromotions(promotions.map(p => 
        p.id === editingPromotion.id 
          ? { ...p, ...promotionData }
          : p
      ));
      toast.success('Đã cập nhật khuyến mãi thành công!');
    } else {
      // Create
      const newPromotion: Promotion = {
        id: Date.now().toString(),
        ...promotionData
      };
      setPromotions([...promotions, newPromotion]);
      toast.success('Đã tạo khuyến mãi thành công!');
    }

    setIsPromotionModalOpen(false);
  };

  const handleClosePromotionModal = () => {
    setIsPromotionModalOpen(false);
    setEditingPromotion(null);
  };

  const handleTogglePromotionStatus = (promotionId: string) => {
    setPromotions(promotions.map(p => 
      p.id === promotionId 
        ? { ...p, active: !p.active }
        : p
    ));
    toast.success('Đã cập nhật trạng thái khuyến mãi!');
  };

  // Helper function to check if promotion is expired
  const isPromotionExpired = (endAt: string) => {
    return new Date(endAt) < new Date();
  };

  // Helper function to get promotion status color
  const getPromotionStatusColor = (promotion: Promotion) => {
    if (isPromotionExpired(promotion.endAt)) {
      return 'bg-gray-100 text-gray-800';
    }
    return promotion.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Helper function to get promotion status text
  const getPromotionStatusText = (promotion: Promotion) => {
    if (isPromotionExpired(promotion.endAt)) {
      return 'Hết hạn';
    }
    return promotion.active ? 'Hoạt động' : 'Không hoạt động';
  };

  // === User CRUD handlers ===
  const handleViewUser = (user: User) => {
    setViewingUser(user);
    setEditingUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setViewingUser(null);
    setUserFormData({
      email: user.email,
      name: user.name,
      phone: user.phone || '',
      avatarUrl: user.avatarUrl || '',
      provider: user.provider,
      role: user.role
    });
    setUserAvatarPreview(user.avatarUrl || '');
    setIsUserModalOpen(true);
  };

  const handleSaveUser = () => {
    if (!userFormData.email || !userFormData.name) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    if (editingUser) {
      // Update
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { 
              ...u, 
              email: userFormData.email,
              name: userFormData.name,
              phone: userFormData.phone,
              avatarUrl: userAvatarPreview || userFormData.avatarUrl, // Use uploaded avatar
              provider: userFormData.provider,
              role: userFormData.role,
              updatedAt: new Date().toISOString()
            }
          : u
      ));
      toast.success('Đã cập nhật thông tin người dùng thành công!');
    }

    setIsUserModalOpen(false);
  };

  const handleToggleUserStatus = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const action = user.enabled ? 'khóa' : 'mở khóa';
      if (window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản này?`)) {
        setUsers(users.map(u => 
          u.id === userId 
            ? { ...u, enabled: !u.enabled }
            : u
        ));
        toast.success(`Đã ${action} tài khoản thành công!`);
      }
    }
  };

  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
    setViewingUser(null);
    setEditingUser(null);
  };

  // === Support Ticket handlers ===
  const handleViewTicket = (ticket: SupportTicket) => {
    setViewingTicket(ticket);
    setTicketResponse('');
    setIsTicketModalOpen(true);
  };

  const handleUpdateTicketStatus = (ticketId: string, newStatus: SupportTicket['status']) => {
    setTickets(tickets.map(t => 
      t.id === ticketId 
        ? { ...t, status: newStatus }
        : t
    ));
    toast.success('Đã cập nhật trạng thái phiếu hỗ trợ!');
  };

  const handleCloseTicketModal = () => {
    setIsTicketModalOpen(false);
    setViewingTicket(null);
    setTicketResponse('');
  };

  const handleSendResponse = () => {
    if (!ticketResponse.trim()) {
      toast.error('Vui lòng nhập nội dung trả lời!');
      return;
    }

    // Simulate sending response
    toast.success('Đã gửi phản hồi cho khách hàng!');
    
    // Update ticket status to IN_PROGRESS if it was OPEN
    if (viewingTicket && viewingTicket.status === 'OPEN') {
      handleUpdateTicketStatus(viewingTicket.id, 'IN_PROGRESS');
    }
    
    setTicketResponse('');
  };

  const getTicketStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTicketStatusText = (status: SupportTicket['status']) => {
    switch (status) {
      case 'OPEN': return 'Mới';
      case 'IN_PROGRESS': return 'Đang xử lý';
      case 'RESOLVED': return 'Đã giải quyết';
      case 'CLOSED': return 'Đã đóng';
      default: return status;
    }
  };

  // === Article CRUD handlers ===
  const handleAddArticle = () => {
    setEditingArticle(null);
    setArticleFormData({
      title: '',
      slug: '',
      summary: '',
      content: '',
      active: true,
      adminName: 'Admin'
    });
    setIsArticleModalOpen(true);
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setArticleFormData({
      title: article.title,
      slug: article.slug,
      summary: article.summary || '',
      content: article.content,
      active: article.active,
      adminName: article.adminName || 'Admin'
    });
    setIsArticleModalOpen(true);
  };

  const handleDeleteArticle = (articleId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      setArticles(articles.filter(a => a.id !== articleId));
      toast.success('Đã xóa bài viết thành công!');
    }
  };

  const handleSaveArticle = () => {
    // Validate required fields
    if (!articleFormData.title || !articleFormData.content) {
      toast.error('Vui lòng điền đầy đủ tiêu đề và nội dung!');
      return;
    }

    // Validate content length (min 20 chars)
    if (articleFormData.content.length < 20) {
      toast.error('Nội dung phải có ít nhất 20 ký tự!');
      return;
    }

    // Validate summary length (max 1000 chars)
    if (articleFormData.summary && articleFormData.summary.length > 1000) {
      toast.error('Tóm tắt không được vượt quá 1000 ký tự!');
      return;
    }

    const now = new Date().toISOString();
    
    // Generate slug if empty
    const slug = articleFormData.slug || articleFormData.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Validate slug pattern: ^[a-z0-9]+(?:-[a-z0-9]+)*$
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(slug)) {
      toast.error('Slug không hợp lệ! Chỉ chứa chữ thường, số và dấu gạch ngang.');
      return;
    }

    const articleData = {
      title: articleFormData.title,
      slug: slug,
      summary: articleFormData.summary,
      content: articleFormData.content,
      active: articleFormData.active,
      adminName: articleFormData.adminName,
      updatedAt: now
    };

    if (editingArticle) {
      // Update - không thay đổi publishedAt
      setArticles(articles.map(a => 
        a.id === editingArticle.id 
          ? { ...a, ...articleData, publishedAt: a.publishedAt }
          : a
      ));
      toast.success('Đã cập nhật bài viết thành công!');
    } else {
      // Create - set publishedAt
      const newArticle: Article = {
        id: Date.now().toString(),
        ...articleData,
        publishedAt: now,
        createdAt: now
      };
      setArticles([newArticle, ...articles]);
      toast.success('Đã tạo bài viết thành công!');
    }

    setIsArticleModalOpen(false);
  };

  const handleCloseArticleModal = () => {
    setIsArticleModalOpen(false);
    setEditingArticle(null);
  };

  // === Banner CRUD handlers ===
  const handleAddBanner = () => {
    setEditingBanner(null);
    setBannerFormData({
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      position: 'HOME_HERO',
      displayOrder: '',
      startDate: '',
      endDate: '',
      active: true
    });
    setBannerImagePreview('');
    setIsBannerModalOpen(true);
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    const startDate = banner.startDate ? banner.startDate.split('T')[0] : '';
    const endDate = banner.endDate ? banner.endDate.split('T')[0] : '';
    
    setBannerFormData({
      title: banner.title,
      description: banner.description || '',
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '',
      position: banner.position,
      displayOrder: banner.displayOrder.toString(),
      startDate: startDate,
      endDate: endDate,
      active: banner.active
    });
    setBannerImagePreview(banner.imageUrl);
    setIsBannerModalOpen(true);
  };

  const handleDeleteBanner = (bannerId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn gỡ banner này?')) {
      setBanners(banners.filter(b => b.id !== bannerId));
      toast.success('Đã gỡ banner thành công!');
    }
  };

  const handleSaveBanner = () => {
    const finalImageUrl = bannerImagePreview || bannerFormData.imageUrl;
    
    if (!bannerFormData.title || !finalImageUrl) {
      toast.error('Vui lòng điền đầy đủ tiêu đề và hình ảnh!');
      return;
    }

    const bannerData = {
      title: bannerFormData.title,
      description: bannerFormData.description,
      imageUrl: finalImageUrl,
      linkUrl: bannerFormData.linkUrl,
      position: bannerFormData.position,
      displayOrder: parseInt(bannerFormData.displayOrder) || 1,
      startDate: bannerFormData.startDate ? `${bannerFormData.startDate}T00:00:00Z` : undefined,
      endDate: bannerFormData.endDate ? `${bannerFormData.endDate}T23:59:59Z` : undefined,
      active: bannerFormData.active
    };

    if (editingBanner) {
      // Update
      setBanners(banners.map(b => 
        b.id === editingBanner.id 
          ? { ...b, ...bannerData }
          : b
      ));
      toast.success('Đã cập nhật banner thành công!');
    } else {
      // Create
      const newBanner: Banner = {
        id: Date.now().toString(),
        ...bannerData,
        createdAt: new Date().toISOString()
      };
      setBanners([...banners, newBanner]);
      toast.success('Đã thêm banner thành công!');
    }

    setIsBannerModalOpen(false);
  };

  const handleCloseBannerModal = () => {
    setIsBannerModalOpen(false);
    setEditingBanner(null);
  };

  const handleToggleBannerStatus = (bannerId: string) => {
    setBanners(banners.map(b => 
      b.id === bannerId 
        ? { ...b, active: !b.active }
        : b
    ));
    toast.success('Đã cập nhật trạng thái banner!');
  };

  // === Brand CRUD handlers ===
  const handleAddBrand = () => {
    setEditingBrand(null);
    setBrandFormData({
      name: '',
      logoUrl: ''
    });
    setBrandLogoPreview('');
    setIsBrandModalOpen(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setBrandFormData({
      name: brand.name,
      logoUrl: brand.logoUrl || ''
    });
    setBrandLogoPreview(brand.logoUrl || '');
    setIsBrandModalOpen(true);
  };

  const handleDeleteBrand = (brandId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thương hiệu này?')) {
      setBrands(brands.filter(b => b.id !== brandId));
      toast.success('Đã xóa thương hiệu thành công!');
    }
  };

  const handleSaveBrand = () => {
    if (!brandFormData.name) {
      toast.error('Vui lòng điền tên thương hiệu!');
      return;
    }

    const brandData = {
      name: brandFormData.name,
      logoUrl: brandLogoPreview || brandFormData.logoUrl
    };

    if (editingBrand) {
      // Update
      setBrands(brands.map(b => 
        b.id === editingBrand.id 
          ? { ...b, ...brandData }
          : b
      ));
      toast.success('Đã cập nhật thương hiệu thành công!');
    } else {
      // Create
      const newBrand: Brand = {
        id: Date.now().toString(),
        ...brandData,
        createdAt: new Date().toISOString(),
        productCount: 0
      };
      setBrands([...brands, newBrand]);
      toast.success('Đã thêm thương hiệu thành công!');
    }

    setIsBrandModalOpen(false);
  };

  const handleCloseBrandModal = () => {
    setIsBrandModalOpen(false);
    setEditingBrand(null);
  };

  // === Inventory CRUD handlers ===
  const handleAddInventory = () => {
    setEditingInventory(null);
    setInventoryFormData({
      productId: '',
      productName: '',
      productSku: '',
      onHand: '0',
      reserved: '0'
    });
    setIsInventoryModalOpen(true);
  };

  const handleEditInventory = (inventory: Inventory) => {
    setEditingInventory(inventory);
    setInventoryFormData({
      productId: inventory.productId,
      productName: inventory.productName || '',
      productSku: inventory.productSku || '',
      onHand: inventory.onHand.toString(),
      reserved: inventory.reserved.toString()
    });
    setIsInventoryModalOpen(true);
  };

  const handleDeleteInventory = (inventoryId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi tồn kho này?')) {
      setInventories(inventories.filter(inv => inv.id !== inventoryId));
      toast.success('Đã xóa bản ghi tồn kho thành công!');
    }
  };

  const handleSaveInventory = () => {
    // Validate
    if (!inventoryFormData.productId || !inventoryFormData.onHand) {
      toast.error('Vui lòng điền đầy đủ thông tin sản phẩm và số lượng tồn kho!');
      return;
    }

    const onHand = parseInt(inventoryFormData.onHand);
    const reserved = parseInt(inventoryFormData.reserved);

    if (onHand < 0 || reserved < 0) {
      toast.error('Số lượng không được âm!');
      return;
    }

    if (onHand < reserved) {
      toast.error('Số lượng tồn kho (onHand) phải >= số lượng giữ chỗ (reserved)!');
      return;
    }

    const inventoryData = {
      productId: inventoryFormData.productId,
      productName: inventoryFormData.productName,
      productSku: inventoryFormData.productSku,
      onHand,
      reserved
    };

    if (editingInventory) {
      // Update
      setInventories(inventories.map(inv => 
        inv.id === editingInventory.id 
          ? { ...inv, ...inventoryData }
          : inv
      ));
      toast.success('Đã cập nhật tồn kho thành công!');
    } else {
      // Create
      const newInventory: Inventory = {
        id: Date.now().toString(),
        ...inventoryData
      };
      setInventories([newInventory, ...inventories]);
      toast.success('Đã tạo bản ghi tồn kho thành công!');
    }

    setIsInventoryModalOpen(false);
  };

  const handleCloseInventoryModal = () => {
    setIsInventoryModalOpen(false);
    setEditingInventory(null);
  };

  // === Inventory operations (reserve/release stock) ===
  const handleReserveStock = (inventoryId: string, quantity: number) => {
    const inventory = inventories.find(inv => inv.id === inventoryId);
    if (!inventory) return;

    const available = inventory.onHand - inventory.reserved;
    if (available < quantity) {
      toast.error(`Không đủ hàng để giữ chỗ! Còn lại: ${available}`);
      return;
    }

    setInventories(inventories.map(inv =>
      inv.id === inventoryId
        ? { ...inv, reserved: inv.reserved + quantity }
        : inv
    ));
    toast.success(`Đã giữ chỗ ${quantity} sản phẩm`);
  };

  const handleReleaseStock = (inventoryId: string, quantity: number) => {
    const inventory = inventories.find(inv => inv.id === inventoryId);
    if (!inventory) return;

    if (inventory.reserved < quantity) {
      toast.error(`Số lượng hủy giữ chỗ vượt quá số đang giữ! Đang giữ: ${inventory.reserved}`);
      return;
    }

    setInventories(inventories.map(inv =>
      inv.id === inventoryId
        ? { ...inv, reserved: inv.reserved - quantity }
        : inv
    ));
    toast.success(`Đã hủy giữ chỗ ${quantity} sản phẩm`);
  };

  const handleIncreaseStock = (inventoryId: string, quantity: number) => {
    if (quantity <= 0) {
      toast.error('Số lượng nhập phải lớn hơn 0');
      return;
    }

    setInventories(inventories.map(inv =>
      inv.id === inventoryId
        ? { ...inv, onHand: inv.onHand + quantity }
        : inv
    ));
    toast.success(`Đã nhập ${quantity} sản phẩm vào kho`);
  };

  const handleDecreaseStock = (inventoryId: string, quantity: number) => {
    const inventory = inventories.find(inv => inv.id === inventoryId);
    if (!inventory) return;

    if (quantity <= 0) {
      toast.error('Số lượng xuất phải lớn hơn 0');
      return;
    }

    if (inventory.onHand < quantity) {
      toast.error(`Không đủ hàng để xuất! Tồn kho: ${inventory.onHand}`);
      return;
    }

    setInventories(inventories.map(inv =>
      inv.id === inventoryId
        ? { ...inv, onHand: inv.onHand - quantity }
        : inv
    ));
    toast.success(`Đã xuất ${quantity} sản phẩm khỏi kho`);
  };

  // Render Analytics Tab
  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Header with Report Button */}
      <div className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Báo cáo thống kê</h2>
            <p className="text-purple-100">Theo dõi hiệu suất kinh doanh và phân tích dữ liệu</p>
          </div>
          <button
            onClick={handleGenerateReport}
            className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-semibold shadow-lg"
          >
            <Download className="h-5 w-5" />
            Tạo báo cáo
          </button>
        </div>

        {/* Report Period Selector */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <label className="block text-white font-medium mb-3">
            <Calendar className="h-4 w-4 inline mr-2" />
            Chọn kỳ báo cáo:
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <button
              onClick={() => setReportPeriod('today')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                reportPeriod === 'today'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={() => setReportPeriod('yesterday')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                reportPeriod === 'yesterday'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Hôm qua
            </button>
            <button
              onClick={() => setReportPeriod('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                reportPeriod === 'week'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Tuần này
            </button>
            <button
              onClick={() => setReportPeriod('last-week')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                reportPeriod === 'last-week'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Tuần trước
            </button>
            <button
              onClick={() => setReportPeriod('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                reportPeriod === 'month'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Tháng này
            </button>
            <button
              onClick={() => setReportPeriod('last-month')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                reportPeriod === 'last-month'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Tháng trước
            </button>
            <button
              onClick={() => setReportPeriod('quarter')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                reportPeriod === 'quarter'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Quý này
            </button>
            <button
              onClick={() => setReportPeriod('year')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                reportPeriod === 'year'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Năm nay
            </button>
            <button
              onClick={() => setReportPeriod('last-year')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                reportPeriod === 'last-year'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Năm trước
            </button>
            <button
              onClick={() => setReportPeriod('custom')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                reportPeriod === 'custom'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Tùy chỉnh
            </button>
          </div>

          {/* Custom Date Range */}
          {reportPeriod === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-white/20 rounded-lg">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Từ ngày:
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-4 py-2 bg-white text-gray-800 rounded-lg border-none focus:ring-2 focus:ring-purple-300"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Đến ngày:
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-4 py-2 bg-white text-gray-800 rounded-lg border-none focus:ring-2 focus:ring-purple-300"
                />
              </div>
            </div>
          )}

          {/* Current Selection Display */}
          <div className="mt-4 p-3 bg-white/10 rounded-lg">
            <p className="text-white text-sm">
              <strong>Kỳ báo cáo đã chọn:</strong> {getReportPeriodName()}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Tổng doanh thu</h3>
            <TrendingUp className="h-8 w-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold mb-2">
            {formatCurrency(revenueData.reduce((sum, item) => sum + item.revenue, 0))}
          </p>
          <p className="text-green-100 text-sm">
            {revenueData.reduce((sum, item) => sum + item.orders, 0)} đơn hàng
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Tồn kho</h3>
            <Package className="h-8 w-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold mb-2">
            {inventoryData.reduce((sum, item) => sum + item.stock, 0)} SP
          </p>
          <p className="text-blue-100 text-sm">
            {inventoryData.reduce((sum, item) => sum + item.lowStock, 0)} sắp hết • {' '}
            {inventoryData.reduce((sum, item) => sum + item.outOfStock, 0)} hết hàng
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Lượng truy cập</h3>
            <Eye className="h-8 w-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold mb-2">
            {trafficData.reduce((sum, item) => sum + item.visits, 0).toLocaleString()}
          </p>
          <p className="text-purple-100 text-sm">
            {trafficData.reduce((sum, item) => sum + item.newUsers, 0).toLocaleString()} người dùng mới
          </p>
        </motion.div>
      </div>

      {/* Charts Row 1: Revenue & Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Doanh thu theo tháng</h3>
            <span className="text-sm text-gray-500">VNĐ</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8b5cf6" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Đơn hàng theo tháng</h3>
            <span className="text-sm text-gray-500">Đơn</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="orders" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2: Inventory & Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tồn kho theo danh mục</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inventoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="category" type="category" stroke="#6b7280" width={100} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="stock" fill="#10b981" name="Còn hàng" radius={[0, 4, 4, 0]} />
              <Bar dataKey="lowStock" fill="#f59e0b" name="Sắp hết" radius={[0, 4, 4, 0]} />
              <Bar dataKey="outOfStock" fill="#ef4444" name="Hết hàng" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Traffic Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Lượng truy cập tuần</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="visits" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="Lượt truy cập"
                dot={{ fill: '#8b5cf6', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="newUsers" 
                stroke="#06b6d4" 
                strokeWidth={2}
                name="Người dùng mới"
                dot={{ fill: '#06b6d4', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="pageViews" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Trang xem"
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 3: Price Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Phân phối sản phẩm theo giá</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priceDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ range, value }) => `${range}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {priceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Price Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Số lượng sản phẩm theo mức giá</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priceDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="range" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]}>
                {priceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Export Info */}
      <div className="bg-gradient-to-r from-cyan-50 to-purple-50 border border-cyan-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <FileText className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Xuất báo cáo Excel chi tiết</h3>
            <p className="text-gray-600 mb-4">
              Tạo báo cáo chi tiết dưới dạng file Excel (.xlsx) với nhiều trang tính bao gồm:
              <strong> Tổng quan, Doanh thu, Tồn kho, Lượng truy cập, Phân phối giá, Sản phẩm, Người dùng</strong>.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                <Calendar className="h-4 w-4 inline mr-1" />
                Kỳ báo cáo: <strong>{getReportPeriodName()}</strong>
              </span>
              <span className="text-sm text-green-600 font-medium">
                📊 7 sheets trong 1 file Excel
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng khách hàng</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <Package className="h-6 w-6 text-cyan-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-2 bg-pink-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-pink-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Doanh thu</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Package className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Phiếu hỗ trợ</p>
              <p className="text-2xl font-bold text-gray-900">{tickets.filter(t => t.status !== 'CLOSED').length}/{tickets.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Đơn hàng gần đây</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đặt
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h2>
        <button 
          onClick={handleAddProduct}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Bộ lọc
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hình ảnh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tồn kho
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const firstImage = product.mediaAssets?.[0]?.url || product.image;
                return (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {firstImage && (
                        <img 
                          src={firstImage} 
                          alt={product.name}
                          className="h-12 w-12 rounded object-cover border border-gray-200"
                        />
                      )}
                      {!firstImage && (
                        <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                          No img
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      {product.mediaAssets && product.mediaAssets.length > 1 && (
                        <div className="text-xs text-gray-500 mt-1">
                          +{product.mediaAssets.length - 1} ảnh
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.categoryName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPrice(product.listedPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.active ? 'Hoạt động' : 'Ngừng bán'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewProduct(product)}
                          className="text-cyan-600 hover:text-cyan-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      <button 
                        onClick={() => handleEditProduct(product)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h2>
        <button 
          onClick={handleAddCategory}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Thêm danh mục
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm danh mục..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hình ảnh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {category.imageUrl ? (
                      <img 
                        src={category.imageUrl} 
                        alt={category.name}
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 line-clamp-2">{category.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {category.productCount} sản phẩm
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleToggleCategoryStatus(category.id)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        category.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {category.active ? 'Hoạt động' : 'Tạm dừng'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEditCategory(category)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBrands = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý thương hiệu</h2>
        <button 
          onClick={handleAddBrand}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Thêm thương hiệu
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm thương hiệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Logo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên thương hiệu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {brands.map((brand) => (
                <tr key={brand.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {brand.logoUrl ? (
                      <img 
                        src={brand.logoUrl} 
                        alt={brand.name}
                        className="h-12 w-12 rounded object-contain bg-gray-50"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center">
                        <Tag className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {brand.productCount || 0} sản phẩm
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {brand.createdAt && new Date(brand.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEditBrand(brand)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteBrand(brand.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý tồn kho</h2>
        <button 
          onClick={handleAddInventory}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Thêm tồn kho
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tồn kho (onHand)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đang giữ (Reserved)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khả dụng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventories.map((inventory) => {
                const available = inventory.onHand - inventory.reserved;
                const stockStatus = available <= 5 ? 'low' : available <= 20 ? 'medium' : 'good';
                
                return (
                  <tr key={inventory.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{inventory.productName}</div>
                        <div className="text-sm text-gray-500">ID: {inventory.productId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inventory.productSku || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {inventory.onHand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-semibold">
                      {inventory.reserved}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                      {available}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        stockStatus === 'good' ? 'bg-green-100 text-green-800' :
                        stockStatus === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {stockStatus === 'good' ? 'Đủ hàng' :
                         stockStatus === 'medium' ? 'Sắp hết' : 'Thiếu hàng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditInventory(inventory)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteInventory(inventory.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h2>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            Bộ lọc
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đặt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                    <div className="text-sm text-gray-500">{order.customerEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleViewOrder(order)}
                        className="text-cyan-600 hover:text-cyan-900"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditOrder(order)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h2>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            Bộ lọc
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng chi tiêu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div 
                      className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors"
                      onClick={() => handleViewUser(user)}
                    >
                      {user.avatarUrl ? (
                        <img 
                          src={user.avatarUrl} 
                          alt={user.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 hover:text-purple-600">{user.name}</div>
                        <div className="text-sm text-gray-500 hover:text-purple-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.phone || '-'}</div>
                    <div className="text-sm text-gray-500">
                      {user.addresses && user.addresses.length > 0 
                        ? `${user.addresses.length} địa chỉ` 
                        : 'Chưa có địa chỉ'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                      user.provider === 'local' ? 'bg-gray-100 text-gray-800' :
                      user.provider === 'google' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {user.provider === 'local' ? '📧 Local' :
                       user.provider === 'google' ? '🔵 Google' :
                       '📘 Facebook'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.totalOrders || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.totalSpent ? formatPrice(user.totalSpent) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.enabled ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleViewUser(user)}
                        className="text-cyan-600 hover:text-cyan-900"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleUserStatus(user.id)}
                        className={`${user.enabled ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        title={user.enabled ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                      >
                        {user.enabled ? (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderArticles = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý bài viết & tin tức</h2>
        <button 
          onClick={handleAddArticle}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Thêm bài viết
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Bộ lọc
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiêu đề
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tác giả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đăng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {articles.map((article) => (
                <tr key={article.id}>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{article.title}</div>
                      <div className="text-sm text-gray-500">
                        {article.summary ? article.summary.substring(0, 60) + '...' : 'Không có tóm tắt'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {article.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {article.adminName || 'Admin'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      article.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {article.active ? 'Kích hoạt' : 'Không kích hoạt'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('vi-VN') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEditArticle(article)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteArticle(article.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBanners = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý banner</h2>
        <button 
          onClick={handleAddBanner}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Thêm banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <img src={banner.imageUrl} alt={banner.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{banner.title}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  banner.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {banner.active ? 'Hoạt động' : 'Tắt'}
                </span>
              </div>
              {banner.description && (
                <p className="text-sm text-gray-600 mb-2">{banner.description}</p>
              )}
              <div className="space-y-1 text-sm text-gray-500">
                <p><strong>Vị trí:</strong> {
                  banner.position === 'HOME_HERO' ? 'Trang chủ - Hero' :
                  banner.position === 'HOME_SECONDARY' ? 'Trang chủ - Phụ' :
                  banner.position === 'PRODUCT_PAGE' ? 'Trang sản phẩm' : 'Sidebar'
                }</p>
                <p><strong>Thứ tự:</strong> {banner.displayOrder}</p>
                {banner.startDate && (
                  <p><strong>Thời gian:</strong> {new Date(banner.startDate).toLocaleDateString('vi-VN')} 
                  {banner.endDate && ` - ${new Date(banner.endDate).toLocaleDateString('vi-VN')}`}</p>
                )}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button 
                  onClick={() => handleEditBanner(banner)}
                  className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Sửa
                </button>
                <button 
                  onClick={() => handleToggleBannerStatus(banner.id)}
                  className={`flex-1 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    banner.active 
                      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  {banner.active ? 'Tắt' : 'Bật'}
                </button>
                <button 
                  onClick={() => handleDeleteBanner(banner.id)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  title="Gỡ banner"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTickets = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý phiếu hỗ trợ</h2>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Tìm kiếm phiếu hỗ trợ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            Bộ lọc
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiêu đề
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chủ đề
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người gửi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr 
                  key={ticket.id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleViewTicket(ticket)}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                    <div className="text-sm text-gray-500 line-clamp-2">{ticket.content}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                      {ticket.subject}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{ticket.userName}</div>
                    <div className="text-sm text-gray-500">{ticket.userEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTicketStatusColor(ticket.status)}`}>
                      {getTicketStatusText(ticket.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(ticket.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleViewTicket(ticket)}
                        className="text-purple-600 hover:text-purple-900 p-1 hover:bg-purple-50 rounded transition-colors"
                        title="Xem chi tiết & Trả lời"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      {ticket.status !== 'CLOSED' && (
                        <select
                          value={ticket.status}
                          onChange={(e) => handleUpdateTicketStatus(ticket.id, e.target.value as SupportTicket['status'])}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="OPEN">Mới</option>
                          <option value="IN_PROGRESS">Đang xử lý</option>
                          <option value="RESOLVED">Đã giải quyết</option>
                          <option value="CLOSED">Đóng</option>
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPromotions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý khuyến mãi</h2>
        <button 
          onClick={handleAddPromotion}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Thêm khuyến mãi
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm khuyến mãi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Bộ lọc
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên khuyến mãi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại / Giá trị
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn tối thiểu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sử dụng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {promotions.map((promotion) => (
                <tr key={promotion.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono font-bold text-purple-600">{promotion.code}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{promotion.name}</div>
                    <div className="text-sm text-gray-500">{promotion.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {promotion.discountType === 'PERCENT' 
                        ? `${promotion.discountValue}%` 
                        : promotion.discountType === 'FREE_SHIP'
                        ? 'Miễn phí ship'
                        : formatPrice(promotion.discountValue)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {promotion.discountType === 'PERCENT' ? 'Phần trăm' : 
                       promotion.discountType === 'FREE_SHIP' ? 'Miễn phí vận chuyển' : 'Cố định'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {promotion.minOrderValue ? formatPrice(promotion.minOrderValue) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{new Date(promotion.startAt).toLocaleDateString('vi-VN')}</div>
                    <div>{new Date(promotion.endAt).toLocaleDateString('vi-VN')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{promotion.used} / {promotion.maxUsage || '∞'}</div>
                    {promotion.perUserLimit && (
                      <div className="text-xs text-gray-500">Mỗi user: {promotion.perUserLimit}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPromotionStatusColor(promotion)}`}>
                      {getPromotionStatusText(promotion)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEditPromotion(promotion)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeletePromotion(promotion.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {!isPromotionExpired(promotion.endAt) && (
                        <button 
                          onClick={() => handleTogglePromotionStatus(promotion.id)}
                          className={`${promotion.active ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                          title={promotion.active ? 'Tắt kích hoạt' : 'Kích hoạt'}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-800">Quản trị hệ thống</h1>
          <p className="text-gray-600 mt-2">Quản lý sản phẩm, đơn hàng và khách hàng</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {[
              { id: 'dashboard', name: 'Tổng quan', icon: TrendingUp },
              { id: 'analytics', name: 'Thống kê', icon: BarChart3 },
              { id: 'products', name: 'Sản phẩm', icon: Package },
              { id: 'categories', name: 'Danh mục', icon: Package },
              { id: 'brands', name: 'Thương hiệu', icon: Tag },
              { id: 'inventory', name: 'Tồn kho', icon: Package },
              { id: 'orders', name: 'Đơn hàng', icon: ShoppingCart },
              { id: 'promotions', name: 'Khuyến mãi', icon: Package },
              { id: 'users', name: 'Người dùng', icon: Users },
              { id: 'articles', name: 'Bài viết', icon: Package },
              { id: 'banners', name: 'Banner', icon: Package },
              { id: 'tickets', name: 'Hỗ trợ', icon: Package }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'products' && renderProducts()}
        {activeTab === 'categories' && renderCategories()}
        {activeTab === 'brands' && renderBrands()}
        {activeTab === 'inventory' && renderInventory()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'promotions' && renderPromotions()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'articles' && renderArticles()}
        {activeTab === 'banners' && renderBanners()}
        {activeTab === 'tickets' && renderTickets()}
      </main>

      <Footer />

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã SKU *
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="VD: CAM-WIFI-4K-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên sản phẩm *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nhập tên sản phẩm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá niêm yết (VND) *
                  </label>
                  <input
                    type="number"
                    value={formData.listedPrice}
                    onChange={(e) => setFormData({...formData, listedPrice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nhập giá sản phẩm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => {
                      const selectedCategory = categories.find(c => c.id === e.target.value);
                      setFormData({
                        ...formData, 
                        categoryId: e.target.value,
                        categoryName: selectedCategory?.name || ''
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.filter(c => c.active).map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thương hiệu
                  </label>
                  <input
                    type="text"
                    value={formData.brandName}
                    onChange={(e) => setFormData({...formData, brandName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="VD: Hikvision, Samsung..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giảm giá (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData({...formData, discount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nhập % giảm giá (0-100)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tồn kho
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nhập số lượng tồn kho"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({...formData, active: e.target.checked})}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Sản phẩm đang hoạt động
                    </span>
                  </label>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hình ảnh sản phẩm
                  </label>
                  
                  {/* Upload Button */}
                  <div className="mb-4">
                    <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
                      <Upload className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">Chọn ảnh từ máy tính</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">Hỗ trợ: JPG, PNG, GIF. Có thể chọn nhiều ảnh.</p>
                  </div>

                  {/* Image Previews */}
                  {productImagePreviews.length > 0 ? (
                    <div className="grid grid-cols-4 gap-3">
                      {productImagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded">
                            Ảnh {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <Package className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Chưa có ảnh nào được chọn</p>
                    </div>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả ngắn
                  </label>
                  <textarea
                    value={formData.shortDesc}
                    onChange={(e) => setFormData({...formData, shortDesc: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={2}
                    placeholder="Nhập mô tả ngắn (tối đa 500 ký tự)"
                    maxLength={500}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả chi tiết
                  </label>
                  <textarea
                    value={formData.longDesc}
                    onChange={(e) => setFormData({...formData, longDesc: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={4}
                    placeholder="Nhập mô tả chi tiết sản phẩm (tối đa 5000 ký tự)"
                    maxLength={5000}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveProduct}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingProduct ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {viewingOrder ? 'Chi tiết đơn hàng' : 'Chỉnh sửa đơn hàng'}
              </h3>
              <button onClick={handleCloseOrderModal} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            {(viewingOrder || editingOrder) && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã đơn hàng
                    </label>
                    <p className="text-sm text-gray-900">{viewingOrder?.id || editingOrder?.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày đặt
                    </label>
                    <p className="text-sm text-gray-900">
                      {new Date(viewingOrder?.date || editingOrder?.date || '').toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên khách hàng
                    </label>
                    <p className="text-sm text-gray-900">{viewingOrder?.customerName || editingOrder?.customerName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-sm text-gray-900">{viewingOrder?.customerEmail || editingOrder?.customerEmail}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <p className="text-sm text-gray-900">{viewingOrder?.customerPhone || editingOrder?.customerPhone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phương thức thanh toán
                    </label>
                    <p className="text-sm text-gray-900">{viewingOrder?.paymentMethod || editingOrder?.paymentMethod}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ giao hàng
                  </label>
                  <p className="text-sm text-gray-900">{viewingOrder?.shippingAddress || editingOrder?.shippingAddress}</p>
                </div>

                {editingOrder ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <select
                      value={editingOrder.status}
                      onChange={(e) => handleUpdateOrderStatus(editingOrder.id, e.target.value as Order['status'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="pending">Chờ xử lý</option>
                      <option value="processing">Đang xử lý</option>
                      <option value="shipped">Đã giao</option>
                      <option value="delivered">Đã nhận</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(viewingOrder?.status || 'pending')}`}>
                      {getStatusText(viewingOrder?.status || 'pending')}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sản phẩm đã đặt
                  </label>
                  <div className="space-y-2">
                    {(viewingOrder?.items || editingOrder?.items || []).map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Tổng tiền:</span>
                    <span className="text-purple-600">{formatPrice(viewingOrder?.total || editingOrder?.total || 0)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseOrderModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Đóng
              </button>
              {editingOrder && (
                <button
                  onClick={() => handleUpdateOrderStatus(editingOrder.id, editingOrder.status)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Cập nhật
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {viewingUser ? 'Chi tiết người dùng' : 'Cập nhật thông tin người dùng'}
              </h3>
              <button onClick={handleCloseUserModal} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            {viewingUser ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID
                    </label>
                    <p className="text-sm text-gray-900">{viewingUser.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vai trò
                    </label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      viewingUser.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {viewingUser.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên người dùng
                    </label>
                    <p className="text-sm text-gray-900">{viewingUser.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-sm text-gray-900">{viewingUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <p className="text-sm text-gray-900">{viewingUser.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Provider
                    </label>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                      viewingUser.provider === 'local' ? 'bg-gray-100 text-gray-800' :
                      viewingUser.provider === 'google' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {viewingUser.provider === 'local' ? '📧 Local' :
                       viewingUser.provider === 'google' ? '🔵 Google' :
                       '📘 Facebook'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      viewingUser.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {viewingUser.enabled ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Avatar
                    </label>
                    {viewingUser.avatarUrl ? (
                      <img 
                        src={viewingUser.avatarUrl} 
                        alt={viewingUser.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-gray-500">Chưa có</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ ({viewingUser.addresses?.length || 0})
                  </label>
                  {viewingUser.addresses && viewingUser.addresses.length > 0 ? (
                    <div className="space-y-2">
                      {viewingUser.addresses.map((addr) => (
                        <div key={addr.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-sm text-gray-900">{addr.name} - {addr.phone}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {addr.street}, {addr.ward}, {addr.province}
                              </p>
                            </div>
                            {addr.isDefault && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Mặc định
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Chưa có địa chỉ</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày tạo tài khoản
                    </label>
                    <p className="text-sm text-gray-900">
                      {new Date(viewingUser.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cập nhật lần cuối
                    </label>
                    <p className="text-sm text-gray-900">
                      {new Date(viewingUser.updatedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tổng số đơn hàng
                    </label>
                    <p className="text-sm text-gray-900">{viewingUser.totalOrders || 0}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tổng chi tiêu
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewingUser.totalSpent ? formatPrice(viewingUser.totalSpent) : '-'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nhập email"
                    disabled={!!editingUser}
                  />
                  {editingUser && (
                    <p className="text-xs text-gray-500 mt-1">Không thể thay đổi email</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên người dùng *
                  </label>
                  <input
                    type="text"
                    value={userFormData.name}
                    onChange={(e) => setUserFormData({...userFormData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nhập tên người dùng"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={userFormData.phone}
                      onChange={(e) => setUserFormData({...userFormData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vai trò
                    </label>
                    <select
                      value={userFormData.role}
                      onChange={(e) => setUserFormData({...userFormData, role: e.target.value as 'USER' | 'ADMIN'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="USER">Người dùng</option>
                      <option value="ADMIN">Quản trị viên</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avatar
                  </label>
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Chọn ảnh avatar</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUserAvatarUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Hỗ trợ: JPG, PNG, GIF</p>
                  
                  {userAvatarPreview && (
                    <div className="mt-3 relative inline-block">
                      <img 
                        src={userAvatarPreview} 
                        alt="Avatar Preview"
                        className="h-24 w-24 rounded-full object-cover border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => setUserAvatarPreview('')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provider
                  </label>
                  <select
                    value={userFormData.provider}
                    onChange={(e) => setUserFormData({...userFormData, provider: e.target.value as 'local' | 'google' | 'facebook'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="local">Local (Email/Password)</option>
                    <option value="google">Google OAuth</option>
                    <option value="facebook">Facebook OAuth</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseUserModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {viewingUser ? 'Đóng' : 'Hủy'}
              </button>
              {editingUser && (
                <button
                  onClick={handleSaveUser}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Cập nhật
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Support Ticket Modal */}
      {isTicketModalOpen && viewingTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Chi tiết phiếu hỗ trợ</h3>
              <button onClick={handleCloseTicketModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Ticket Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">{viewingTicket.title}</h4>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {viewingTicket.userName}
                      </span>
                      <span>•</span>
                      <span>{viewingTicket.userEmail}</span>
                      <span>•</span>
                      <span>{new Date(viewingTicket.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getTicketStatusColor(viewingTicket.status)}`}>
                    {getTicketStatusText(viewingTicket.status)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-500 uppercase">Chủ đề:</span>
                    <span className="text-sm font-medium text-gray-900">{viewingTicket.subject}</span>
                  </div>
                </div>
              </div>

              {/* Ticket Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Nội dung yêu cầu chi tiết
                  </span>
                </label>
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 min-h-[120px]">
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{viewingTicket.content}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Gửi lúc: {new Date(viewingTicket.createdAt).toLocaleString('vi-VN', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>

              {/* Status Update */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cập nhật trạng thái
                </label>
                <select
                  value={viewingTicket.status}
                  onChange={(e) => handleUpdateTicketStatus(viewingTicket.id, e.target.value as SupportTicket['status'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={viewingTicket.status === 'CLOSED'}
                >
                  <option value="OPEN">Mới</option>
                  <option value="IN_PROGRESS">Đang xử lý</option>
                  <option value="RESOLVED">Đã giải quyết</option>
                  <option value="CLOSED">Đã đóng</option>
                </select>
              </div>

              {/* Response Section */}
              {viewingTicket.status !== 'CLOSED' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trả lời khách hàng
                  </label>
                  <textarea
                    value={ticketResponse}
                    onChange={(e) => setTicketResponse(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={5}
                    placeholder="Nhập nội dung trả lời cho khách hàng..."
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={handleSendResponse}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Gửi phản hồi
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseTicketModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Article Modal */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingArticle ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
              </h3>
              <button onClick={handleCloseArticleModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  value={articleFormData.title}
                  onChange={(e) => setArticleFormData({...articleFormData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập tiêu đề bài viết"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL thân thiện)
                </label>
                <input
                  type="text"
                  value={articleFormData.slug}
                  onChange={(e) => setArticleFormData({...articleFormData, slug: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Để trống để tự động tạo từ tiêu đề (chữ thường, số, dấu gạch ngang)"
                />
                <p className="text-xs text-gray-500 mt-1">Chỉ chứa chữ thường, số và dấu gạch ngang. VD: bai-viet-mau</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tóm tắt (Tối đa 1000 ký tự)
                </label>
                <textarea
                  value={articleFormData.summary}
                  onChange={(e) => setArticleFormData({...articleFormData, summary: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  maxLength={1000}
                  placeholder="Nhập tóm tắt ngắn gọn về bài viết"
                />
                <p className="text-xs text-gray-500 mt-1">{articleFormData.summary.length}/1000 ký tự</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung * (Tối thiểu 20 ký tự)
                </label>
                <textarea
                  value={articleFormData.content}
                  onChange={(e) => setArticleFormData({...articleFormData, content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={8}
                  placeholder="Nhập nội dung bài viết (ít nhất 20 ký tự)"
                />
                <p className="text-xs text-gray-500 mt-1">{articleFormData.content.length} ký tự</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tác giả/Admin
                  </label>
                  <input
                    type="text"
                    value={articleFormData.adminName}
                    onChange={(e) => setArticleFormData({...articleFormData, adminName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Tên tác giả"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={articleFormData.active}
                      onChange={(e) => setArticleFormData({...articleFormData, active: e.target.checked})}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Kích hoạt bài viết</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseArticleModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveArticle}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingArticle ? 'Cập nhật' : 'Tạo bài viết'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingBanner ? 'Chỉnh sửa banner' : 'Thêm banner mới'}
              </h3>
              <button onClick={handleCloseBannerModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  value={bannerFormData.title}
                  onChange={(e) => setBannerFormData({...bannerFormData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập tiêu đề banner"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình ảnh Banner *
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Chọn ảnh banner</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerImageUpload}
                      className="hidden"
                    />
                  </label>
                  {bannerImagePreview && (
                    <div className="relative">
                      <img 
                        src={bannerImagePreview} 
                        alt="Banner preview" 
                        className="h-16 w-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => setBannerImagePreview('')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={bannerFormData.description}
                  onChange={(e) => setBannerFormData({...bannerFormData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={2}
                  placeholder="Nhập mô tả banner"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL liên kết
                </label>
                <input
                  type="text"
                  value={bannerFormData.linkUrl}
                  onChange={(e) => setBannerFormData({...bannerFormData, linkUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="/products hoặc https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vị trí hiển thị
                  </label>
                  <select
                    value={bannerFormData.position}
                    onChange={(e) => setBannerFormData({...bannerFormData, position: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="HOME_HERO">Trang chủ - Hero</option>
                    <option value="HOME_SECONDARY">Trang chủ - Phụ</option>
                    <option value="PRODUCT_PAGE">Trang sản phẩm</option>
                    <option value="SIDEBAR">Sidebar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thứ tự hiển thị
                  </label>
                  <input
                    type="number"
                    value={bannerFormData.displayOrder}
                    onChange={(e) => setBannerFormData({...bannerFormData, displayOrder: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="1, 2, 3..."
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    value={bannerFormData.startDate}
                    onChange={(e) => setBannerFormData({...bannerFormData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    value={bannerFormData.endDate}
                    onChange={(e) => setBannerFormData({...bannerFormData, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="bannerActive"
                  checked={bannerFormData.active}
                  onChange={(e) => setBannerFormData({...bannerFormData, active: e.target.checked})}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="bannerActive" className="ml-2 text-sm text-gray-700">
                  Hiển thị banner
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseBannerModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveBanner}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingBanner ? 'Cập nhật' : 'Tạo banner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promotion Modal */}
      {isPromotionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingPromotion ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
              </h3>
              <button onClick={handleClosePromotionModal} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã khuyến mãi * <span className="text-xs text-gray-500">(Viết hoa, không dấu, không khoảng trắng)</span>
                </label>
                <input
                  type="text"
                  value={promotionFormData.code}
                  onChange={(e) => setPromotionFormData({...promotionFormData, code: e.target.value.toUpperCase().replace(/\s/g, '')})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                  placeholder="VD: SUMMER2025"
                  disabled={!!editingPromotion}
                />
                {editingPromotion && (
                  <p className="text-xs text-gray-500 mt-1">Không thể thay đổi mã khuyến mãi</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên khuyến mãi *
                </label>
                <input
                  type="text"
                  value={promotionFormData.name}
                  onChange={(e) => setPromotionFormData({...promotionFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập tên khuyến mãi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={promotionFormData.description}
                  onChange={(e) => setPromotionFormData({...promotionFormData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Nhập mô tả khuyến mãi"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại giảm giá *
                  </label>
                  <select
                    value={promotionFormData.discountType}
                    onChange={(e) => setPromotionFormData({...promotionFormData, discountType: e.target.value as 'PERCENT' | 'FIXED_AMOUNT' | 'FREE_SHIP'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="PERCENT">Phần trăm (%)</option>
                    <option value="FIXED_AMOUNT">Cố định (VND)</option>
                    <option value="FREE_SHIP">Miễn phí vận chuyển</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá trị giảm {promotionFormData.discountType !== 'FREE_SHIP' && '*'}
                  </label>
                  <input
                    type="number"
                    value={promotionFormData.discountValue}
                    onChange={(e) => setPromotionFormData({...promotionFormData, discountValue: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={
                      promotionFormData.discountType === 'PERCENT' ? 'Nhập % (0-100)' : 
                      promotionFormData.discountType === 'FREE_SHIP' ? 'Không cần giá trị (để 0)' :
                      'Nhập số tiền'
                    }
                    min="0"
                    max={promotionFormData.discountType === 'PERCENT' ? '100' : undefined}
                    disabled={promotionFormData.discountType === 'FREE_SHIP'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="date"
                    value={promotionFormData.startAt}
                    onChange={(e) => setPromotionFormData({...promotionFormData, startAt: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày kết thúc *
                  </label>
                  <input
                    type="date"
                    value={promotionFormData.endAt}
                    onChange={(e) => setPromotionFormData({...promotionFormData, endAt: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá trị đơn hàng tối thiểu (VND)
                </label>
                <input
                  type="number"
                  value={promotionFormData.minOrderValue}
                  onChange={(e) => setPromotionFormData({...promotionFormData, minOrderValue: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập giá trị đơn hàng tối thiểu"
                  min="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới hạn tổng số lần sử dụng
                  </label>
                  <input
                    type="number"
                    value={promotionFormData.maxUsage}
                    onChange={(e) => setPromotionFormData({...promotionFormData, maxUsage: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Để trống = không giới hạn"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới hạn mỗi người dùng
                  </label>
                  <input
                    type="number"
                    value={promotionFormData.perUserLimit}
                    onChange={(e) => setPromotionFormData({...promotionFormData, perUserLimit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Để trống = không giới hạn"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={promotionFormData.active}
                    onChange={(e) => setPromotionFormData({...promotionFormData, active: e.target.checked})}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Kích hoạt khuyến mãi</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleClosePromotionModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSavePromotion}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingPromotion ? 'Cập nhật' : 'Tạo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
              </h3>
              <button onClick={handleCloseCategoryModal} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên danh mục *
                </label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập tên danh mục"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh danh mục
                </label>
                <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
                  <Upload className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Chọn ảnh từ máy tính</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCategoryImageUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">Hỗ trợ: JPG, PNG, GIF</p>
                
                {categoryImagePreview && (
                  <div className="mt-3 relative inline-block">
                    <img 
                      src={categoryImagePreview} 
                      alt="Preview"
                      className="h-32 w-32 rounded-lg object-cover border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => setCategoryImagePreview('')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})}
                  rows={3}
                  maxLength={2000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập mô tả danh mục (tối đa 2000 ký tự)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {categoryFormData.description.length}/2000 ký tự
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={categoryFormData.active}
                    onChange={(e) => setCategoryFormData({...categoryFormData, active: e.target.checked})}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Kích hoạt danh mục</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseCategoryModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveCategory}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingCategory ? 'Cập nhật' : 'Tạo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand Modal */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingBrand ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu mới'}
              </h3>
              <button onClick={handleCloseBrandModal} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên thương hiệu *
                </label>
                <input
                  type="text"
                  value={brandFormData.name}
                  onChange={(e) => setBrandFormData({...brandFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập tên thương hiệu (vd: Hikvision, Dahua...)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo thương hiệu
                </label>
                <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
                  <Upload className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Chọn logo từ máy tính</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBrandLogoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">Hỗ trợ: JPG, PNG, SVG (khuyến nghị PNG trong suốt)</p>
                
                {brandLogoPreview && (
                  <div className="mt-3 relative inline-block">
                    <img 
                      src={brandLogoPreview} 
                      alt="Logo preview"
                      className="h-24 w-24 rounded-lg object-contain bg-gray-50 border-2 border-gray-300 p-2"
                    />
                    <button
                      type="button"
                      onClick={() => setBrandLogoPreview('')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseBrandModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveBrand}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingBrand ? 'Cập nhật' : 'Tạo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {isInventoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingInventory ? 'Chỉnh sửa tồn kho' : 'Thêm tồn kho mới'}
              </h3>
              <button onClick={handleCloseInventoryModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Sản phẩm *
                </label>
                <input
                  type="text"
                  value={inventoryFormData.productId}
                  onChange={(e) => setInventoryFormData({...inventoryFormData, productId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập ID sản phẩm"
                  disabled={!!editingInventory}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  value={inventoryFormData.productName}
                  onChange={(e) => setInventoryFormData({...inventoryFormData, productName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập tên sản phẩm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  value={inventoryFormData.productSku}
                  onChange={(e) => setInventoryFormData({...inventoryFormData, productSku: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập SKU sản phẩm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng tồn kho (onHand) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={inventoryFormData.onHand}
                    onChange={(e) => setInventoryFormData({...inventoryFormData, onHand: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Tổng số lượng có trong kho</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng giữ chỗ (Reserved) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={inventoryFormData.reserved}
                    onChange={(e) => setInventoryFormData({...inventoryFormData, reserved: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Số lượng đang được giữ chỗ</p>
                </div>
              </div>

              {inventoryFormData.onHand && inventoryFormData.reserved && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      Khả dụng: {parseInt(inventoryFormData.onHand) - parseInt(inventoryFormData.reserved)}
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Lưu ý:</strong> Số lượng tồn kho (onHand) phải lớn hơn hoặc bằng số lượng giữ chỗ (reserved).
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseInventoryModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveInventory}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingInventory ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Detail Modal */}

      {/* Product Detail Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Chi tiết sản phẩm</h3>
              <button onClick={handleCloseProductDetailModal} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Mã SKU</h4>
                  <p className="text-lg font-semibold text-gray-900">{viewingProduct.sku}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Tên sản phẩm</h4>
                  <p className="text-lg font-semibold text-gray-900">{viewingProduct.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Danh mục</h4>
                  <div className="flex items-center gap-2">
                    {categories.find(c => c.id === viewingProduct.categoryId)?.imageUrl && (
                      <img 
                        src={categories.find(c => c.id === viewingProduct.categoryId)?.imageUrl}
                        alt={viewingProduct.categoryName}
                        className="h-8 w-8 rounded object-cover"
                      />
                    )}
                    <p className="text-lg text-gray-900">{viewingProduct.categoryName}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Thương hiệu</h4>
                  <p className="text-lg text-gray-900">{viewingProduct.brandName || 'Chưa cập nhật'}</p>
                </div>
              </div>

              {/* Price & Discount */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Giá niêm yết</h4>
                  <p className="text-lg font-semibold text-gray-900">{formatPrice(viewingProduct.listedPrice)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Giảm giá</h4>
                  <p className="text-lg font-semibold text-orange-600">
                    {viewingProduct.discount ? `${viewingProduct.discount}%` : '0%'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Giá sau giảm</h4>
                  <p className="text-lg font-semibold text-green-600">
                    {formatPrice(viewingProduct.listedPrice * (1 - (viewingProduct.discount || 0) / 100))}
                  </p>
                </div>
              </div>

              {/* Stock & Status */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Tồn kho</h4>
                  <p className="text-lg text-gray-900">{viewingProduct.stock || 0} sản phẩm</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Đã bán</h4>
                  <p className="text-lg text-gray-900">{viewingProduct.soldCount || 0} sản phẩm</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Trạng thái</h4>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${viewingProduct.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {viewingProduct.active ? 'Hoạt động' : 'Ngừng bán'}
                  </span>
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Đánh giá</h4>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-yellow-500">{viewingProduct.rating || 0}</span>
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-gray-500 text-sm">(Chưa có đánh giá)</span>
                </div>
              </div>

              {/* Short Description */}
              {viewingProduct.shortDesc && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Mô tả ngắn</h4>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-900 leading-relaxed">{viewingProduct.shortDesc}</p>
                  </div>
                </div>
              )}

              {/* Long Description */}
              {viewingProduct.longDesc && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Mô tả chi tiết</h4>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">{viewingProduct.longDesc}</p>
                  </div>
                </div>
              )}

              {/* Media Assets Gallery */}
              {viewingProduct.mediaAssets && viewingProduct.mediaAssets.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Hình ảnh ({viewingProduct.mediaAssets.length})
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {viewingProduct.mediaAssets.map((asset) => (
                      <div key={asset.id} className="relative group">
                        <img 
                          src={asset.url} 
                          alt={asset.altText || viewingProduct.name}
                          className="w-full h-48 object-cover rounded-lg border border-gray-200 group-hover:border-purple-500 transition-colors"
                        />
                        {asset.altText && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            {asset.altText}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fallback single image (for backward compatibility) */}
              {(!viewingProduct.mediaAssets || viewingProduct.mediaAssets.length === 0) && viewingProduct.image && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Hình ảnh</h4>
                  <img 
                    src={viewingProduct.image} 
                    alt={viewingProduct.name}
                    className="w-full max-w-md rounded-lg border border-gray-200"
                  />
                </div>
              )}

              {/* Metadata */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">ID:</span> {viewingProduct.id}
                  </div>
                  {viewingProduct.createdAt && (
                    <div>
                      <span className="font-medium">Ngày tạo:</span>{' '}
                      {new Date(viewingProduct.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleCloseProductDetailModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  if (viewingProduct) {
                    handleCloseProductDetailModal();
                    handleEditProduct(viewingProduct);
                  }
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;
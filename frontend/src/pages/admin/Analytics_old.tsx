import React, { useMemo, useState } from 'react';
import { TrendingUp, Package, ShoppingCart, Users, DollarSign, AlertTriangle, CheckCircle, Clock, FileSpreadsheet, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Order, ProductSummary, UserSummary } from '../../types/types';

type Props = { data?: any };

type DateRange = 'today' | 'week' | 'month' | 'year' | 'custom';

const Analytics: React.FC<Props> = ({ data }) => {
  const orders: Order[] = data?.orders || [];
  const products: ProductSummary[] = data?.products || [];
  const users: UserSummary[] = data?.users || [];

  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Lọc đơn hàng theo khoảng thời gian
  const filteredOrders = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (dateRange) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        if (!startDate || !endDate) return orders;
        start = new Date(startDate);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        return orders;
    }

    return orders.filter((order: Order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= start && orderDate <= end;
    });
  }, [orders, dateRange, startDate, endDate]);

  const getDateRangeLabel = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return `Hôm nay (${now.toLocaleDateString('vi-VN')})`;
      case 'week':
        return 'Tuần này (7 ngày gần đây)';
      case 'month':
        return `Tháng này (${now.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })})`;
      case 'year':
        return `Năm ${now.getFullYear()}`;
      case 'custom':
        if (startDate && endDate) {
          return `${new Date(startDate).toLocaleDateString('vi-VN')} - ${new Date(endDate).toLocaleDateString('vi-VN')}`;
        }
        return 'Tùy chỉnh';
      default:
        return '';
    }
  };

  // Tính toán thống kê
  const stats = useMemo(() => {
    // Tổng doanh thu
    const totalRevenue = filteredOrders
      .filter((o: Order) => o.status === 'DELIVERED' && o.paymentStatus === 'PAID')
      .reduce((sum: number, o: Order) => sum + o.grandTotal, 0);

    // Tổng đơn hàng
    const totalOrders = filteredOrders.length;

    // Đơn hàng đang xử lý
    const pendingOrders = filteredOrders.filter((o: Order) => 
      o.status === 'PENDING' || o.status === 'WAITING_FOR_DELIVERY' || o.status === 'IN_TRANSIT'
    ).length;

    // Đơn hàng hoàn thành
    const completedOrders = filteredOrders.filter((o: Order) => o.status === 'DELIVERED').length;

    // Đơn hàng bị hủy
    const cancelledOrders = filteredOrders.filter((o: Order) => o.status === 'CANCELLED').length;

    // Giá trị đơn hàng trung bình
    const avgOrderValue = totalOrders > 0 ? totalRevenue / completedOrders : 0;

    // Tổng sản phẩm
    const totalProducts = products.length;

    // Sản phẩm còn hàng
    const inStockProducts = products.filter((p: ProductSummary) => p.inStock).length;

    // Sản phẩm hết hàng
    const outOfStockProducts = totalProducts - inStockProducts;

    // Tổng người dùng
    const totalUsers = users.length;

    // Người dùng đang hoạt động
    const activeUsers = users.filter((u: UserSummary) => u.enabled).length;

    // Tỷ lệ chuyển đổi (Số đơn hoàn thành / Tổng số người dùng) × 100
    const conversionRate = totalUsers > 0 ? (completedOrders / totalUsers * 100).toFixed(2) : 0;

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      avgOrderValue,
      totalProducts,
      inStockProducts,
      outOfStockProducts,
      totalUsers,
      activeUsers,
      conversionRate
    };
  }, [filteredOrders, products, users]);

  // Top sản phẩm bán chạy
  const topProducts = useMemo(() => {
    const productSales = products
      .sort((a: ProductSummary, b: ProductSummary) => b.reviewCount - a.reviewCount)
      .slice(0, 5);
    return productSales;
  }, [products]);

  // Đơn hàng gần đây
  const recentOrders = useMemo(() => {
    return [...filteredOrders]
      .sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }, [filteredOrders]);

  // Dữ liệu biểu đồ doanh thu theo ngày (7 ngày gần nhất)
  const revenueChartData = useMemo(() => {
    const days = 7;
    const data: Array<{ date: string; revenue: number; orders: number }> = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayOrders = filteredOrders.filter((order: Order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= date && orderDate < nextDate;
      });

      const revenue = dayOrders
        .filter((o: Order) => o.status === 'DELIVERED' && o.paymentStatus === 'PAID')
        .reduce((sum: number, o: Order) => sum + o.grandTotal, 0);

      const orderCount = dayOrders.length;

      data.push({
        date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        revenue: revenue / 1000000, // Chuyển sang triệu đồng
        orders: orderCount
      });
    }

    return data;
  }, [filteredOrders]);

  // Dữ liệu biểu đồ tròn trạng thái đơn hàng
  const orderStatusChartData = useMemo(() => {
    return [
      { name: 'Hoàn thành', value: stats.completedOrders, color: '#10b981' },
      { name: 'Đang xử lý', value: stats.pendingOrders, color: '#f59e0b' },
      { name: 'Đã hủy', value: stats.cancelledOrders, color: '#ef4444' }
    ];
  }, [stats]);

  // Dữ liệu top sản phẩm cho biểu đồ
  const topProductsChartData = useMemo(() => {
    return topProducts.slice(0, 5).map((product: ProductSummary) => ({
      name: product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name,
      reviews: product.reviewCount,
      rating: product.rating
    }));
  }, [topProducts]);

  const getOrderStatusBadge = (status: string) => {
    const config: any = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Chờ xử lý' },
      WAITING_FOR_DELIVERY: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Package, label: 'Chờ giao' },
      IN_TRANSIT: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Package, label: 'Đang giao' },
      DELIVERED: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Đã giao' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertTriangle, label: 'Đã hủy' },
    };
    const c = config[status] || config.PENDING;
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        <Icon className="w-3 h-3" />
        {c.label}
      </span>
    );
  };

  const handleExportExcel = () => {
    try {
      // Tạo workbook mới
      const wb = XLSX.utils.book_new();

      // Sheet 1: Tổng quan
      const overviewData = [
        ['BÁO CÁO THỐNG KÊ TỔNG QUAN'],
        ['Khoảng thời gian', getDateRangeLabel()],
        ['Ngày tạo báo cáo', new Date().toLocaleDateString('vi-VN')],
        [],
        ['CHỈ TIÊU', 'GIÁ TRỊ'],
        ['Tổng doanh thu', `${stats.totalRevenue.toLocaleString('vi-VN')} ₫`],
        ['Tổng đơn hàng', stats.totalOrders],
        ['Đơn đang xử lý', stats.pendingOrders],
        ['Đơn hoàn thành', stats.completedOrders],
        ['Đơn bị hủy', stats.cancelledOrders],
        ['Giá trị đơn trung bình', `${stats.avgOrderValue.toLocaleString('vi-VN')} ₫`],
        ['Tổng sản phẩm', stats.totalProducts],
        ['Sản phẩm còn hàng', stats.inStockProducts],
        ['Sản phẩm hết hàng', stats.outOfStockProducts],
        ['Tổng người dùng', stats.totalUsers],
        ['Người dùng hoạt động', stats.activeUsers],
        ['Tỷ lệ chuyển đổi', `${stats.conversionRate}%`],
      ];
      const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
      
      // Định dạng cột
      wsOverview['!cols'] = [{ wch: 30 }, { wch: 25 }];
      
      XLSX.utils.book_append_sheet(wb, wsOverview, 'Tổng quan');

      // Sheet 2: Chi tiết đơn hàng
      const ordersData = [
        ['DANH SÁCH ĐƠN HÀNG'],
        [],
        ['Mã đơn', 'Khách hàng', 'Email', 'Ngày đặt', 'Tổng tiền (₫)', 'Trạng thái', 'Thanh toán']
      ];

      recentOrders.forEach((order: Order) => {
        ordersData.push([
          order.id,
          order.user.name,
          order.user.email,
          new Date(order.createdAt).toLocaleDateString('vi-VN'),
          order.grandTotal.toLocaleString('vi-VN'),
          order.status === 'DELIVERED' ? 'Đã giao' :
          order.status === 'PENDING' ? 'Chờ xử lý' :
          order.status === 'WAITING_FOR_DELIVERY' ? 'Chờ giao' :
          order.status === 'IN_TRANSIT' ? 'Đang giao' : 'Đã hủy',
          order.paymentStatus === 'PAID' ? 'Đã thanh toán' :
          order.paymentStatus === 'FAILED' ? 'Thất bại' : 'Chưa thanh toán'
        ]);
      });

      const wsOrders = XLSX.utils.aoa_to_sheet(ordersData);
      wsOrders['!cols'] = [
        { wch: 35 }, { wch: 20 }, { wch: 25 }, { wch: 12 }, 
        { wch: 15 }, { wch: 15 }, { wch: 15 }
      ];
      
      XLSX.utils.book_append_sheet(wb, wsOrders, 'Đơn hàng');

      // Sheet 3: Top sản phẩm
      const productsData = [
        ['TOP 5 SẢN PHẨM ĐƯỢC ĐÁNH GIÁ'],
        [],
        ['#', 'Tên sản phẩm', 'SKU', 'Giá (₫)', 'Đánh giá', 'Số đánh giá', 'Trạng thái']
      ];

      topProducts.forEach((product: ProductSummary, index: number) => {
        productsData.push([
          String(index + 1),
          product.name,
          product.sku,
          product.price.toLocaleString('vi-VN'),
          product.rating.toFixed(1),
          String(product.reviewCount),
          product.inStock ? 'Còn hàng' : 'Hết hàng'
        ]);
      });

      const wsProducts = XLSX.utils.aoa_to_sheet(productsData);
      wsProducts['!cols'] = [
        { wch: 5 }, { wch: 40 }, { wch: 15 }, { wch: 15 }, 
        { wch: 10 }, { wch: 12 }, { wch: 12 }
      ];
      
      XLSX.utils.book_append_sheet(wb, wsProducts, 'Top sản phẩm');

      // Sheet 4: Người dùng
      const usersData = [
        ['THỐNG KÊ NGƯỜI DÙNG'],
        [],
        ['Tên', 'Email', 'Số điện thoại', 'Vai trò', 'Trạng thái']
      ];

      users.forEach((user: UserSummary) => {
        usersData.push([
          user.name,
          user.email,
          user.phone || 'N/A',
          user.role,
          user.enabled ? 'Hoạt động' : 'Khóa'
        ]);
      });

      const wsUsers = XLSX.utils.aoa_to_sheet(usersData);
      wsUsers['!cols'] = [
        { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 10 }, { wch: 12 }
      ];
      
      XLSX.utils.book_append_sheet(wb, wsUsers, 'Người dùng');

      // Xuất file
      const dateLabel = dateRange === 'custom' && startDate && endDate
        ? `${startDate}_${endDate}`
        : dateRange === 'today' ? 'HomNay'
        : dateRange === 'week' ? 'TuanNay'
        : dateRange === 'month' ? 'ThangNay'
        : dateRange === 'year' ? 'NamNay'
        : 'TatCa';
      
      const fileName = `BaoCaoThongKe_${dateLabel}_${new Date().getTime()}.xlsx`;
      XLSX.writeFile(wb, fileName);

      // Hiển thị thông báo thành công (nếu có toast)
    } catch (error) {
      console.error('Lỗi khi xuất báo cáo Excel:', error);
      alert('Có lỗi xảy ra khi tạo báo cáo Excel. Vui lòng thử lại.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-800">Thống kê & Phân tích</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>{getDateRangeLabel()}</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất báo cáo Excel</span>
          </button>
        </div>
      </div>

      {/* Date Filter Panel */}
      {showDateFilter && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Chọn khoảng thời gian</h3>
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => setDateRange('today')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === 'today'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={() => setDateRange('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === 'week'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tuần này
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === 'month'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tháng này
            </button>
            <button
              onClick={() => setDateRange('year')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === 'year'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Năm nay
            </button>
            <button
              onClick={() => setDateRange('custom')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === 'custom'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tùy chỉnh
            </button>
          </div>

          {dateRange === 'custom' && (
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-2">Từ ngày</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-2">Đến ngày</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats Overview - Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-100">Tổng doanh thu</span>
            <DollarSign className="w-8 h-8 text-purple-200" />
          </div>
          <p className="text-3xl font-bold mb-1">{stats.totalRevenue.toLocaleString('vi-VN')} ₫</p>
          <p className="text-sm text-purple-100">Từ {stats.completedOrders} đơn đã giao</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-cyan-100">Tổng đơn hàng</span>
            <ShoppingCart className="w-8 h-8 text-cyan-200" />
          </div>
          <p className="text-3xl font-bold mb-1">{stats.totalOrders}</p>
          <p className="text-sm text-cyan-100">{stats.pendingOrders} đơn đang xử lý</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-100">Tổng sản phẩm</span>
            <Package className="w-8 h-8 text-green-200" />
          </div>
          <p className="text-3xl font-bold mb-1">{stats.totalProducts}</p>
          <p className="text-sm text-green-100">{stats.inStockProducts} còn hàng</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-orange-100">Người dùng</span>
            <Users className="w-8 h-8 text-orange-200" />
          </div>
          <p className="text-3xl font-bold mb-1">{stats.totalUsers}</p>
          <p className="text-sm text-orange-100">{stats.activeUsers} đang hoạt động</p>
        </div>
      </div>

      {/* Stats Overview - Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Đơn hoàn thành</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-zinc-800 mb-1">{stats.completedOrders}</p>
          <p className="text-sm text-gray-500">{((stats.completedOrders / stats.totalOrders) * 100 || 0).toFixed(1)}% tổng đơn</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Đơn bị hủy</span>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-zinc-800 mb-1">{stats.cancelledOrders}</p>
          <p className="text-sm text-gray-500">{((stats.cancelledOrders / stats.totalOrders) * 100 || 0).toFixed(1)}% tổng đơn</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Giá trị đơn TB</span>
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-zinc-800 mb-1">{stats.avgOrderValue.toLocaleString('vi-VN')} ₫</p>
          <p className="text-sm text-gray-500">Trung bình mỗi đơn</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Tỷ lệ chuyển đổi</span>
            <TrendingUp className="w-5 h-5 text-cyan-600" />
          </div>
          <p className="text-2xl font-bold text-zinc-800 mb-1">{stats.conversionRate}%</p>
          <p className="text-sm text-gray-500">Từ người dùng</p>
        </div>
      </div>

      {/* Top Products and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Biểu đồ Doanh thu theo ngày */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Doanh thu 7 ngày gần nhất
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueChartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number) => [`${value.toFixed(2)} triệu ₫`, 'Doanh thu']}
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

        {/* Biểu đồ Trạng thái đơn hàng */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-cyan-600" />
            Phân bố trạng thái đơn hàng
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {orderStatusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Biểu đồ Top sản phẩm và Số đơn hàng */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Biểu đồ Top sản phẩm */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-green-600" />
            Top 5 sản phẩm theo đánh giá
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProductsChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '11px' }} angle={-15} textAnchor="end" height={80} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="reviews" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Biểu đồ Đơn hàng theo ngày */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-cyan-600" />
            Số đơn hàng 7 ngày gần nhất
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="#06b6d4" 
                strokeWidth={3}
                dot={{ fill: '#06b6d4', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chi tiết sản phẩm và trạng thái */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Products */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            Top 5 sản phẩm được đánh giá
          </h3>
          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((product: ProductSummary, index: number) => (
                <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-100 to-cyan-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
                  </div>
                  <img 
                    src={product.thumbnailUrl} 
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        {product.rating.toFixed(1)}
                      </span>
                      <span>•</span>
                      <span>{product.reviewCount} đánh giá</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-purple-600">{product.price.toLocaleString('vi-VN')} ₫</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-gray-500">Chưa có dữ liệu</p>
            )}
          </div>
        </div>

        {/* Order Status Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-cyan-600" />
            Trạng thái đơn hàng
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Chờ xử lý</p>
                  <p className="text-xs text-gray-500">Cần xác nhận</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Hoàn thành</p>
                  <p className="text-xs text-gray-500">Đã giao hàng</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Đã hủy</p>
                  <p className="text-xs text-gray-500">Không thành công</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-red-600">{stats.cancelledOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-zinc-800 mb-4">Đơn hàng gần đây</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mã đơn</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Khách hàng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ngày đặt</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tổng tiền</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thanh toán</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.length > 0 ? (
                recentOrders.map((order: Order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">#{order.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{order.user.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {order.grandTotal.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="px-4 py-3 text-sm">{getOrderStatusBadge(order.status)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        order.paymentStatus === 'PAID' 
                          ? 'bg-green-100 text-green-700' 
                          : order.paymentStatus === 'FAILED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 
                         order.paymentStatus === 'FAILED' ? 'Thất bại' : 'Chưa thanh toán'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

export async function loadData() {
  try {
    const { orderApi, productApi, userApi } = await import('../../utils/api');
    
    const [ordersResponse, productsResponse, usersResponse] = await Promise.all([
      orderApi.getAll(),
      productApi.getAll({ page: 0, size: 100 }),
      userApi.getAllUsers()
    ]);

    return {
      orders: ordersResponse.content || ordersResponse,
      products: productsResponse.content || [],
      users: usersResponse.content || usersResponse
    };
  } catch (error) {
    console.error('Error loading analytics data:', error);
    return {
      orders: [],
      products: [],
      users: []
    };
  }
}

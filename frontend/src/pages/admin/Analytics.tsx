import React, { useState, useEffect } from 'react';
import { TrendingUp, Package, ShoppingCart, Users, DollarSign, AlertTriangle, CheckCircle, FileSpreadsheet, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AnalyticsSummary, OrderStatus, ProductSummary } from '../../types/types';
import { analyticsApi, productApi } from '../../utils/api';

type DateRange = 'today' | 'week' | 'month' | 'year' | 'custom';

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Load analytics data from backend
  useEffect(() => {
    loadAnalyticsData();
    loadProductsData();
  }, [dateRange, startDate, endDate]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const { start, end } = getDateRangeValues();
      const data = await analyticsApi.getAnalyticsData({
        startDate: start?.toISOString(),
        endDate: end?.toISOString()
      });
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProductsData = async () => {
    try {
      const response = await productApi.getAll({ page: 0, size: 100 });
      setProducts(response.content || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const getDateRangeValues = () => {
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
        if (!startDate || !endDate) return { start: null, end: null };
        start = new Date(startDate);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        return { start: null, end: null };
    }

    return { start, end };
  };

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

  const getOrderStatusLabel = (status: OrderStatus): string => {
    const labels: Record<OrderStatus, string> = {
      PENDING: 'Chờ xử lý',
      CONFIRMED: 'Đã xác nhận',
      WAITING_FOR_DELIVERY: 'Chờ giao',
      IN_TRANSIT: 'Đang giao',
      DELIVERED: 'Đã giao',
      CANCELLED: 'Đã hủy'
    };
    return labels[status] || status;
  };

  // Prepare data for charts
  const revenueChartData = analytics?.revenueTrend.map(point => ({
    date: new Date(point.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    revenue: point.revenue / 1000000, // Convert to millions
    orders: point.orderCount
  })) || [];

  const orderStatusChartData = analytics?.orderStatusDistribution.map(dist => ({
    name: getOrderStatusLabel(dist.status),
    value: dist.count,
    color: dist.status === 'DELIVERED' ? '#10b981' 
      : dist.status === 'CANCELLED' ? '#ef4444' 
      : '#f59e0b'
  })) || [];

  const topProductsChartData = analytics?.topProducts.map(product => ({
    name: product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name,
    sales: product.totalQuantitySold,
    revenue: product.totalRevenue
  })) || [];

  // Product stock stats (separate from date filtering)
  const productStats = {
    totalProducts: products.length,
    inStockProducts: products.filter(p => p.inStock).length,
    outOfStockProducts: products.filter(p => !p.inStock).length
  };

  const handleExportExcel = () => {
    if (!analytics) return;

    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Overview
      const overviewData = [
        ['BÁO CÁO THỐNG KÊ TỔNG QUAN'],
        ['Khoảng thời gian', getDateRangeLabel()],
        ['Ngày tạo báo cáo', new Date().toLocaleDateString('vi-VN')],
        [],
        ['CHỈ TIÊU', 'GIÁ TRỊ'],
        ['Tổng doanh thu', `${analytics.totalRevenue.toLocaleString('vi-VN')} ₫`],
        ['Tổng đơn hàng', analytics.totalOrders],
        ['Đơn đang xử lý', analytics.pendingOrders],
        ['Đơn hoàn thành', analytics.completedOrders],
        ['Đơn bị hủy', analytics.cancelledOrders],
        ['Giá trị đơn trung bình', `${analytics.avgOrderValue.toLocaleString('vi-VN')} ₫`],
        ['Tổng sản phẩm', productStats.totalProducts],
        ['Sản phẩm còn hàng', productStats.inStockProducts],
        ['Sản phẩm hết hàng', productStats.outOfStockProducts],
        ['Tổng người dùng', analytics.totalUsers],
        ['Người dùng hoạt động', analytics.activeUsers],
        ['Tỷ lệ chuyển đổi', `${analytics.conversionRate}%`],
      ];
      const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
      wsOverview['!cols'] = [{ wch: 30 }, { wch: 25 }];
      XLSX.utils.book_append_sheet(wb, wsOverview, 'Tổng quan');

      // Sheet 2: Top Products
      const productsData = [
        ['TOP SẢN PHẨM BÁN CHẠY'],
        [],
        ['#', 'Tên sản phẩm', 'Số lượng bán', 'Doanh thu (₫)']
      ];
      analytics.topProducts.forEach((product, index) => {
        productsData.push([
          String(index + 1),
          product.name,
          String(product.totalQuantitySold),
          product.totalRevenue.toLocaleString('vi-VN')
        ]);
      });
      const wsProducts = XLSX.utils.aoa_to_sheet(productsData);
      wsProducts['!cols'] = [{ wch: 5 }, { wch: 40 }, { wch: 15 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsProducts, 'Top sản phẩm');

      // Sheet 3: Revenue Trend
      const revenueTrendData = [
        ['BIỂU ĐỒ DOANH THU'],
        [],
        ['Ngày', 'Doanh thu (₫)', 'Số đơn hàng']
      ];
      analytics.revenueTrend.forEach(point => {
        revenueTrendData.push([
          point.date,
          point.revenue.toLocaleString('vi-VN'),
          String(point.orderCount)
        ]);
      });
      const wsRevenue = XLSX.utils.aoa_to_sheet(revenueTrendData);
      wsRevenue['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsRevenue, 'Doanh thu');

      // Export file
      const dateLabel = dateRange === 'custom' && startDate && endDate
        ? `${startDate}_${endDate}`
        : dateRange === 'today' ? 'HomNay'
        : dateRange === 'week' ? 'TuanNay'
        : dateRange === 'month' ? 'ThangNay'
        : dateRange === 'year' ? 'NamNay'
        : 'TatCa';
      
      const fileName = `BaoCaoThongKe_${dateLabel}_${new Date().getTime()}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Có lỗi xảy ra khi tạo báo cáo Excel. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu thống kê...</p>
        </div>
      </div>
    );
  }

  if (!analytics || !analytics.hasData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Không có dữ liệu</h3>
          <p className="text-gray-600">Không có dữ liệu thống kê trong khoảng thời gian đã chọn.</p>
        </div>
      </div>
    );
  }

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
            {(['today', 'week', 'month', 'year', 'custom'] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === 'today' ? 'Hôm nay' 
                  : range === 'week' ? 'Tuần này'
                  : range === 'month' ? 'Tháng này'
                  : range === 'year' ? 'Năm nay'
                  : 'Tùy chỉnh'}
              </button>
            ))}
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
          <p className="text-3xl font-bold mb-1">{analytics.totalRevenue.toLocaleString('vi-VN')} ₫</p>
          <p className="text-sm text-purple-100">Từ {analytics.completedOrders} đơn đã giao</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-cyan-100">Tổng đơn hàng</span>
            <ShoppingCart className="w-8 h-8 text-cyan-200" />
          </div>
          <p className="text-3xl font-bold mb-1">{analytics.totalOrders}</p>
          <p className="text-sm text-cyan-100">{analytics.pendingOrders} đơn đang xử lý</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-100">Tổng sản phẩm</span>
            <Package className="w-8 h-8 text-green-200" />
          </div>
          <p className="text-3xl font-bold mb-1">{productStats.totalProducts}</p>
          <p className="text-sm text-green-100">{productStats.inStockProducts} còn hàng</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-orange-100">Người dùng</span>
            <Users className="w-8 h-8 text-orange-200" />
          </div>
          <p className="text-3xl font-bold mb-1">{analytics.totalUsers}</p>
          <p className="text-sm text-orange-100">{analytics.activeUsers} đang hoạt động</p>
        </div>
      </div>

      {/* Stats Overview - Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Giá trị đơn TB</span>
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{analytics.avgOrderValue.toLocaleString('vi-VN')} ₫</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Đơn hoàn thành</span>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{analytics.completedOrders}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Đơn bị hủy</span>
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{analytics.cancelledOrders}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Tỷ lệ chuyển đổi</span>
            <TrendingUp className="w-6 h-6 text-cyan-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{analytics.conversionRate}%</p>
        </div>
      </div>

      {/* Charts - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Doanh thu theo ngày</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueChartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toFixed(2)} triệu ₫`} />
              <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Phân bố trạng thái đơn hàng</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {orderStatusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 5 sản phẩm bán chạy</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProductsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#10b981" name="Số lượng bán" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Số đơn hàng theo ngày</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#06b6d4" strokeWidth={2} name="Số đơn" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top sản phẩm bán chạy</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">#</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Sản phẩm</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Số lượng bán</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topProducts.map((product, index) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">{index + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.thumbnailUrl || '/placeholder.png'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <span className="text-sm font-medium text-gray-800">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-gray-800 font-medium">
                    {product.totalQuantitySold}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-gray-800 font-medium">
                    {product.totalRevenue.toLocaleString('vi-VN')} ₫
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

import React from 'react';
import { Users, Package, ShoppingCart, TrendingUp, UserPlus, MessageSquare, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

type Props = { 
  data?: any;
  onReload?: () => void;
};

const Dashboard: React.FC<Props> = ({ data }) => {
  const stats = data?.stats || { users: 0, orders: 0, revenue: 0, products: 0 };
  const activities = data?.activities || [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-5 h-5 text-cyan-600" />;
      case 'user':
        return <UserPlus className="w-5 h-5 text-purple-600" />;
      case 'ticket':
        return <MessageSquare className="w-5 h-5 text-pink-600" />;
      case 'article':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActivityBg = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-cyan-50';
      case 'user':
        return 'bg-purple-50';
      case 'ticket':
        return 'bg-pink-50';
      case 'article':
        return 'bg-green-50';
      case 'alert':
        return 'bg-yellow-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-zinc-800 mb-6">Tổng quan hệ thống</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.users}</h3>
          <p className="text-purple-100 text-sm">Người dùng</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.orders}</h3>
          <p className="text-cyan-100 text-sm">Đơn hàng</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.products || 0}</h3>
          <p className="text-pink-100 text-sm">Sản phẩm</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-xl">₫</span>
            </div>
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.revenue.toLocaleString()}</h3>
          <p className="text-green-100 text-sm">Doanh thu (VNĐ)</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-zinc-800 mb-4">Hoạt động gần đây</h3>
        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity: any, index: number) => (
              <div
                key={index}
                className={`flex items-start gap-4 p-4 rounded-lg ${getActivityBg(activity.type)} hover:shadow-sm transition-shadow`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-800">{activity.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-2">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Chưa có dữ liệu hoạt động</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

export async function loadData() {
  try {
    const { orderApi, productApi, userApi, InventoryApi } = await import('../../utils/api');
    
    const [ordersResponse, productsResponse, usersResponse, inventoriesResponse] = await Promise.all([
      orderApi.getAll(),
      productApi.getAll({ page: 0, size: 1000 }),
      userApi.getAllUsers(),
      InventoryApi.getAll().catch((err) => {
        console.error('Inventory API error:', err);
        return { content: [] };
      })
    ]);

    const orders = ordersResponse.content || ordersResponse || [];
    const products = productsResponse.content || [];
    const users = usersResponse.content || usersResponse || [];
    const inventories = inventoriesResponse.content || [];

    // Tính toán thống kê
    const totalUsers = users.length;
    const totalOrders = orders.length;
    const totalProducts = products.length;
    
    // Doanh thu từ đơn đã giao và đã thanh toán
    const totalRevenue = orders
      .filter((o: any) => o.status === 'DELIVERED' && o.paymentStatus === 'PAID')
      .reduce((sum: number, o: any) => sum + (o.grandTotal || 0), 0);

    // Tạo hoạt động gần đây từ dữ liệu thực
    const activities: Array<{ type: string; title: string; description: string; time: string }> = [];

    // Đơn hàng gần đây
    const recentOrders = [...orders]
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);

    recentOrders.forEach((order: any) => {
      const timeAgo = getTimeAgo(order.createdAt);
      const statusText = 
        order.status === 'DELIVERED' ? 'đã giao' :
        order.status === 'PENDING' ? 'mới' :
        order.status === 'CANCELLED' ? 'đã hủy' : 'đang xử lý';
      
      activities.push({
        type: 'order',
        title: `Đơn hàng ${statusText} #${order.id.slice(0, 8)}`,
        description: `${order.user?.name || 'Khách hàng'} - Tổng tiền: ${order.grandTotal?.toLocaleString('vi-VN')} ₫`,
        time: timeAgo
      });
    });

    // Người dùng mới
    const recentUsers = [...users]
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2);

    recentUsers.forEach((user: any) => {
      const timeAgo = getTimeAgo(user.createdAt);
      activities.push({
        type: 'user',
        title: 'Người dùng mới đăng ký',
        description: `${user.name} (${user.email})`,
        time: timeAgo
      });
    });

    if (inventories.length > 0) {
      const lowStockItems = inventories.filter((inv: any) => 
        inv.quantity < 10 && inv.quantity > 0
      ).slice(0, 2);

      lowStockItems.forEach((inv: any) => {
        activities.push({
          type: 'alert',
          title: 'Cảnh báo tồn kho',
          description: `Sản phẩm có SKU "${inv.productId}" sắp hết hàng (còn ${inv.quantity} sản phẩm)`,
          time: 'Hiện tại'
        });
      });

      const outOfStockItems = inventories.filter((inv: any) => 
        inv.quantity === 0
      ).slice(0, 2);

      outOfStockItems.forEach((inv: any) => {
        activities.push({
          type: 'alert',
          title: 'Sản phẩm đã hết hàng',
          description: `Sản phẩm có SKU "${inv.productId}" đã hết hàng - cần nhập thêm`,
          time: 'Hiện tại'
        });
      });
    } else if (products.length > 0) {
      // Fallback: Sử dụng dữ liệu từ Products API
      const outOfStockProducts = products.filter((p: any) => !p.inStock).slice(0, 3);
      
      outOfStockProducts.forEach((product: any) => {
        activities.push({
          type: 'alert',
          title: 'Sản phẩm đã hết hàng',
          description: `${product.name} (SKU: ${product.sku}) đã hết hàng - cần nhập thêm`,
          time: 'Hiện tại'
        });
      });

      const lowStockProducts = products.filter((p: any) => 
        p.inStock && p.stockQuantity != null && p.stockQuantity < 10
      ).slice(0, 2);

      lowStockProducts.forEach((product: any) => {
        activities.push({
          type: 'alert',
          title: 'Cảnh báo tồn kho',
          description: `${product.name} sắp hết hàng (còn ${product.stockQuantity || 'ít'} sản phẩm)`,
          time: 'Hiện tại'
        });
      });
    }

    // Sắp xếp hoạt động theo thời gian
    activities.sort((a: any, b: any) => {
      const timeOrder: any = {
        'vừa xong': 0,
        'Hiện tại': 0,
      };
      const aOrder = timeOrder[a.time] ?? parseTimeAgo(a.time);
      const bOrder = timeOrder[b.time] ?? parseTimeAgo(b.time);
      return aOrder - bOrder;
    });

    return {
      stats: {
        users: totalUsers,
        orders: totalOrders,
        revenue: totalRevenue,
        products: totalProducts
      },
      activities: activities.slice(0, 8)
    };
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    return {
      stats: { users: 0, orders: 0, revenue: 0, products: 0 },
      activities: []
    };
  }
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return past.toLocaleDateString('vi-VN');
}

function parseTimeAgo(timeStr: string): number {
  if (timeStr === 'vừa xong' || timeStr === 'Hiện tại') return 0;
  const match = timeStr.match(/(\d+)\s*(phút|giờ|ngày)/);
  if (!match) return 999999;
  const value = parseInt(match[1]);
  const unit = match[2];
  if (unit === 'phút') return value;
  if (unit === 'giờ') return value * 60;
  if (unit === 'ngày') return value * 1440;
  return 999999;
}

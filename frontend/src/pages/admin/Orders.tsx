import React, { useState, useMemo } from 'react';
import { Eye, Package, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import type { Order } from '../../types/types';
import { orderApi } from '../../utils/api';
import OrderDetailsModal from '../../components/admin-modal/OrderDetailsModal';
import Pagination from '../../components/Pagination';

type Props = { 
  data?: { content: Order[]; page: { totalPages: number; totalElements: number; number: number; size: number } };
  onReload?: () => void;
  onPageChange?: (page: number, size: number) => void;
};

const Orders: React.FC<Props> = ({ data, onReload, onPageChange }) => {
  const orders = data?.content || [];
  const pagination = data?.page || { totalPages: 0, totalElements: 0, number: 0, size: 20 };
  
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const handleViewDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrderId(null);
  };

  const handlePageChange = (page: number) => {
    onPageChange?.(page, pagination.size);
  };

  const handlePageSizeChange = (size: number) => {
    onPageChange?.(0, size);
  };

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((order: Order) => order.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((order: Order) => {
        const customerNameMatch = order.user.name.toLowerCase().includes(searchLower);
        const orderIdMatch = order.id.toLowerCase().includes(searchLower);
        return customerNameMatch || orderIdMatch;
      });
    }

    // Sort by created date (newest first)
    return filtered.sort((a: Order, b: Order) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [orders, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Chờ xử lý' },
      WAITING_FOR_DELIVERY: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Package, label: 'Chờ giao hàng' },
      IN_TRANSIT: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Package, label: 'Đang giao' },
      DELIVERED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Đã giao' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Đã hủy' },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-800">Quản lý đơn hàng</h2>
        <div className="flex gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên khách hàng, mã đơn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-80"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="WAITING_FOR_DELIVERY">Chờ giao hàng</option>
            <option value="IN_TRANSIT">Đang giao</option>
            <option value="DELIVERED">Đã giao</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mã đơn</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Khách hàng</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tổng tiền</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày đặt</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order: Order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.id.slice(-8)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{order.user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{order.grandTotal.toLocaleString()} ₫</td>
                  <td className="px-6 py-4 text-sm">{getStatusBadge(order.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleViewDetails(order.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Chi tiết</span>
                      </button>
                      {order.status === 'PENDING' && (
                        <>
                          <button 
                            className="inline-flex items-center gap-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            onClick={async () => {
                              try {
                                await orderApi.confirmOrder(order.id);
                                onReload?.();
                              } catch (error) {
                                console.error('Failed to confirm order:', error);
                              }
                            }}
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Xác nhận</span>
                          </button>
                          <button 
                            className="inline-flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={async () => {
                              try {
                                await orderApi.cancelOrder(order.id);
                                onReload?.();
                              } catch (error) {
                                console.error('Failed to cancel order:', error);
                              }
                            }}
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Hủy</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  {searchTerm ? 'Không tìm thấy đơn hàng phù hợp' : 'Chưa có đơn hàng nào'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        page={pagination.number}
        totalPages={pagination.totalPages}
        totalElements={pagination.totalElements}
        pageSize={pagination.size}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Order Details Modal */}
      {selectedOrderId && (
        <OrderDetailsModal
          orderId={selectedOrderId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Orders;

export async function loadData(page: number = 0, size: number = 20) {
  try {
    const response = await orderApi.getAll({ page, size });
    return response;
  } catch (error) {
    console.error('Failed to load orders:', error);
    return { content: [], page: { totalPages: 0, totalElements: 0, number: 0, size: 20 } };
  }
}

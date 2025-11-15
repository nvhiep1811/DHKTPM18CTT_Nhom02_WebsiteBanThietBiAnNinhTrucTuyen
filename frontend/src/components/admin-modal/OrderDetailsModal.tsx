import React, { useEffect, useState } from 'react';
import { X, Package, User, MapPin, CreditCard, Truck } from 'lucide-react';
import type { OrderDetails } from '../../types/types';
import { orderApi } from '../../utils/api';

interface OrderDetailsModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ orderId, isOpen, onClose }) => {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && orderId) {
      loadOrderDetails();
    }
  }, [isOpen, orderId]);

  const loadOrderDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderApi.getById(orderId);
      setOrderDetails(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load order details');
      console.error('Error loading order details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xử lý' },
      WAITING_FOR_DELIVERY: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Chờ giao hàng' },
      IN_TRANSIT: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Đang giao' },
      DELIVERED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã giao' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: any = {
      UNPAID: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Chưa thanh toán' },
      PAID: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã thanh toán' },
      FAILED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Thất bại' },
      REFUNDED: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Đã hoàn tiền' },
    };
    const config = statusConfig[status] || statusConfig.UNPAID;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Chi tiết đơn hàng</h2>
            {orderDetails && (
              <p className="text-sm text-gray-500 mt-1">#{orderDetails.id.slice(-8)}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {orderDetails && !loading && (
            <div className="space-y-6">
              {/* Status and Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Trạng thái đơn hàng</h3>
                  {getStatusBadge(orderDetails.status)}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Thanh toán</h3>
                  {getPaymentStatusBadge(orderDetails.paymentStatus)}
                </div>
              </div>

              {/* Customer Info */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Thông tin khách hàng</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Tên khách hàng</p>
                    <p className="font-medium text-gray-900">{orderDetails.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{orderDetails.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <p className="font-medium text-gray-900">{orderDetails.user.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Địa chỉ giao hàng</h3>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{orderDetails.shippingAddress.fullName}</p>
                  <p className="text-gray-700">{orderDetails.shippingAddress.phone}</p>
                  <p className="text-gray-700">
                    {orderDetails.shippingAddress.address}, {orderDetails.shippingAddress.ward}, {orderDetails.shippingAddress.district}, {orderDetails.shippingAddress.city}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Sản phẩm đặt hàng</h3>
                </div>
                <div className="space-y-3">
                  {orderDetails.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={item.product.thumbnailUrl}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                        <p className="text-sm text-gray-500">SKU: {item.product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                        <p className="font-semibold text-gray-900">{item.lineTotal.toLocaleString()} ₫</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Details */}
              {orderDetails.payment && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Thông tin thanh toán</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-500">Phương thức</p>
                      <p className="font-medium text-gray-900">{orderDetails.payment.method}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nhà cung cấp</p>
                      <p className="font-medium text-gray-900">{orderDetails.payment.provider}</p>
                    </div>
                    {orderDetails.payment.transactionId && (
                      <div>
                        <p className="text-sm text-gray-500">Mã giao dịch</p>
                        <p className="font-medium text-gray-900">{orderDetails.payment.transactionId}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Shipment Info */}
              {orderDetails.shipment && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Thông tin vận chuyển</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-500">Trạng thái</p>
                      <p className="font-medium text-gray-900">{orderDetails.shipment.status}</p>
                    </div>
                    {orderDetails.shipment.shippedAt && (
                      <div>
                        <p className="text-sm text-gray-500">Ngày gửi hàng</p>
                        <p className="font-medium text-gray-900">
                          {new Date(orderDetails.shipment.shippedAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    )}
                    {orderDetails.shipment.deliveredAt && (
                      <div>
                        <p className="text-sm text-gray-500">Ngày giao hàng</p>
                        <p className="font-medium text-gray-900">
                          {new Date(orderDetails.shipment.deliveredAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Tổng kết đơn hàng</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-medium">{orderDetails.subTotal.toLocaleString()} ₫</span>
                  </div>
                  {orderDetails.discountTotal > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá:</span>
                      <span className="font-medium">-{orderDetails.discountTotal.toLocaleString()} ₫</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-medium">{orderDetails.shippingFee.toLocaleString()} ₫</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
                    <span className="text-lg font-bold text-purple-600">
                      {orderDetails.grandTotal.toLocaleString()} ₫
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Ngày đặt hàng:</p>
                    <p className="font-medium text-gray-900">
                      {new Date(orderDetails.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  {orderDetails.confirmedAt && (
                    <div>
                      <p className="text-gray-500">Ngày xác nhận:</p>
                      <p className="font-medium text-gray-900">
                        {new Date(orderDetails.confirmedAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  )}
                  {orderDetails.cancelledAt && (
                    <div>
                      <p className="text-gray-500">Ngày hủy:</p>
                      <p className="font-medium text-red-600">
                        {new Date(orderDetails.cancelledAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;

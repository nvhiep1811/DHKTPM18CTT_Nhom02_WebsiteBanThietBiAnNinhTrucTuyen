import React from 'react';
import { X, Star } from 'lucide-react';
import type { Review } from '../../types/types';

interface ReviewDetailsModalProps {
  review: Review | null;
  isOpen: boolean;
  onClose: () => void;
}

const ReviewDetailsModal: React.FC<ReviewDetailsModalProps> = ({
  review,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !review) return null;

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-lg font-medium">({rating}/5)</span>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ duyệt' },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã duyệt' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Từ chối' },
    };
    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Chi tiết đánh giá</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Đánh giá</label>
              <p className="text-sm text-gray-900">#{review.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              {getStatusBadge(review.status)}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Sản phẩm</label>
              <p className="text-sm text-gray-900">{review.productId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Người dùng</label>
              <p className="text-sm text-gray-900">{review.userName}</p>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá</label>
            {renderStars(review.rating)}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung đánh giá</label>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-wrap">{review.comment}</p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
              <p className="text-sm text-gray-600">
                {new Date(review.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Đơn hàng</label>
              <p className="text-sm text-gray-600">#{review.orderItemId}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailsModal;
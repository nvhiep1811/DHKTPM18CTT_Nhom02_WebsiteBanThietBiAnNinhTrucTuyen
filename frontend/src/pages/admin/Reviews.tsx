import React, { useState, useMemo } from 'react';
import { Eye, CheckCircle, XCircle, Trash2, Star, Search } from 'lucide-react';
import { ReviewApi } from '../../utils/api';
import type { Review } from '../../types/types';
import ConfirmDialog from '../../components/ConfirmDialog';
import ReviewDetailsModal from '../../components/admin-modal/ReviewDetailsModal';

type Props = { 
  data?: { content: Review[]; page: { totalPages: number; totalElements: number; number: number; size: number } };
  onReload?: () => void;
};

const Reviews: React.FC<Props> = ({ data, onReload }) => {
  const reviews = data?.content || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReviewToDelete, setSelectedReviewToDelete] = useState<Review | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    let filtered = reviews;

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((review: any) => review.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((review: Review) => {
        const productIdMatch = review.productId.toLowerCase().includes(searchLower);
        const userNameMatch = review.userName.toLowerCase().includes(searchLower);
        const commentMatch = review.comment.toLowerCase().includes(searchLower);
        return productIdMatch || userNameMatch || commentMatch;
      });
    }

    // Sort by created date (newest first)
    return filtered.sort((a: Review, b: Review) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [reviews, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ duyệt' },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã duyệt' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Từ chối' },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-800">Quản lý đánh giá</h2>
        <div className="flex gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo ID sản phẩm, tên người dùng..."
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
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID Sản phẩm</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Người dùng</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Đánh giá</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nội dung</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày tạo</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review: Review) => (
                <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">#{review.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{review.productId}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{review.userName}</td>
                  <td className="px-6 py-4 text-sm">{renderStars(review.rating)}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="max-w-xs truncate" title={review.comment}>
                      {review.comment}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{getStatusBadge(review.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          setSelectedReview(review);
                          setIsDetailsModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Chi tiết</span>
                      </button>
                      {review.status === 'PENDING' && (
                        <>
                          <button 
                            className="inline-flex items-center gap-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            onClick={async () => {
                              try {
                                await ReviewApi.approveReview(review.id);
                                onReload?.();
                              } catch (error) {
                                console.error('Failed to approve review:', error);
                              }
                            }}
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Duyệt</span>
                          </button>
                          <button 
                            className="inline-flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={async () => {
                              try {
                                await ReviewApi.rejectReview(review.id);
                                onReload?.();
                              } catch (error) {
                                console.error('Failed to reject review:', error);
                              }
                            }}
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Từ chối</span>
                          </button>
                        </>
                      )}
                      <button 
                        className="inline-flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={() => {
                          setSelectedReviewToDelete(review);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  {searchTerm ? 'Không tìm thấy đánh giá phù hợp' : 'Chưa có đánh giá nào'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Xác nhận xóa đánh giá"
        message={`Bạn có chắc muốn xóa đánh giá của ${selectedReviewToDelete?.userName} cho sản phẩm ${selectedReviewToDelete?.productId}?`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={async () => {
          if (selectedReviewToDelete) {
            try {
              await ReviewApi.deleteReview(selectedReviewToDelete.id);
              onReload?.();
            } catch (error) {
              console.error('Failed to delete review:', error);
            }
          }
          setIsDeleteDialogOpen(false);
          setSelectedReviewToDelete(null);
        }}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setSelectedReviewToDelete(null);
        }}
      />

      {/* Review Details Modal */}
      <ReviewDetailsModal
        review={selectedReview}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedReview(null);
        }}
      />
    </div>
  );
};

export default Reviews;

export async function loadData() {
  try {
    const response = await ReviewApi.getAll({ page: 0, size: 50 });
    return response;
  } catch (error) {
    console.error('Failed to load reviews:', error);
    return { content: [], page: { totalPages: 0, totalElements: 0, number: 0, size: 50 } };
  }
}
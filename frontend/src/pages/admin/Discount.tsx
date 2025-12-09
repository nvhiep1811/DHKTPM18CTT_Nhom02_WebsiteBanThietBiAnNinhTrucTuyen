import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Percent, Calendar, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { DiscountApi } from '../../utils/api';
import type { Discount } from '../../types/types';
import ConfirmDialog from '../../components/ConfirmDialog';
import DiscountModal from '../../components/admin-modal/DiscountModal';

type Props = { 
  data?: Discount[];
  onReload?: () => void;
};

const Promotions: React.FC<Props> = ({ data, onReload }) => {
  const discounts = data || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    discount?: Discount;
  }>({ open: false });

  const [discountModal, setDiscountModal] = useState<{
    open: boolean;
    discount?: Discount;
  }>({ open: false });

  const filteredDiscounts = useMemo(() => {
    let filtered = discounts;

    // Tìm kiếm theo mã khuyến mãi
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((discount: Discount) => 
        discount.code.toLowerCase().includes(searchLower)
      );
    }

    // Lọc theo trạng thái
    if (statusFilter !== 'all') {
      filtered = filtered.filter((discount: Discount) => {
        if (statusFilter === 'active') return discount.active;
        if (statusFilter === 'inactive') return !discount.active;
        return true;
      });
    }

    return filtered;
  }, [discounts, searchTerm, statusFilter]);

  // const handleDeleteDiscount = (discount: Discount) => {
  //   setConfirmDialog({ open: true, discount });
  // };

  // const confirmDelete = async () => {
  //   if (!confirmDialog.discount) return;

  //   try {
  //     await DiscountApi.delete(confirmDialog.discount.id);
  //     toast.success('Đã xóa khuyến mãi thành công');
  //     setConfirmDialog({ open: false });
  //     onReload?.();
  //   } catch (error: any) {
  //     console.error('Error deleting discount:', error);
  //     if (error.response?.status === 401) {
  //       toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  //     } else if (error.response?.status === 403) {
  //       toast.error('Bạn không có quyền thực hiện thao tác này.');
  //     } else {
  //       toast.error('Có lỗi xảy ra khi xóa khuyến mãi');
  //     }
  //   }
  // };

  const handleCreateDiscount = () => {
    setDiscountModal({ open: true });
  };

  const handleEditDiscount = (discount: Discount) => {
    setDiscountModal({ open: true, discount });
  };

  const handleDiscountModalSuccess = () => {
    onReload?.();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-800">Quản lý khuyến mãi</h2>
        <button 
          onClick={handleCreateDiscount}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm khuyến mãi</span>
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã khuyến mãi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Không hoạt động</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredDiscounts.length > 0 ? (
          filteredDiscounts.map((discount: Discount) => (
            <div key={discount.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Percent className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-800 mb-2">{discount.code}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Percent className="w-4 h-4" />
                        {discount.discountType === 'PERCENT' ? `${discount.discountValue}%` : 
                         discount.discountType === 'FIXED_AMOUNT' ? `${discount.discountValue.toLocaleString('vi-VN')}₫` : 
                         'Miễn phí vận chuyển'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(discount.startAt).toLocaleDateString('vi-VN')} - {new Date(discount.endAt).toLocaleDateString('vi-VN')}
                      </span>
                      {discount.minOrderValue > 0 && (
                        <span>Đơn tối thiểu: {discount.minOrderValue.toLocaleString('vi-VN')}₫</span>
                      )}
                    </div>
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded text-xs ${discount.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {discount.active ? 'Đang hoạt động' : 'Không hoạt động'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditDiscount(discount)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {/* <button 
                    onClick={() => handleDeleteDiscount(discount)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button> */}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            {searchTerm || statusFilter !== 'all' ? 'Không tìm thấy khuyến mãi phù hợp' : 'Chưa có khuyến mãi nào'}
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      {/* <ConfirmDialog
        open={confirmDialog.open}
        title="Xác nhận xóa khuyến mãi"
        message={`Bạn có chắc chắn muốn xóa khuyến mãi "${confirmDialog.discount?.code}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa khuyến mãi"
        cancelText="Hủy"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ open: false })}
      /> */}

      {/* Discount Modal */}
      <DiscountModal
        isOpen={discountModal.open}
        onClose={() => setDiscountModal({ open: false })}
        discount={discountModal.discount}
        onSuccess={handleDiscountModalSuccess}
      />
    </div>
  );
};

export default Promotions;

export async function loadData() {
  try {
    const result = await DiscountApi.getAll();
    return result.content || result;
  } catch (error) {
    console.error('Error loading discounts:', error);
    return [];
  }
}

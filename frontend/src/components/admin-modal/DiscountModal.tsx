import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { DiscountApi } from '../../utils/api';
import type { Discount } from '../../types/types';

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  discount?: Discount;
  onSuccess: () => void;
}

const DiscountModal: React.FC<DiscountModalProps> = ({
  isOpen,
  onClose,
  discount,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENT' as 'PERCENT' | 'FIXED_AMOUNT' | 'FREE_SHIP',
    discountValue: 0,
    minOrderValue: 0,
    active: true,
    startAt: '',
    endAt: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!discount;

  // Load dữ liệu khi discount thay đổi
  useEffect(() => {
    if (discount) {
      setFormData({
        code: discount.code || '',
        discountType: discount.discountType || 'PERCENT',
        discountValue: discount.discountValue || 0,
        minOrderValue: discount.minOrderValue || 0,
        active: discount.active ?? true,
        startAt: discount.startAt ? new Date(discount.startAt).toISOString().slice(0, 16) : '',
        endAt: discount.endAt ? new Date(discount.endAt).toISOString().slice(0, 16) : '',
      });
    } else {
      setFormData({
        code: '',
        discountType: 'PERCENT',
        discountValue: 0,
        minOrderValue: 0,
        active: true,
        startAt: '',
        endAt: '',
      });
    }
    setErrors({});
  }, [discount, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const discountData = {
        code: formData.code.trim().toUpperCase(),
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        minOrderValue: formData.minOrderValue,
        active: formData.active,
        startAt: new Date(formData.startAt).toISOString(),
        endAt: new Date(formData.endAt).toISOString(),
      };

      if (isEditing) {
        await DiscountApi.update(discount.id, discountData);
      } else {
        await DiscountApi.create(discountData);
      }

      toast.success(isEditing ? 'Cập nhật khuyến mãi thành công!' : 'Thêm khuyến mãi thành công!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error saving discount:', error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: 'Có lỗi xảy ra khi lưu khuyến mãi. Vui lòng thử lại.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      code: '',
      discountType: 'PERCENT',
      discountValue: 0,
      minOrderValue: 0,
      active: true,
      startAt: '',
      endAt: '',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-zinc-800">
            {isEditing ? 'Sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Mã khuyến mãi *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="SUMMER2025"
              />
              {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Loại khuyến mãi *
              </label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="PERCENT">Phần trăm (%)</option>
                <option value="FIXED_AMOUNT">Số tiền cố định (₫)</option>
                <option value="FREE_SHIP">Miễn phí vận chuyển</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Giá trị khuyến mãi *
              </label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={formData.discountType === 'PERCENT' ? '20' : '50000'}
                min="0"
                step={formData.discountType === 'PERCENT' ? '1' : '1000'}
              />
              {errors.discountValue && <p className="text-red-500 text-sm mt-1">{errors.discountValue}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Đơn hàng tối thiểu (₫)
              </label>
              <input
                type="number"
                value={formData.minOrderValue}
                onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="100000"
                min="0"
                step="10000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Thời gian bắt đầu *
              </label>
              <input
                type="datetime-local"
                value={formData.startAt}
                onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {errors.startAt && <p className="text-red-500 text-sm mt-1">{errors.startAt}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Thời gian kết thúc *
              </label>
              <input
                type="datetime-local"
                value={formData.endAt}
                onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {errors.endAt && <p className="text-red-500 text-sm mt-1">{errors.endAt}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="active" className="text-sm font-medium text-zinc-700">
              Kích hoạt khuyến mãi
            </label>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-zinc-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-colors flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isLoading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscountModal;
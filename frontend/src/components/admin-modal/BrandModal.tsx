import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { brandApi } from '../../utils/api';
import type { Brand } from '../../types/types';

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand?: Brand;
  onSuccess: () => void;
}

const BrandModal: React.FC<BrandModalProps> = ({
  isOpen,
  onClose,
  brand,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!brand;

  // Load dữ liệu khi brand thay đổi
  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || '',
      });
    } else {
      setFormData({
        name: '',
      });
    }
    setErrors({});
  }, [brand, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrors({ name: 'Tên thương hiệu không được để trống' });
      return;
    }

    setIsLoading(true);

    try {
      const brandData = {
        name: formData.name.trim(),
      };

      if (isEditing) {
        await brandApi.update(brand.id.toString(), brandData);
      } else {
        await brandApi.create(brandData);
      }

      toast.success(isEditing ? 'Cập nhật thương hiệu thành công!' : 'Thêm thương hiệu thành công!');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error saving brand:', error);
      setErrors({ submit: 'Có lỗi xảy ra khi lưu thương hiệu. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-zinc-800">
            {isEditing ? 'Sửa thương hiệu' : 'Thêm thương hiệu mới'}
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Tên thương hiệu *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Nhập tên thương hiệu"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-500 text-white rounded-lg hover:shadow-lg transition-colors flex items-center justify-center gap-2"
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

export default BrandModal;
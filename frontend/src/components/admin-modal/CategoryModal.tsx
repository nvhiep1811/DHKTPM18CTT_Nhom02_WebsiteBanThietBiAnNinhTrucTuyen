import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { categoryApi } from '../../utils/api';
import { imageUploadService } from '../../utils/imageUploadService';
import type { CategorySummary } from '../../types/types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: CategorySummary;
  onSuccess: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!category;

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        active: category.active ?? true,
      });
      setPreviewUrl(category.imageUrl || null);
    } else {
      setFormData({
        name: '',
        description: '',
        active: true,
      });
      setPreviewUrl(null);
    }
    setSelectedFile(null);
    setErrors({});
  }, [category, isOpen]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; 
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

      if (file.size > maxSize) {
        setErrors({ file: 'Kích thước file phải nhỏ hơn 5MB' });
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        setErrors({ file: 'Chỉ chấp nhận file JPEG, PNG, WebP' });
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    let uploadedImageUrl = category?.imageUrl || null;
    let oldImageUrl = category?.imageUrl || null;

    try {
      if (selectedFile) {
        const uploadResult = await imageUploadService.uploadImage(selectedFile, {
          bucket: 'categories',
          folder: 'category-images'
        });
        uploadedImageUrl = uploadResult.url;
      }

      const categoryData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        active: formData.active,
        imageUrl: uploadedImageUrl,
      };

      if (isEditing) {
        await categoryApi.update(category.id.toString(), categoryData);
      } else {
        await categoryApi.create(categoryData);
      }
      // Xóa ảnh cũ nếu có ảnh mới được upload thành công
      if (selectedFile && oldImageUrl && oldImageUrl !== uploadedImageUrl) {
        try {
          await imageUploadService.deleteImage(oldImageUrl);
        } catch (deleteError) {
          console.error('Error deleting old category image:', deleteError);
        }
      }

      toast.success(isEditing ? 'Cập nhật danh mục thành công!' : 'Thêm danh mục thành công!');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error saving category:', error);

      if (!isEditing && uploadedImageUrl && selectedFile && uploadedImageUrl !== oldImageUrl) {
        try {
          await imageUploadService.deleteImage(uploadedImageUrl);
        } catch (deleteError) {
          console.error('Error deleting uploaded image:', deleteError);
        }
      }

      setErrors({ submit: 'Có lỗi xảy ra khi lưu danh mục. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '', active: true });
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrors({});
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-zinc-800">
            {isEditing ? 'Sửa danh mục' : 'Thêm danh mục mới'}
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
              Tên danh mục *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Nhập tên danh mục"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Mô tả danh mục
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Nhập mô tả danh mục"
              rows={3}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Ảnh danh mục
            </label>
            <div className="space-y-2">
              {/* Preview */}
              {previewUrl && (
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Chọn ảnh
                </button>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(category?.imageUrl || null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Xóa
                  </button>
                )}
              </div>
              {errors.file && <p className="text-red-500 text-sm">{errors.file}</p>}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="active" className="text-sm text-zinc-700">
              Hoạt động
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

export default CategoryModal;
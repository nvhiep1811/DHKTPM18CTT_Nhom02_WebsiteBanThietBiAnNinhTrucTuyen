import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { ArticleApi } from '../../utils/api';
import type { Article } from '../../types/types';

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article?: Article;
  onSuccess: () => void;
}

const ArticleModal: React.FC<ArticleModalProps> = ({
  isOpen,
  onClose,
  article,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    active: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!article;

  // Load dữ liệu khi article thay đổi
  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || '',
        content: article.content || '',
        active: article.active || false,
      });
    } else {
      setFormData({
        title: '',
        content: '',
        active: false,
      });
    }
    setErrors({});
  }, [article, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề không được để trống';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Nội dung không được để trống';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const articleData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        active: formData.active,
      };

      if (isEditing) {
        await ArticleApi.update(article.id, articleData);
      } else {
        await ArticleApi.create(articleData);
      }

      toast.success(isEditing ? 'Cập nhật bài viết thành công!' : 'Thêm bài viết thành công!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error saving article:', error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: 'Có lỗi xảy ra khi lưu bài viết. Vui lòng thử lại.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      content: '',
      active: false,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-zinc-800">
            {isEditing ? 'Sửa bài viết' : 'Thêm bài viết mới'}
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
              Tiêu đề *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Nhập tiêu đề bài viết"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Nội dung *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
              placeholder="Nhập nội dung bài viết"
            />
            {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
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
              Xuất bản bài viết
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

export default ArticleModal;
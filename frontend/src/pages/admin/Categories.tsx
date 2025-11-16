import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, FolderTree, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { categoryApi } from '../../utils/api';
import { imageUploadService } from '../../utils/imageUploadService';
import type { CategorySummary } from '../../types/types';
import CategoryModal from '../../components/admin-modal/CategoryModal';
import ConfirmDialog from '../../components/ConfirmDialog';

type Props = { 
  data?: CategorySummary[];
  onReload?: () => void;
};

const Categories: React.FC<Props> = ({ data, onReload }) => {
  const categories = data || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategorySummary | undefined>();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    category?: CategorySummary;
  }>({ open: false });

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    
    const searchLower = searchTerm.toLowerCase();
    return categories.filter((category: CategorySummary) => 
      category.name.toLowerCase().includes(searchLower) ||
      (category.description && category.description.toLowerCase().includes(searchLower))
    );
  }, [categories, searchTerm]);

  const handleAddCategory = () => {
    setEditingCategory(undefined);
    setModalOpen(true);
  };

  const handleEditCategory = (category: CategorySummary) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleDeleteCategory = (category: CategorySummary) => {
    setConfirmDialog({ open: true, category });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.category) return;

    try {
      await categoryApi.delete(confirmDialog.category.id.toString());

      if (confirmDialog.category.imageUrl) {
        try {
          await imageUploadService.deleteImage(confirmDialog.category.imageUrl);
        } catch (imageError) {
          console.error('Error deleting category image:', imageError);
        }
      }

      toast.success('Xóa danh mục thành công!');
      onReload?.();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Có lỗi xảy ra khi xóa danh mục. Vui lòng thử lại.');
    } finally {
      setConfirmDialog({ open: false });
    }
  };

  const handleModalSuccess = () => {
    onReload?.();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-800">Quản lý danh mục</h2>
        <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow" onClick={handleAddCategory}>
          <Plus className="w-4 h-4" />
          <span>Thêm danh mục</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc mô tả danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category: CategorySummary) => (
            <div key={category.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {category.imageUrl ? (
                    <img 
                      src={category.imageUrl} 
                      alt={category.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <FolderTree className={`w-6 h-6 text-purple-600 ${category.imageUrl ? 'hidden' : ''}`} />
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" onClick={() => handleEditCategory(category)}>
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={() => handleDeleteCategory(category)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-zinc-800 mb-2">{category.name}</h3>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Mô tả:</strong> {category.description || 'Chưa có mô tả'}
              </p>
              <p className="text-sm text-gray-500">Trạng thái: {(category as any).status || (category.active ? 'Hoạt động' : 'Không hoạt động')}</p>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            {searchTerm ? 'Không tìm thấy danh mục phù hợp' : 'Chưa có danh mục nào'}
          </div>
        )}
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        category={editingCategory}
        onSuccess={handleModalSuccess}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Xác nhận xóa danh mục"
        message={`Bạn có chắc chắn muốn xóa danh mục "${confirmDialog.category?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ open: false })}
      />
    </div>
  );
};

export default Categories;

export async function loadData() {
  try {
    const result = await categoryApi.getAllForAdmin();
    return (result as any).content || result;
  } catch (error) {
    return [];
  }
}

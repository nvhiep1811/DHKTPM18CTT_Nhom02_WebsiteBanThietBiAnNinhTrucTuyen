import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Tag, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { brandApi } from '../../utils/api';
import type { Brand } from '../../types/types';
import BrandModal from '../../components/admin-modal/BrandModal';
import ConfirmDialog from '../../components/ConfirmDialog';

type Props = { 
  data?: { content: Brand[]; page: { totalPages: number; totalElements: number } };
  onReload?: () => void;
};

const Brands: React.FC<Props> = ({ data, onReload }) => {
  const brands = data?.content || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | undefined>();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    brand?: Brand;
  }>({ open: false });

  const filteredBrands = useMemo(() => {
    if (!searchTerm.trim()) return brands;
    
    const searchLower = searchTerm.toLowerCase();
    return brands.filter((brand: Brand) => 
      brand.name.toLowerCase().includes(searchLower)
    );
  }, [brands, searchTerm]);

  const handleAddBrand = () => {
    setEditingBrand(undefined);
    setModalOpen(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setModalOpen(true);
  };

  const handleDeleteBrand = (brand: Brand) => {
    setConfirmDialog({ open: true, brand });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.brand) return;

    try {
      await brandApi.delete(confirmDialog.brand.id.toString());
      toast.success('Xóa thương hiệu thành công!');
      onReload?.();
    } catch (error) {
      console.error('Error deleting brand:', error);
      alert('Có lỗi xảy ra khi xóa thương hiệu. Vui lòng thử lại.');
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
        <h2 className="text-2xl font-bold text-zinc-800">Quản lý thương hiệu</h2>
        <button className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow" onClick={handleAddBrand}>
          <Plus className="w-4 h-4" />
          <span>Thêm thương hiệu</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên thương hiệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBrands.length > 0 ? (
          filteredBrands.map((brand: Brand) => (
            <div key={brand.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <Tag className="w-6 h-6 text-cyan-600" />
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors" onClick={() => handleEditBrand(brand)}>
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={() => handleDeleteBrand(brand)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-zinc-800 mb-2">{brand.name}</h3>
              <p className="text-sm text-gray-500">{brand.productCount || 0} sản phẩm</p>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            {searchTerm ? 'Không tìm thấy thương hiệu phù hợp' : 'Chưa có thương hiệu nào'}
          </div>
        )}
      </div>

      {/* Brand Modal */}
      <BrandModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        brand={editingBrand}
        onSuccess={handleModalSuccess}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Xác nhận xóa thương hiệu"
        message={`Bạn có chắc chắn muốn xóa thương hiệu "${confirmDialog.brand?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ open: false })}
      />
    </div>
  );
};

export default Brands;

export async function loadData() {
  try {
    const result = await brandApi.getAll({ page: 0, size: 100 });
    return result;
  } catch (error) {
    console.error('Error loading brands:', error);
    return { content: [], page: { totalPages: 0, totalElements: 0 } };
  }
}

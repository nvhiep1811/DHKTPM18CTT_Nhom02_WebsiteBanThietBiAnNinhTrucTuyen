import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import type { ProductSummary } from '../../types/types';
import { productApi } from '../../utils/api';
import ProductModal from '../../components/admin-modal/ProductModal';
import { toast } from 'react-toastify';
import ConfirmDialog from '../../components/ConfirmDialog';

type Props = { 
  data?: ProductSummary[];
  onReload?: () => void;
};

const Products: React.FC<Props> = ({ data, onReload }) => {
  const products = data || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; productId: string | null }>({
    isOpen: false,
    productId: null,
  });

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = async (productId: string) => {
    try {
      const productDetail = await productApi.getById(productId);
      setSelectedProduct(productDetail as any);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Không thể tải thông tin sản phẩm');
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setDeleteConfirm({ isOpen: true, productId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.productId) return;

    try {
      await productApi.delete(deleteConfirm.productId);
      toast.success('Xóa sản phẩm thành công!');
      onReload?.();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Không thể xóa sản phẩm');
    } finally {
      setDeleteConfirm({ isOpen: false, productId: null });
    }
  };

  const handleModalSuccess = () => {
    onReload?.();
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      return products;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    return products.filter((product: ProductSummary) => {
      const nameMatch = product.name.toLowerCase().includes(searchLower);
      const skuMatch = product.sku.toLowerCase().includes(searchLower);
      const categoryMatch = product.category?.name.toLowerCase().includes(searchLower);
      const brandMatch = product.brand?.name.toLowerCase().includes(searchLower);
      
      return nameMatch || skuMatch || categoryMatch || brandMatch;
    });
  }, [products, searchTerm]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-800">Quản lý sản phẩm</h2>
        <button 
          onClick={handleAddProduct}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, SKU, danh mục, thương hiệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sản phẩm</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Danh mục</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Thương hiệu</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Giá niêm yết</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Giá bán</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tồn kho</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Đánh giá</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product: ProductSummary) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 max-w-[280px]">
                        <img 
                          src={product.thumbnailUrl} 
                          alt={product.name} 
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200 flex-shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.category?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {product.brand ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {product.brand.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Chưa có</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {product.listedPrice > 0 ? (
                        <div>
                          <div className="line-through text-xs">{product.listedPrice.toLocaleString()} ₫</div>
                          {product.listedPrice > product.price && (
                            <div className="text-xs text-red-600 font-medium">
                              -{Math.round((1 - product.price / product.listedPrice) * 100)}%
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {product.price.toLocaleString()} ₫
                    </td>
                    <td className="px-4 py-4 text-sm whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.inStock ? `${product.availableStock || 0} sp` : 'Hết hàng'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium">{product.rating.toFixed(1)}</span>
                        <span className="text-gray-400 text-xs">({product.reviewCount})</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEditProduct(product.id)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có sản phẩm nào'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct as any}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm.isOpen}
        title="Xác nhận xóa sản phẩm"
        message="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, productId: null })}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
};

export default Products;

export async function loadData() {
  try {
    const response = await productApi.getAll({ page: 0, size: 100 });
    return response.content || [];
  } catch (error) {
    console.error('Failed to load products:', error);
    return [];
  }
}

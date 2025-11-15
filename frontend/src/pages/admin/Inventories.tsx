import React, { useState, useMemo } from 'react';
import { Package, Search, AlertTriangle, CheckCircle, Edit } from 'lucide-react';
import type { InventorySummary, ProductSummary } from '../../types/types';
import { InventoryApi, productApi } from '../../utils/api';
import InventoryModal from '../../components/admin-modal/InventoryModal';
import { toast } from 'react-toastify';

interface InventoriesProps {
  data: InventorySummary[] | null;
  onReload: () => void;
}

export const loadData = async () => {
  try {
    const [inventories, productsResponse] = await Promise.all([
      InventoryApi.getAll(),
      productApi.getAll()
    ]);
    const products = productsResponse?.content || [];
    return { inventories, products };
  } catch (error) {
    console.error('Error loading inventories:', error);
    toast.error('Không thể tải dữ liệu tồn kho');
    return { inventories: [], products: [] };
  }
};

const Inventories: React.FC<InventoriesProps> = ({ data, onReload }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInventory, setSelectedInventory] = useState<InventorySummary | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');

  const inventories = (data as any)?.inventories || [];
  const products: ProductSummary[] = (data as any)?.products || [];
  
  const inventoriesWithProducts = useMemo(() => {
    const productMap = new Map(products.map(p => [p.id, p]));
    return inventories.map((inv: any) => ({
      ...inv,
      product: productMap.get(inv.productId)
    })).filter((inv: any) => inv.product); 
  }, [inventories, products]);

  const filteredInventories = useMemo(() => {
    let filtered = inventoriesWithProducts;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((inv: any) => {
        if (!inv.product) return false;
        return (
          inv.product.name.toLowerCase().includes(searchLower) ||
          inv.product.sku.toLowerCase().includes(searchLower) ||
          inv.product.category?.name.toLowerCase().includes(searchLower) ||
          inv.product.brand?.name.toLowerCase().includes(searchLower)
        );
      });
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((inv: any) => {
        const available = inv.onHand - inv.reserved;
        if (filterStatus === 'out-of-stock') return available <= 0;
        if (filterStatus === 'low-stock') return available > 0 && available <= 10;
        if (filterStatus === 'in-stock') return available > 10;
        return true;
      });
    }

    return filtered;
  }, [inventoriesWithProducts, searchTerm, filterStatus]);

  const handleEdit = (inventory: InventorySummary) => {
    setSelectedInventory(inventory);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedInventory(null);
  };

  const handleSave = () => {
    onReload();
  };

  // Statistics
  const stats = useMemo(() => {
    const validInventories = inventoriesWithProducts;
    const totalProducts = validInventories.length;
    const inStock = validInventories.filter((inv: any) => inv.onHand - inv.reserved > 10).length;
    const lowStock = validInventories.filter((inv: any) => {
      const available = inv.onHand - inv.reserved;
      return available > 0 && available <= 10;
    }).length;
    const outOfStock = validInventories.filter((inv: any) => inv.onHand - inv.reserved <= 0).length;
    const totalOnHand = validInventories.reduce((sum: number, inv: any) => sum + inv.onHand, 0);
    const totalReserved = validInventories.reduce((sum: number, inv: any) => sum + inv.reserved, 0);

    return { totalProducts, inStock, lowStock, outOfStock, totalOnHand, totalReserved };
  }, [inventoriesWithProducts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-7 h-7 text-purple-600" />
            Quản Lý Tồn Kho
          </h2>
          <p className="text-gray-600 mt-1">Theo dõi và điều chỉnh số lượng tồn kho</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
          <p className="text-blue-100 text-sm font-medium">Tổng sản phẩm</p>
          <p className="text-3xl font-bold mt-1">{stats.totalProducts}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
          <p className="text-green-100 text-sm font-medium">Còn hàng</p>
          <p className="text-3xl font-bold mt-1">{stats.inStock}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
          <p className="text-orange-100 text-sm font-medium">Sắp hết</p>
          <p className="text-3xl font-bold mt-1">{stats.lowStock}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
          <p className="text-red-100 text-sm font-medium">Hết hàng</p>
          <p className="text-3xl font-bold mt-1">{stats.outOfStock}</p>
        </div>
      </div>

      {/* Total Stock Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-cyan-50 rounded-xl p-6 border border-purple-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 font-medium">Tổng tồn kho</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">{stats.totalOnHand.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Đã đặt hàng</p>
            <p className="text-3xl font-bold text-orange-600 mt-1">{stats.totalReserved.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Khả dụng</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {(stats.totalOnHand - stats.totalReserved).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm theo tên, SKU, danh mục, thương hiệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterStatus('in-stock')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'in-stock'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Còn hàng
          </button>
          <button
            onClick={() => setFilterStatus('low-stock')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'low-stock'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sắp hết
          </button>
          <button
            onClick={() => setFilterStatus('out-of-stock')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'out-of-stock'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Hết hàng
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Sản phẩm</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Danh mục</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Thương hiệu</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Tồn kho</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Đã đặt</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Khả dụng</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Trạng thái</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInventories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">Không tìm thấy dữ liệu</p>
                  </td>
                </tr>
              ) : (
                filteredInventories.map((inventory) => {
                  if (!inventory.product) return null;
                  
                  const available = inventory.onHand - inventory.reserved;
                  let statusBadge;
                  if (available <= 0) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        <AlertTriangle className="w-3 h-3" />
                        Hết hàng
                      </span>
                    );
                  } else if (available <= 10) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        <AlertTriangle className="w-3 h-3" />
                        Sắp hết
                      </span>
                    );
                  } else {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Còn hàng
                      </span>
                    );
                  }

                  return (
                    <tr key={inventory.product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={inventory.product.thumbnailUrl}
                            alt={inventory.product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 line-clamp-2">
                              {inventory.product.name}
                            </p>
                            <p className="text-xs text-gray-500">{inventory.product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {inventory.product.category.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {inventory.product.brand?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-blue-600">{inventory.onHand}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-orange-600">{inventory.reserved}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-semibold ${available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {available}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">{statusBadge}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(inventory)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Điều chỉnh tồn kho"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <InventoryModal
          inventory={selectedInventory}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Inventories;

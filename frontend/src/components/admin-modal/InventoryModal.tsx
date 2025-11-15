import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { InventoryApi } from '../../utils/api';
import { toast } from 'react-toastify';
import type { InventorySummary } from '../../types/types';

interface InventoryModalProps {
  inventory: InventorySummary | null;
  onClose: () => void;
  onSave: () => void;
}

const InventoryModal: React.FC<InventoryModalProps> = ({ inventory, onClose, onSave }) => {
  const [quantityChange, setQuantityChange] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuantityChange(0);
  }, [inventory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inventory || quantityChange === 0) {
      toast.warning('Vui lòng nhập số lượng thay đổi');
      return;
    }

    try {
      setLoading(true);
      await InventoryApi.updateStock(inventory.product.id, quantityChange);
      toast.success('Cập nhật tồn kho thành công');
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error updating inventory:', error);
      toast.error(error.response?.data?.message || 'Cập nhật tồn kho thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (!inventory) return null;

  const newOnHand = inventory.onHand + quantityChange;
  const newAvailable = newOnHand - inventory.reserved;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-cyan-500 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-2xl font-bold">Điều Chỉnh Tồn Kho</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex gap-4">
              <img
                src={inventory.product.thumbnailUrl}
                alt={inventory.product.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{inventory.product.name}</h3>
                <p className="text-sm text-gray-600">SKU: {inventory.product.sku}</p>
                <p className="text-sm text-gray-600">
                  {inventory.product.category.name}
                  {inventory.product.brand && ` • ${inventory.product.brand.name}`}
                </p>
              </div>
            </div>
          </div>

          {/* Current Stock Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Tồn kho</p>
              <p className="text-2xl font-bold text-blue-600">{inventory.onHand}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Đã đặt</p>
              <p className="text-2xl font-bold text-orange-600">{inventory.reserved}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Khả dụng</p>
              <p className="text-2xl font-bold text-green-600">{inventory.onHand - inventory.reserved}</p>
            </div>
          </div>

          {/* Quantity Change Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số lượng thay đổi <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setQuantityChange(prev => prev - 10)}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium"
              >
                -10
              </button>
              <button
                type="button"
                onClick={() => setQuantityChange(prev => prev - 1)}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium"
              >
                -1
              </button>
              <input
                type="number"
                value={quantityChange}
                onChange={(e) => setQuantityChange(parseInt(e.target.value) || 0)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-xl font-bold"
                placeholder="0"
              />
              <button
                type="button"
                onClick={() => setQuantityChange(prev => prev + 1)}
                className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors font-medium"
              >
                +1
              </button>
              <button
                type="button"
                onClick={() => setQuantityChange(prev => prev + 10)}
                className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors font-medium"
              >
                +10
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Nhập số dương để nhập kho, số âm để xuất kho
            </p>
          </div>

          {/* Preview New Stock */}
          {quantityChange !== 0 && (
            <div className={`rounded-lg p-4 ${quantityChange > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className="text-sm font-medium text-gray-700 mb-2">Sau khi cập nhật:</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tồn kho mới</p>
                  <p className={`text-xl font-bold ${quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {inventory.onHand} → {newOnHand}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Khả dụng mới</p>
                  <p className={`text-xl font-bold ${quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {inventory.onHand - inventory.reserved} → {newAvailable}
                  </p>
                </div>
              </div>
              {newAvailable < 0 && (
                <p className="text-red-600 text-sm mt-2 font-medium">
                  ⚠️ Cảnh báo: Số lượng khả dụng sẽ âm sau khi cập nhật!
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || quantityChange === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-lg hover:from-purple-700 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryModal;

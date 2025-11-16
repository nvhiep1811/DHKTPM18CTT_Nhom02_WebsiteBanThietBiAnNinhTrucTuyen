import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Shield, Clock, CheckCircle, Calendar, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { WarrantyRequestApi } from '../../utils/api';
import type { WarrantyRequest } from '../../types/types';

interface WarrantyRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  warrantyRequest?: WarrantyRequest;
  onSuccess: () => void;
}

const WarrantyRequestModal: React.FC<WarrantyRequestModalProps> = ({
  isOpen,
  onClose,
  warrantyRequest,
  onSuccess,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    if (isOpen && warrantyRequest) {
      setSelectedStatus(warrantyRequest.status);
    }
  }, [isOpen, warrantyRequest]);

  const handleStatusUpdate = async () => {
    if (!warrantyRequest || !selectedStatus || selectedStatus === warrantyRequest.status) return;

    setIsUpdating(true);
    try {
      if (selectedStatus === 'ACCEPTED') {
        await WarrantyRequestApi.approveWarrantyRequest(warrantyRequest.id);
      } else if (selectedStatus === 'REJECTED') {
        await WarrantyRequestApi.rejectWarrantyRequest(warrantyRequest.id);
      } else if (selectedStatus === 'REPAIRED' || selectedStatus === 'REPLACED' || selectedStatus === 'RETURNED') {
        await WarrantyRequestApi.resolveWarrantyRequest(warrantyRequest.id);
      } else {
        await WarrantyRequestApi.updateWarrantyRequest(warrantyRequest.id, { status: selectedStatus });
      }
      toast.success('Cập nhật trạng thái thành công!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusOptions = () => {
    return [
      { value: 'SUBMITTED', label: 'Đã gửi' },
      { value: 'ACCEPTED', label: 'Đã chấp nhận' },
      { value: 'REJECTED', label: 'Từ chối' },
      { value: 'REPAIRED', label: 'Đã sửa chữa' },
      { value: 'REPLACED', label: 'Đã thay thế' },
      { value: 'RETURNED', label: 'Đã trả lại' },
    ];
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      SUBMITTED: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
      ACCEPTED: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', icon: X },
      REPAIRED: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      REPLACED: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      RETURNED: { bg: 'bg-gray-100', text: 'text-gray-700', icon: CheckCircle },
    };
    const config = statusConfig[status] || statusConfig.SUBMITTED;
    const Icon = config.icon;
    const option = getStatusOptions().find(opt => opt.value === status);
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4" />
        {option?.label || status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (!isOpen || !warrantyRequest) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-500">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Chi tiết Yêu cầu Bảo hành
              </h2>
              <p className="text-sm text-gray-500">#{warrantyRequest.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Update */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Trạng thái:</span>
              {getStatusBadge(warrantyRequest.status)}
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {getStatusOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={isUpdating || selectedStatus === warrantyRequest.status}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Cập nhật
              </button>
            </div>
          </div>

          {/* Warranty Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Chi tiết yêu cầu bảo hành</span>
            </div>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-sm">Vấn đề:</span>
                <p className="text-sm text-gray-700 mt-1">{warrantyRequest.issueType}</p>
              </div>
              <div>
                <span className="font-medium text-sm">Mô tả:</span>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{warrantyRequest.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Sản phẩm:</span>
                  <p className="text-gray-700">{warrantyRequest.product?.name || 'N/A'}</p>
                  <p className="text-gray-500 text-xs">SKU: {warrantyRequest.product?.sku || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium">Số lượng:</span>
                  <p className="text-gray-700">{warrantyRequest.quantity}</p>
                  <p className="text-gray-500 text-xs">Đơn giá: {warrantyRequest.unitPrice.toLocaleString('vi-VN')}₫</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Yêu cầu: {formatDate(warrantyRequest.requestedAt)}
                </span>
                {warrantyRequest.resolvedAt && (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Giải quyết: {formatDate(warrantyRequest.resolvedAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarrantyRequestModal;

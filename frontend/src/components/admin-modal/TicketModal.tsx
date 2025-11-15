import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, MessageSquare, Clock, CheckCircle, User, Calendar, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { SupportTicketApi, userApi } from '../../utils/api';
import type { SupportTicket } from '../../types/types';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket?: SupportTicket;
  onSuccess: () => void;
}

const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onSuccess,
}) => {
  const [userName, setUserName] = useState<string>('Đang tải...');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    if (isOpen && ticket) {
      setSelectedStatus(ticket.status);
      loadUserName(ticket.userId);
    }
  }, [isOpen, ticket]);

  const loadUserName = async (userId: string) => {
    try {
      const user = await userApi.getUserById(userId);
      setUserName(user.name || user.email || 'Không rõ');
    } catch (error) {
      console.error('Error loading user name:', error);
      setUserName('Không thể tải tên người dùng');
    }
  };

  const handleStatusUpdate = async () => {
    if (!ticket || !selectedStatus || selectedStatus === ticket.status) return;

    setIsUpdating(true);
    try {
      await SupportTicketApi.updateTicketStatus(ticket.id, selectedStatus);
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
      { value: 'OPEN', label: 'Mới' },
      { value: 'IN_PROGRESS', label: 'Đang xử lý' },
      { value: 'RESOLVED', label: 'Đã giải quyết' },
      { value: 'CLOSED', label: 'Đã đóng' },
    ];
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      OPEN: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
      IN_PROGRESS: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Clock },
      RESOLVED: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      CLOSED: { bg: 'bg-gray-100', text: 'text-gray-700', icon: CheckCircle },
      SUBMITTED: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
      ACCEPTED: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', icon: X },
      REPAIRED: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      REPLACED: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      RETURNED: { bg: 'bg-gray-100', text: 'text-gray-700', icon: CheckCircle },
    };
    const config = statusConfig[status] || statusConfig.OPEN;
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

  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-500 to-cyan-500">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Chi tiết Ticket Hỗ trợ
              </h2>
              <p className="text-sm text-gray-500">#{ticket.id}</p>
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
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Trạng thái:</span>
              {getStatusBadge(ticket.status)}
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {getStatusOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={isUpdating || selectedStatus === ticket.status}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Cập nhật
              </button>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <User className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Thông tin khách hàng</span>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Tên người dùng:</span> {userName}</p>
              <p className="text-gray-500 text-xs">User ID: {ticket.userId}</p>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Nội dung ticket</span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.content}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Tạo: {formatDate(ticket.createdAt)}
                  </span>
                </div>
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

export default TicketModal;

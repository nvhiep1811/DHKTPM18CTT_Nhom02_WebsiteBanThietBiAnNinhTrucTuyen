import React, { useState, useMemo } from 'react';
import { MessageSquare, Clock, CheckCircle, AlertCircle, Shield, Search } from 'lucide-react';
import { SupportTicketApi, WarrantyRequestApi, userApi } from '../../utils/api';
import type { SupportTicket, WarrantyRequest } from '../../types/types';
import TicketModal from '../../components/admin-modal/TicketModal';
import WarrantyRequestModal from '../../components/admin-modal/WarrantyRequestModal';

const Tickets: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'warranty'>('tickets');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [warrantyRequests, setWarrantyRequests] = useState<WarrantyRequest[]>([]);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [selectedWarrantyRequest, setSelectedWarrantyRequest] = useState<WarrantyRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'all' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('all');
  const [warrantyStatusFilter, setWarrantyStatusFilter] = useState<'all' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'REPAIRED' | 'REPLACED' | 'RETURNED'>('all');

  const filteredTickets = useMemo(() => {
    let filtered = tickets;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((ticket: SupportTicket) => 
        ticket.title.toLowerCase().includes(searchLower) ||
        ticket.subject.toLowerCase().includes(searchLower) ||
        ticket.content.toLowerCase().includes(searchLower) ||
        userNames[ticket.userId]?.toLowerCase().includes(searchLower)
      );
    }

    if (ticketStatusFilter !== 'all') {
      filtered = filtered.filter((ticket: SupportTicket) => ticket.status === ticketStatusFilter);
    }

    return filtered;
  }, [tickets, searchTerm, ticketStatusFilter, userNames]);

  const filteredWarrantyRequests = useMemo(() => {
    let filtered = warrantyRequests;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((request: WarrantyRequest) => 
        request.product?.name.toLowerCase().includes(searchLower) ||
        request.product?.sku.toLowerCase().includes(searchLower) ||
        request.issueType.toLowerCase().includes(searchLower) ||
        request.description.toLowerCase().includes(searchLower)
      );
    }

    if (warrantyStatusFilter !== 'all') {
      filtered = filtered.filter((request: WarrantyRequest) => request.status === warrantyStatusFilter);
    }

    return filtered;
  }, [warrantyRequests, searchTerm, warrantyStatusFilter]);

  React.useEffect(() => {
    if (activeTab === 'tickets') {
      loadTickets();
    } else {
      loadWarrantyRequests();
    }
  }, [activeTab]);

  // Hàm tìm tên người dùng theo userId
  const fetchUserNames = async (userIds: string[]) => {
    const names: Record<string, string> = {};
    const uniqueIds = [...new Set(userIds)];

    for (const userId of uniqueIds) {
      if (!userNames[userId]) {
        try {
          const user = await userApi.getUserById(userId);
          names[userId] = user.name;
        } catch (error) {
          console.error(`Error fetching user ${userId}:`, error);
          names[userId] = 'N/A';
        }
      }
    }

    if (Object.keys(names).length > 0) {
      setUserNames(prev => ({ ...prev, ...names }));
    }
  };


  const loadTickets = async () => {
    setLoading(true);
    try {
      const response = await SupportTicketApi.getAllTickets();
      const ticketData = response.content || response;
      setTickets(ticketData);

      // Fetch user names for tickets
      const userIds = ticketData.map((ticket: SupportTicket) => ticket.userId).filter(Boolean);
      if (userIds.length > 0) {
        await fetchUserNames(userIds);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const loadWarrantyRequests = async () => {
    setLoading(true);
    try {
      const response = await WarrantyRequestApi.getAllWarrantyRequests();
      const warrantyData = response.content || response;
      setWarrantyRequests(warrantyData);
    
    } catch (error) {
      console.error('Error loading warranty requests:', error);
      setWarrantyRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const getTicketStatusBadge = (status: string) => {
    const config: any = {
      OPEN: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock, label: 'Mới' },
      IN_PROGRESS: { bg: 'bg-purple-100', text: 'text-purple-700', icon: AlertCircle, label: 'Đang xử lý' },
      RESOLVED: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Đã giải quyết' },
      CLOSED: { bg: 'bg-gray-100', text: 'text-gray-700', icon: CheckCircle, label: 'Đã đóng' },
    };
    const c = config[status] || config.OPEN;
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        <Icon className="w-3 h-3" />
        {c.label}
      </span>
    );
  };

  const getWarrantyStatusBadge = (status: string) => {
    const config: any = {
      SUBMITTED: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock, label: 'Đã gửi' },
      ACCEPTED: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertCircle, label: 'Đã chấp nhận' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle, label: 'Từ chối' },
      REPAIRED: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Đã sửa chữa' },
      REPLACED: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Đã thay thế' },
      RETURNED: { bg: 'bg-gray-100', text: 'text-gray-700', icon: CheckCircle, label: 'Đã trả lại' },
    };
    const c = config[status] || config.SUBMITTED;
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        <Icon className="w-3 h-3" />
        {c.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setSelectedWarrantyRequest(null);
    setIsModalOpen(true);
  };

  const handleViewWarrantyRequest = (request: WarrantyRequest) => {
    setSelectedWarrantyRequest(request);
    setSelectedTicket(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
    setSelectedWarrantyRequest(null);
  };

  const handleModalSuccess = () => {
    if (activeTab === 'tickets') {
      loadTickets();
    } else {
      loadWarrantyRequests();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-800">Quản lý hỗ trợ</h2>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={activeTab === 'tickets' ? 'Tìm kiếm ticket theo tiêu đề, nội dung, khách hàng...' : 'Tìm kiếm yêu cầu bảo hành theo sản phẩm, vấn đề...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        {activeTab === 'tickets' ? (
          <select
            value={ticketStatusFilter}
            onChange={(e) => setTicketStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="OPEN">Mới</option>
            <option value="IN_PROGRESS">Đang xử lý</option>
            <option value="RESOLVED">Đã giải quyết</option>
            <option value="CLOSED">Đã đóng</option>
          </select>
        ) : (
          <select
            value={warrantyStatusFilter}
            onChange={(e) => setWarrantyStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="SUBMITTED">Đã gửi</option>
            <option value="ACCEPTED">Đã chấp nhận</option>
            <option value="REJECTED">Từ chối</option>
            <option value="REPAIRED">Đã sửa chữa</option>
            <option value="REPLACED">Đã thay thế</option>
            <option value="RETURNED">Đã trả lại</option>
          </select>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'tickets'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Ticket hỗ trợ
        </button>
        <button
          onClick={() => setActiveTab('warranty')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'warranty'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Shield className="w-4 h-4 inline mr-2" />
          Yêu cầu bảo hành
        </button>
      </div>

      {/* Content */}
      {activeTab === 'tickets' ? (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Đang tải...</div>
          ) : filteredTickets.length > 0 ? (
            filteredTickets.map((ticket: SupportTicket) => (
              <div key={ticket.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-zinc-800">{ticket.title} - {ticket.subject}</h3>
                        {getTicketStatusBadge(ticket.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{ticket.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Khách hàng: {userNames[ticket.userId] || 'N/A'}</span>
                        <span>•</span>
                        <span>{formatDate(ticket.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleViewTicket(ticket)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              {searchTerm || ticketStatusFilter !== 'all' ? 'Không tìm thấy ticket phù hợp' : 'Chưa có ticket hỗ trợ nào'}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Đang tải...</div>
          ) : filteredWarrantyRequests.length > 0 ? (
            filteredWarrantyRequests.map((request: WarrantyRequest) => (
              <div key={request.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-zinc-800">#{request.id} - {request.product?.name || 'N/A'}</h3>
                        {getWarrantyStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Vấn đề:</strong> {request.issueType}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">{request.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">x
                        <span>Sản phẩm: {request.product?.sku || 'N/A'}</span>
                        <span>•</span>
                        <span>Số lượng: {request.quantity}</span>
                        <span>•</span>
                        <span>{formatDate(request.requestedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleViewWarrantyRequest(request)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              {searchTerm || warrantyStatusFilter !== 'all' ? 'Không tìm thấy yêu cầu bảo hành phù hợp' : 'Chưa có yêu cầu bảo hành nào'}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <TicketModal
        isOpen={isModalOpen && !!selectedTicket}
        onClose={handleCloseModal}
        ticket={selectedTicket || undefined}
        onSuccess={handleModalSuccess}
      />
      <WarrantyRequestModal
        isOpen={isModalOpen && !!selectedWarrantyRequest}
        onClose={handleCloseModal}
        warrantyRequest={selectedWarrantyRequest || undefined}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default Tickets;

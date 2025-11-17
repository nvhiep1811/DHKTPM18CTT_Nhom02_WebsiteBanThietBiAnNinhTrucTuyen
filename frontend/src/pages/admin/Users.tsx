import React, { useState, useMemo } from 'react';
import { Search, Trash2, Shield, User as UserIcon, Power, PowerOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { userApi } from '../../utils/api';
import type { UserSummary } from '../../types/types';
import ConfirmDialog from '../../components/ConfirmDialog';

type Props = { 
  data?: UserSummary[];
  onReload?: () => void;
};

const Users: React.FC<Props> = ({ data, onReload }) => {
  const users = data || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'Admin' | 'User'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user?: UserSummary;
  }>({ open: false });
  const [userDetailModal, setUserDetailModal] = useState<{
    open: boolean;
    user?: UserSummary;
    loading: boolean;
  }>({ open: false, loading: false });

  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Tìm kiếm theo tên, email, phone
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((user: UserSummary) => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.phone && user.phone.toLowerCase().includes(searchLower))
      );
    }

    // Lọc theo vai trò - hỗ trợ nhiều format: Admin/ADMIN/ROLE_ADMIN
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user: UserSummary) => {
        const userRole = user.role?.toUpperCase() || '';
        const filterRole = roleFilter.toUpperCase();
        return userRole === filterRole || 
               userRole === `ROLE_${filterRole}` || 
               userRole.includes(filterRole);
      });
    }

    // Lọc theo trạng thái
    if (statusFilter !== 'all') {
      filtered = filtered.filter((user: UserSummary) => {
        if (statusFilter === 'enabled') return user.enabled;
        if (statusFilter === 'disabled') return !user.enabled;
        return true;
      });
    }

    return filtered;
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleToggleUserStatus = async (user: UserSummary) => {
    try {
      if (user.enabled) {
        await userApi.disableUser(user.id);
        toast.success(`Đã khóa tài khoản của ${user.name}`);
      } else {
        await userApi.enableUser(user.id);
        toast.success(`Đã kích hoạt tài khoản của ${user.name}`);
      }
      onReload?.();
    } catch {
      toast.error('Có lỗi xảy ra khi thay đổi trạng thái tài khoản');
    }
  };

  const handleDeleteUser = (user: UserSummary) => {
    setConfirmDialog({ open: true, user });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.user) return;

    try {
      await userApi.deleteUser(confirmDialog.user.id);
      toast.success(`Đã khóa tài khoản của ${confirmDialog.user.name}`);
      setConfirmDialog({ open: false });
      onReload?.();
    } catch {
      toast.error('Có lỗi xảy ra khi xóa tài khoản');
    }
  };

  const handleViewUserDetail = async (user: UserSummary) => {
    setUserDetailModal({ open: true, user, loading: true });
    
    try {
      setUserDetailModal({ open: true, user, loading: false });
    } catch (error) {
      console.error('Error loading user details:', error);
      toast.error('Không thể tải thông tin chi tiết người dùng');
      setUserDetailModal({ open: false, loading: false });
    }
  };

  const handleCloseUserDetail = () => {
    setUserDetailModal({ open: false, loading: false });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-800">Quản lý người dùng</h2>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as 'all' | 'Admin' | 'User')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="Admin">Admin</option>
          <option value="User">User</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'enabled' | 'disabled')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="enabled">Hoạt động</option>
          <option value="disabled">Khóa</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tên</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Số điện thoại</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vai trò</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div 
                      className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 rounded-lg p-2 -m-2 transition-colors"
                      onClick={() => handleViewUserDetail(user)}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center overflow-hidden">
                        {user.avatarUrl ? (
                          <img 
                            src={user.avatarUrl} 
                            alt={user.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <UserIcon className={`w-4 h-4 text-white ${user.avatarUrl ? 'hidden' : ''}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.phone || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'Admin' ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      user.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.enabled ? 'Hoạt động' : 'Khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleToggleUserStatus(user)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.enabled 
                            ? 'text-red-600 hover:bg-red-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={user.enabled ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                      >
                        {user.enabled ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa tài khoản"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? 'Không tìm thấy người dùng phù hợp' : 'Chưa có người dùng nào'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Xác nhận xóa tài khoản"
        message={`Bạn có chắc chắn muốn khóa tài khoản "${confirmDialog.user?.name}"? Tài khoản sẽ bị vô hiệu hóa.`}
        confirmText="Khóa tài khoản"
        cancelText="Hủy"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ open: false })}
      />

      {/* User Detail Modal */}
      {userDetailModal.open && userDetailModal.user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-zinc-800">Chi tiết người dùng</h3>
              <button
                onClick={handleCloseUserDetail}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {userDetailModal.loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center overflow-hidden">
                      {userDetailModal.user.avatarUrl ? (
                        <img 
                          src={userDetailModal.user.avatarUrl} 
                          alt={userDetailModal.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">{userDetailModal.user.name}</h4>
                      <p className="text-sm text-gray-600">{userDetailModal.user.email}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">ID:</span>
                      <span className="text-sm text-gray-900 font-mono">{userDetailModal.user.id}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Email:</span>
                      <span className="text-sm text-gray-900">{userDetailModal.user.email}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Số điện thoại:</span>
                      <span className="text-sm text-gray-900">{userDetailModal.user.phone || 'Chưa cập nhật'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Vai trò:</span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        userDetailModal.user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {userDetailModal.user.role === 'Admin' ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                        {userDetailModal.user.role}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-gray-600">Trạng thái:</span>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        userDetailModal.user.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {userDetailModal.user.enabled ? 'Hoạt động' : 'Khóa'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={handleCloseUserDetail}
                className="px-4 py-2 text-zinc-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

export async function loadData() {
  try {
    const result = await userApi.getAllUsers();
    return (result as any).content || result;
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
}

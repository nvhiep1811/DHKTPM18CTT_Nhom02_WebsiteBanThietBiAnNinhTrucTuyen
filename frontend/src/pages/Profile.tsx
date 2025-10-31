import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { logout, restoreAuthSuccess } from '../stores/authSlice';
import { toast } from 'react-toastify';
import { userApi } from '../utils/api';
import axiosInstance from '../utils/axiosConfig';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // Login/out redirect
  useEffect(() => {
    if (!user || user.role === "guest") navigate('/login');
    setUserEmail(user?.email || null);
  }, [navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // Profile
  const [formData, setFormData] = useState({
    id: user?.id || '',
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await userApi.updateProfile(formData);
      toast.success("Cập nhật thông tin cá nhân thành công!");

      const response = await axiosInstance.get("/auth/me");
      const updatedUser = response.data;

      const token = localStorage.getItem("accessToken");
      if (token) {
        dispatch(restoreAuthSuccess({ user: updatedUser, accessToken: token }));
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Update profile failed:", error);
      toast.error("Cập nhật thất bại, vui lòng thử lại!");
    }
  };

  // Change pass
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const currentPwdRef = useRef<HTMLInputElement>(null);
  const newPwdRef = useRef<HTMLInputElement>(null);
  const confirmPwdRef = useRef<HTMLInputElement>(null);

  const handlePwdInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPwdForm(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async () => {
    if (!pwdForm.currentPassword) {
      toast.error("Vui lòng nhập mật khẩu hiện tại!");
      currentPwdRef.current?.focus();
      return;
    }

    if (!pwdForm.newPassword) {
      toast.error("Vui lòng nhập mật khẩu mới!");
      newPwdRef.current?.focus();
      return;
    }

    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error("Mật khẩu mới không khớp!");
      confirmPwdRef.current?.focus();
      return;
    }

    try {
      await axiosInstance.post("/auth/change-password", {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });

      toast.success("Đổi mật khẩu thành công!");
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      currentPwdRef.current?.focus();
    } catch (error: any) {
      console.error("Change password failed:", error);
      if (error.response?.data) toast.error(error.response.data);
      else toast.error("Đổi mật khẩu thất bại, vui lòng thử lại!");
    }
  };

  const menu = [
    { key: 'account', label: 'Thông tin cá nhân' },
    { key: 'address', label: 'Địa chỉ' },
    { key: 'payment', label: 'Phương thức thanh toán' },
    { key: 'orders', label: 'Đơn hàng của tôi' },
    { key: 'password', label: 'Đổi mật khẩu' },
    { key: 'settings', label: 'Tùy chỉnh khác' },
  ];

  const sampleAddresses = [
    { id: 1, name: 'Nguyen Van A', phone: '0123456789', address: '123 Nguyen Trai, Quan 1, TP HCM', default: true },
    { id: 2, name: 'Tran Thi B', phone: '0987654321', address: '45 Le Loi, Quan 3, TP HCM', default: false }
  ];

  const samplePayments = [
    { id: 1, type: 'Visa', card: '**** **** **** 1234', default: true },
    { id: 2, type: 'Momo', card: 'SĐT: 0987 654 321', default: false }
  ];

  const sampleOrders = [
    { id: 'A12345', date: '2025-01-12', status: 'Đang giao', total: '2.500.000đ' },
    { id: 'B67890', date: '2025-01-03', status: 'Hoàn thành', total: '1.200.000đ' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <form onSubmit={handleFormSubmit}>
            <h2 className="text-xl font-semibold text-zinc-800 mb-4">Thông tin cá nhân</h2>
            <p className="text-gray-600 mb-2">Email: {userEmail}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input className="border p-2 rounded" value={formData.name} name="name" onChange={handleInputChange} placeholder="Họ tên" />
              <input className="border p-2 rounded" value={formData.phone} name="phone" onChange={handleInputChange} placeholder="Số điện thoại" />
              <input className="border p-2 rounded" placeholder="Ngày sinh" type="date" />
              <select className="border p-2 rounded">
                <option>Giới tính</option><option>Nam</option><option>Nữ</option><option>Khác</option>
              </select>
            </div>
            <button className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">Lưu thay đổi</button>
          </form>
        );

      case 'address':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Địa chỉ của tôi</h2>
            {sampleAddresses.map(addr => (
              <div key={addr.id} className="border rounded p-4 mb-3 bg-white shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-bold">{addr.name} ({addr.phone})</p>
                  <p className="text-gray-600 text-sm">{addr.address}</p>
                  {addr.default && <span className="text-purple-600 text-xs font-semibold">Mặc định</span>}
                </div>
                <button className="text-purple-600">Sửa</button>
              </div>
            ))}
            <button className="mt-3 bg-purple-500 text-white px-4 py-2 rounded">+ Thêm địa chỉ</button>
          </div>
        );

      case 'payment':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Phương thức thanh toán</h2>
            {samplePayments.map(pay => (
              <div key={pay.id} className="border rounded p-4 mb-3 bg-white shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-bold">{pay.type}</p>
                  <p className="text-gray-600 text-sm">{pay.card}</p>
                  {pay.default && <span className="text-purple-600 text-xs font-semibold">Mặc định</span>}
                </div>
                <button className="text-purple-600">Sửa</button>
              </div>
            ))}
            <button className="mt-3 bg-cyan-500 text-white px-4 py-2 rounded">+ Thêm phương thức</button>
          </div>
        );

      case 'orders':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Đơn hàng của tôi</h2>
            {sampleOrders.map(order => (
              <div key={order.id} className="border p-4 rounded bg-white shadow-sm mb-3">
                <div className="flex justify-between">
                  <p><span className="font-semibold">Mã đơn:</span> {order.id}</p>
                  <span className="text-sm text-gray-500">{order.date}</span>
                </div>
                <p className="mt-1 text-sm">Trạng thái: <span className="text-purple-600 font-semibold">{order.status}</span></p>
                <p className="mt-1 font-bold">Tổng tiền: {order.total}</p>
                <button className="mt-2 text-purple-600 text-sm">Xem chi tiết</button>
              </div>
            ))}
          </div>
        );

      case 'password':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Đổi mật khẩu</h2>
            <div className="space-y-3 max-w-md">
              <input
                ref={currentPwdRef}
                type="password"
                name="currentPassword"
                value={pwdForm.currentPassword}
                onChange={handlePwdInputChange}
                className="border p-2 rounded w-full"
                placeholder="Mật khẩu hiện tại"
              />
              <input
                ref={newPwdRef}
                type="password"
                name="newPassword"
                value={pwdForm.newPassword}
                onChange={handlePwdInputChange}
                className="border p-2 rounded w-full"
                placeholder="Mật khẩu mới"
              />
              <input
                ref={confirmPwdRef}
                type="password"
                name="confirmPassword"
                value={pwdForm.confirmPassword}
                onChange={handlePwdInputChange}
                className="border p-2 rounded w-full"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
            <button
              onClick={handleChangePassword}
              className="mt-4 bg-cyan-500 text-white px-6 py-2 rounded-lg hover:bg-cyan-600"
            >
              Đổi mật khẩu
            </button>
          </div>
        );

      case 'settings':
        return <h2 className="text-xl font-semibold mb-4">Tùy chỉnh khác</h2>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex gap-8 w-full">
        <aside className="w-64 border-r pr-4 hidden sm:block">
          <h3 className="text-lg font-bold text-zinc-700 mb-4">Tài khoản</h3>
          <ul className="space-y-2">
            {menu.map(m => (
              <li key={m.key}>
                <button 
                  onClick={() => setActiveTab(m.key)} 
                  className={`w-full text-left px-3 py-2 rounded hover:bg-purple-100 ${activeTab === m.key ? 'bg-purple-200 font-semibold' : 'text-gray-700'}`}
                >
                  {m.label}
                </button>
              </li>
            ))}
            <li>
              <button 
                onClick={handleLogout} 
                className="w-full text-left px-3 py-2 rounded text-red-600 hover:bg-red-100"
              >
                Đăng xuất
              </button>
            </li>
          </ul>
        </aside>

        {/* THAY ĐỔI Ở ĐÂY: Thêm class 'w-0' */}
        <section className="flex-1 w-0 bg-white rounded-xl shadow p-6 border">
          {renderContent()}
        </section>
      </main>

      <Footer />
    </div>
);
};

export default Profile;

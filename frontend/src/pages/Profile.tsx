import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { logout, restoreAuthSuccess } from '../stores/authSlice';
import { toast } from 'react-toastify';
import { userApi, AddressApi } from '../utils/api';
import axiosInstance from '../utils/axiosConfig';
import { authService } from '../utils/authService';
import { imageUploadService } from '../utils/imageUploadService';

interface Address {
  id: number;
  name: string;
  phone: string;
  street: string;
  ward: string;
  province: string;
  isDefault: boolean;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Login/out redirect
  useEffect(() => {
    if (!user || user.role === "guest") navigate('/login');
    setUserEmail(user?.email || null);
  }, [navigate, user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // Profile
  const [formData, setFormData] = useState({
    id: user?.id || '',
    name: user?.name || '',
    phone: user?.phone || '',
    avatarUrl: user?.avatarUrl || '',
  });

  // Update formData when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id || '',
        name: user.name || '',
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  // Avatar Upload Handler
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);

    try {
      const oldAvatarUrl = formData.avatarUrl;

      const result = await imageUploadService.uploadImage(file, {
        bucket: 'avatars',
        folder: 'users'
      });

      const updateData = {
        id: formData.id,
        name: formData.name,
        phone: formData.phone?.trim() || null,
        avatarUrl: result.url
      };

      await userApi.updateProfile(updateData);

      if (oldAvatarUrl) {
        try {
          await imageUploadService.deleteImage(oldAvatarUrl, 'avatars');
        } catch (deleteError) {
          console.error('Failed to delete old avatar:', deleteError);
        }
      }
      
      toast.success('Cập nhật ảnh đại diện thành công!');

      const response = await axiosInstance.get("/auth/me");
      const updatedUser = response.data;

      setFormData(prev => ({ ...prev, avatarUrl: result.url }));

      const token = localStorage.getItem("accessToken");
      if (token) {
        dispatch(restoreAuthSuccess({ user: updatedUser, accessToken: token }));
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (error: any) {
      console.error('Avatar upload failed:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (!error.message?.includes('File size') && !error.message?.includes('Only')) {
        toast.error('Tải ảnh lên thất bại, vui lòng thử lại!');
      }
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.phone) {
      const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
      if (!phoneRegex.test(formData.phone)) {
        toast.error("Số điện thoại không hợp lệ! (VD: 0901234567 hoặc +84901234567)");
        return;
      }
    }

    try {
      const dataToUpdate = {
        ...formData,
        phone: formData.phone?.trim() || null,
      };

      await userApi.updateProfile(dataToUpdate);
      toast.success("Cập nhật thông tin cá nhân thành công!");

      const response = await axiosInstance.get("/auth/me");
      const updatedUser = response.data;

      const token = localStorage.getItem("accessToken");
      if (token) {
        dispatch(restoreAuthSuccess({ user: updatedUser, accessToken: token }));
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (error: any) {
      console.error("Update profile failed:", error);
      const errorMsg = error.response?.data?.message || "Cập nhật thất bại, vui lòng thử lại!";
      toast.error(errorMsg);
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
      await authService.changePassword(pwdForm.currentPassword, pwdForm.newPassword);

      toast.success("Đổi mật khẩu thành công!");
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      currentPwdRef.current?.focus();
    } catch (error: any) {
      console.error("Change password failed:", error);
      if (error.response?.data) toast.error(error.response.data);
      else toast.error("Đổi mật khẩu thất bại, vui lòng thử lại!");
    }
  };

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    street: '',
    ward: '',
    province: '',
    isDefault: false,
  });
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Province API state
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const data = await AddressApi.getAll();
      setAddresses(data);
    } catch (error) {
      toast.error('Lỗi khi tải địa chỉ!');
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Fetch provinces
  const fetchProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const response = await fetch('https://vapi.vnappmob.com/api/v2/province/');
      const data = await response.json();
      if (data.results) {
        setProvinces(data.results);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách tỉnh thành!');
    } finally {
      setLoadingProvinces(false);
    }
  };

  // Fetch districts when province is selected
  const fetchDistricts = async (provinceId: string) => {
    setLoadingDistricts(true);
    setDistricts([]);
    setWards([]);
    setSelectedDistrictId('');
    try {
      const response = await fetch(`https://vapi.vnappmob.com/api/v2/province/district/${provinceId}`);
      const data = await response.json();
      if (data.results) {
        setDistricts(data.results);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách quận huyện!');
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Fetch wards when district is selected
  const fetchWards = async (districtId: string) => {
    setLoadingWards(true);
    setWards([]);
    try {
      const response = await fetch(`https://vapi.vnappmob.com/api/v2/province/ward/${districtId}`);
      const data = await response.json();
      if (data.results) {
        setWards(data.results);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách phường xã!');
    } finally {
      setLoadingWards(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'address') {
      fetchAddresses();
      fetchProvinces();
    }
  }, [activeTab]);

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name === 'province') {
      const province = provinces.find(p => p.province_id === value);
      setSelectedProvinceId(value);
      setAddressForm(prev => ({ 
        ...prev, 
        province: province?.province_name || '', 
        ward: '' 
      }));
      setSelectedDistrictId('');
      if (value) {
        fetchDistricts(value);
      } else {
        setDistricts([]);
        setWards([]);
      }
    } else if (name === 'district') {
      districts.find(d => d.district_id === value);
      setSelectedDistrictId(value);
      if (value) {
        fetchWards(value);
      } else {
        setWards([]);
      }
    } else if (name === 'ward') {
      const ward = wards.find(w => w.ward_id === value);
      const district = districts.find(d => d.district_id === selectedDistrictId);
      setAddressForm(prev => ({ 
        ...prev, 
        ward: ward && district ? `${ward.ward_name}, ${district.district_name}` : '' 
      }));
    } else {
      setAddressForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await AddressApi.update(editingAddress.id.toString(), addressForm);
        toast.success('Cập nhật địa chỉ thành công!');
      } else {
        await AddressApi.create(addressForm);
        toast.success('Thêm địa chỉ thành công!');
      }
      setShowAddressForm(false);
      setEditingAddress(null);
      resetAddressForm();
      fetchAddresses();
    } catch (error) {
      toast.error('Lỗi khi lưu địa chỉ!');
    }
  };

  const handleEditAddress = (addr: Address) => {
    setAddressForm({
      name: addr.name,
      phone: addr.phone,
      street: addr.street,
      ward: addr.ward,
      province: addr.province,
      isDefault: addr.isDefault,
    });
    setEditingAddress(addr);
    setShowAddressForm(true);
    // Reset selections when editing
    setSelectedProvinceId('');
    setSelectedDistrictId('');
    setDistricts([]);
    setWards([]);
  };

    // Reset address form
  const resetAddressForm = () => {
    setAddressForm({ 
      name: '', 
      phone: '', 
      street: '', 
      ward: '', 
      province: '', 
      isDefault: false 
    });
    setSelectedProvinceId('');
    setSelectedDistrictId('');
    setDistricts([]);
    setWards([]);
  };

  const handleSetDefault = async (id: number) => {
    try {
      await AddressApi.setDefault(id.toString());
      toast.success('Đặt địa chỉ mặc định thành công!');
      fetchAddresses();
    } catch (error) {
      toast.error('Lỗi khi đặt địa chỉ mặc định!');
    }
  }

  const handleDeleteAddress = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    try {
      await AddressApi.delete(id.toString());
      toast.success('Xóa địa chỉ thành công!');
      fetchAddresses();
    } catch (error) {
      toast.error('Lỗi khi xóa địa chỉ!');
  }

  }

  // Payments (leave as sample since no API)
  const samplePayments = [
    { id: 1, type: 'Visa', card: '**** **** **** 1234', default: true },
    { id: 2, type: 'Momo', card: 'SĐT: 0987 654 321', default: false }
  ];

  const menu = [
    { key: 'account', label: 'Thông tin cá nhân' },
    { key: 'address', label: 'Địa chỉ' },
    { key: 'payment', label: 'Phương thức thanh toán' },
    { key: 'password', label: 'Đổi mật khẩu' },
    { key: 'settings', label: 'Tùy chỉnh khác' },
  ];

  const handleMenuItemClick = (key: string) => {
    setActiveTab(key);
    setShowMobileMenu(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <form onSubmit={handleFormSubmit}>
            <h2 className="text-xl font-semibold text-zinc-800 mb-4">Thông tin cá nhân</h2>
            
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-200 shadow-lg">
                  {formData.avatarUrl ? (
                    <img 
                      src={formData.avatarUrl} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                      {formData.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                
                {/* Overlay on hover */}
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isUploadingAvatar ? (
                    <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
              
              <p className="text-sm text-gray-500 mt-3 text-center">
                Click vào ảnh để thay đổi
                <br />
                <span className="text-xs">(Tối đa 5MB, định dạng: JPEG, PNG, WebP)</span>
              </p>
            </div>

            <p className="text-gray-600 mb-4 text-sm sm:text-base">Email: {userEmail}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input 
                className="border p-2 rounded text-sm sm:text-base" 
                value={formData.name} 
                name="name" 
                onChange={handleInputChange} 
                placeholder="Họ tên" 
              />
              <div className="flex flex-col">
                <input 
                  className="border p-2 rounded text-sm sm:text-base" 
                  value={formData.phone} 
                  name="phone" 
                  onChange={handleInputChange} 
                  placeholder="Số điện thoại" 
                  type="tel"
                />
                <span className="text-xs text-gray-500 mt-1">VD: 0901234567 hoặc +84901234567</span>
              </div>
              <input 
                className="border p-2 rounded text-sm sm:text-base" 
                placeholder="Ngày sinh" 
                type="date" 
              />
              <select className="border p-2 rounded text-sm sm:text-base">
                <option>Giới tính</option>
                <option>Nam</option>
                <option>Nữ</option>
                <option>Khác</option>
              </select>
            </div>
            <button className="mt-4 bg-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-purple-700 w-full sm:w-auto text-sm sm:text-base">
              Lưu thay đổi
            </button>
          </form>
        );

            case 'address':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Địa chỉ của tôi</h2>
            {loadingAddresses ? (
              <p>Đang tải...</p>
            ) : (
              addresses.map(addr => (
                <div key={addr.id} className="border rounded p-3 sm:p-4 mb-3 bg-white shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="flex-1">
                    <p className="font-bold text-sm sm:text-base">{addr.name} ({addr.phone})</p>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1">{`${addr.street}, ${addr.ward}, ${addr.province}`}</p>
                    {addr.isDefault && <span className="text-purple-600 text-xs font-semibold inline-block mt-1">Mặc định</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditAddress(addr)} className="text-purple-600 text-sm">Sửa</button>
                    <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-600 text-sm">Xóa</button>
                    {!addr.isDefault && (
                      <button onClick={() => handleSetDefault(addr.id)} className="text-green-600 text-sm">Đặt mặc định</button>
                    )}
                  </div>
                </div>
              ))
            )}
            <button 
              onClick={() => { 
                setShowAddressForm(true); 
                setEditingAddress(null); 
                resetAddressForm();
              }} 
              className="mt-3 bg-purple-500 text-white px-4 py-2 rounded w-full sm:w-auto text-sm sm:text-base"
            >
              + Thêm địa chỉ
            </button>

            {/* Modal Overlay */}
            {showAddressForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  {/* Modal Header */}
                  <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {editingAddress ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
                    </h3>
                    <button 
                      onClick={() => {
                        setShowAddressForm(false);
                        resetAddressForm();
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="px-6 py-6">
                    <form onSubmit={handleAddressSubmit} className="grid grid-cols-1 gap-4">
                      {/* Name Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tên người nhận <span className="text-red-500">*</span>
                        </label>
                        <input 
                          name="name" 
                          value={addressForm.name} 
                          onChange={handleAddressInputChange} 
                          placeholder="Nhập tên người nhận" 
                          className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                          required 
                        />
                      </div>

                      {/* Phone Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <input 
                          name="phone" 
                          value={addressForm.phone} 
                          onChange={handleAddressInputChange} 
                          placeholder="Nhập số điện thoại" 
                          className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                          required 
                        />
                      </div>

                      {/* Street Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Địa chỉ cụ thể <span className="text-red-500">*</span>
                        </label>
                        <input 
                          name="street" 
                          value={addressForm.street} 
                          onChange={handleAddressInputChange} 
                          placeholder="Số nhà, tên đường" 
                          className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                          required 
                        />
                      </div>
                      
                      {/* Province Selector */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tỉnh / Thành phố <span className="text-red-500">*</span>
                        </label>
                        <select 
                          name="province" 
                          value={selectedProvinceId} 
                          onChange={handleAddressInputChange} 
                          className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                          required
                          disabled={loadingProvinces}
                        >
                          <option value="">-- Chọn Tỉnh / Thành phố --</option>
                          {provinces.map(province => (
                            <option key={province.province_id} value={province.province_id}>
                              {province.province_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* District Selector */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quận / Huyện <span className="text-red-500">*</span>
                        </label>
                        <select 
                          name="district" 
                          value={selectedDistrictId} 
                          onChange={handleAddressInputChange} 
                          className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed" 
                          required
                          disabled={!selectedProvinceId || loadingDistricts}
                        >
                          <option value="">-- Chọn Quận / Huyện --</option>
                          {districts.map(district => (
                            <option key={district.district_id} value={district.district_id}>
                              {district.district_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Ward Selector */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phường / Xã <span className="text-red-500">*</span>
                        </label>
                        <select 
                          name="ward" 
                          value={wards.find(w => addressForm.ward.includes(w.ward_name))?.ward_id || ''} 
                          onChange={handleAddressInputChange} 
                          className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed" 
                          required
                          disabled={!selectedDistrictId || loadingWards}
                        >
                          <option value="">-- Chọn Phường / Xã --</option>
                          {wards.map(ward => (
                            <option key={ward.ward_id} value={ward.ward_id}>
                              {ward.ward_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Default Checkbox */}
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <input 
                          type="checkbox" 
                          name="isDefault" 
                          checked={addressForm.isDefault} 
                          onChange={handleAddressInputChange}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          id="isDefault"
                        />
                        <label htmlFor="isDefault" className="text-sm font-medium text-gray-700 cursor-pointer">
                          Đặt làm địa chỉ mặc định
                        </label>
                      </div>

                      {/* Form Actions */}
                      <div className="flex gap-3 pt-4">
                        <button 
                          type="submit" 
                          className="flex-1 bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                        >
                          {editingAddress ? 'Cập nhật' : 'Thêm địa chỉ'}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => {
                            setShowAddressForm(false);
                            resetAddressForm();
                          }} 
                          className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                          Hủy
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'payment':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Phương thức thanh toán</h2>
            {samplePayments.map(pay => (
              <div key={pay.id} className="border rounded p-3 sm:p-4 mb-3 bg-white shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="flex-1">
                  <p className="font-bold text-sm sm:text-base">{pay.type}</p>
                  <p className="text-gray-600 text-xs sm:text-sm mt-1">{pay.card}</p>
                  {pay.default && <span className="text-purple-600 text-xs font-semibold inline-block mt-1">Mặc định</span>}
                </div>
                <button className="text-purple-600 text-sm self-start sm:self-auto">Sửa</button>
              </div>
            ))}
            <button className="mt-3 bg-cyan-500 text-white px-4 py-2 rounded w-full sm:w-auto text-sm sm:text-base">
              + Thêm phương thức
            </button>
          </div>
        );

      case 'password':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Đổi mật khẩu</h2>
            <div className="space-y-3 max-w-full sm:max-w-md">
              <input
                ref={currentPwdRef}
                type="password"
                name="currentPassword"
                value={pwdForm.currentPassword}
                onChange={handlePwdInputChange}
                className="border p-2 rounded w-full text-sm sm:text-base"
                placeholder="Mật khẩu hiện tại"
              />
              <input
                ref={newPwdRef}
                type="password"
                name="newPassword"
                value={pwdForm.newPassword}
                onChange={handlePwdInputChange}
                className="border p-2 rounded w-full text-sm sm:text-base"
                placeholder="Mật khẩu mới"
              />
              <input
                ref={confirmPwdRef}
                type="password"
                name="confirmPassword"
                value={pwdForm.confirmPassword}
                onChange={handlePwdInputChange}
                className="border p-2 rounded w-full text-sm sm:text-base"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
            <button
              onClick={handleChangePassword}
              className="mt-4 bg-cyan-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-cyan-600 w-full sm:w-auto text-sm sm:text-base"
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

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 flex flex-col lg:flex-row gap-4 sm:gap-8 w-full">
        {/* Mobile Menu Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center justify-between"
          >
            <span>Menu tài khoản</span>
            <svg 
              className={`w-5 h-5 transition-transform ${showMobileMenu ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Sidebar - Desktop & Mobile */}
        <aside className={`
          ${showMobileMenu ? 'block' : 'hidden'} 
          lg:block 
          w-full lg:w-64 
          lg:border-r lg:pr-4 
          mb-4 lg:mb-0
        `}>
          <h3 className="text-lg font-bold text-zinc-700 mb-4 hidden lg:block">Tài khoản</h3>
          <ul className="space-y-2">
            {menu.map(m => (
              <li key={m.key}>
                <button 
                  onClick={() => handleMenuItemClick(m.key)}
                  className={`
                    w-full text-left px-3 py-2 rounded hover:bg-purple-100 text-sm sm:text-base
                    ${activeTab === m.key ? 'bg-purple-200 font-semibold' : 'text-gray-700'}
                  `}
                >
                  {m.label}
                </button>
              </li>
            ))}
            <li>
              <button 
                onClick={handleLogout} 
                className="w-full text-left px-3 py-2 rounded text-red-600 hover:bg-red-100 text-sm sm:text-base"
              >
                Đăng xuất
              </button>
            </li>
          </ul>
        </aside>

        {/* Content Section */}
        <section className="flex-1 min-w-0 bg-white rounded-xl shadow p-4 sm:p-6 border">
          {renderContent()}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
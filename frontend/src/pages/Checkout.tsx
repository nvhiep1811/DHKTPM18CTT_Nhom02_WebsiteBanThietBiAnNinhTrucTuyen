import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  MapPin, Phone, Mail, User, CreditCard, Truck, Package, Wallet,
  CheckCircle, Edit, Tag, Clock, Shield, X, ChevronDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAppSelector } from '../hooks';
import { cartService, type CartItem } from '../utils/cartService';
import { DiscountApi, orderApi, AddressApi } from '../utils/api';
import { vnpayApi } from '../utils/vnpayService';
import type { VNPayPaymentRequest } from '../types/vnpay';
import type { DiscountDetail } from '../types/types';

// Address interface
interface Address {
  id: number;
  name: string;
  phone: string;
  street: string;
  ward: string;
  province: string;
  isDefault: boolean;
}

interface ShippingInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  note: string;
}

type ShippingMethod = 'standard' | 'express';
type PaymentMethod = 'cod' | 'bank_transfer' | 'e_wallet';

const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    city: '',
    district: '',
    ward: '',
    note: ''
  });

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<DiscountDetail | null>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [errors, setErrors] = useState<Partial<ShippingInfo>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Province/District/Ward State
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Address Management - IMPROVED
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [shippingInfoBackup, setShippingInfoBackup] = useState<ShippingInfo | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Calculate shipping fees based on city (HCM cheaper, outside HCM more expensive)
  const calculateShippingFees = () => {
    const isHCM = shippingInfo.city.toLowerCase().includes('hồ chí minh')
    
    return {
      standard: isHCM ? 25000 : 40000,
      express: isHCM ? 40000 : 65000
    };
  };

  const shippingFees = calculateShippingFees();

  // Helper Functions
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const calculateSubtotal = () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = calculateSubtotal();
    const shippingFee = shippingFees[shippingMethod];

    switch (appliedCoupon.discountType) {
      case 'PERCENT': return Math.min((subtotal * appliedCoupon.discountValue) / 100, subtotal);
      case 'FIXED_AMOUNT': return Math.min(appliedCoupon.discountValue, subtotal);
      case 'FREE_SHIP': return shippingFee;
      default: return 0;
    }
  };

  const calculateTotal = () => Math.max(calculateSubtotal() + shippingFees[shippingMethod] - calculateDiscount(), 0);

  // Fetch Districts
  const fetchDistricts = async (provinceId: string) => {
    setLoadingDistricts(true);
    setDistricts([]);
    setWards([]);
    setSelectedDistrictId('');
    try {
      const res = await fetch(`https://vapi.vnappmob.com/api/v2/province/district/${provinceId}`);
      const data = await res.json();
      if (data.results) setDistricts(data.results);
    } catch {
      toast.error('Lỗi tải quận/huyện!');
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Fetch Wards
  const fetchWards = async (districtId: string) => {
    setLoadingWards(true);
    setWards([]);
    try {
      const res = await fetch(`https://vapi.vnappmob.com/api/v2/province/ward/${districtId}`);
      const data = await res.json();
      if (data.results) setWards(data.results);
    } catch {
      toast.error('Lỗi tải phường/xã!');
    } finally {
      setLoadingWards(false);
    }
  };

  // Load Address Into Form - FIXED
  const loadAddressIntoForm = React.useCallback(async (address: Address) => {
    const [district, city] = address.province.includes(',') 
      ? address.province.split(',').map(s => s.trim())
      : ['', address.province];

    // Auto-select province
    const province = provinces.find(p => 
      p.province_name === city || p.province_name.includes(city)
    );
    
    if (province) {
      setSelectedProvinceId(province.province_id);
      
      // Fetch districts and wait for state update
      try {
        const res = await fetch(`https://vapi.vnappmob.com/api/v2/province/district/${province.province_id}`);
        const data = await res.json();
        
        if (data.results) {
          setDistricts(data.results);
          
          // Find matching district by name (normalize comparison)
          const districtMatch = data.results.find((d: any) => {
            const normalizedApiName = d.district_name.toLowerCase().trim();
            const normalizedStoredName = district.toLowerCase().trim();
            return normalizedApiName === normalizedStoredName || 
                   normalizedApiName.includes(normalizedStoredName) ||
                   normalizedStoredName.includes(normalizedApiName);
          });

          if (districtMatch) {
            setSelectedDistrictId(districtMatch.district_id);
            
            // Fetch wards for the matched district
            const wardRes = await fetch(`https://vapi.vnappmob.com/api/v2/province/ward/${districtMatch.district_id}`);
            const wardData = await wardRes.json();
            
            if (wardData.results) {
              setWards(wardData.results);
              
              // Find matching ward by name (normalize comparison)
              const wardMatch = wardData.results.find((w: any) => {
                const normalizedApiName = w.ward_name.toLowerCase().trim();
                const normalizedStoredName = address.ward.toLowerCase().trim();
                return normalizedApiName === normalizedStoredName || 
                       normalizedApiName.includes(normalizedStoredName) ||
                       normalizedStoredName.includes(normalizedApiName);
              });
              
              // Set shipping info with matched names from API (ensures consistency)
              setShippingInfo(prev => ({
                ...prev,
                fullName: address.name || user?.name || '',
                phone: address.phone || user?.phone || '',
                email: user?.email || '',
                address: address.street,
                city: province.province_name,
                district: districtMatch.district_name,
                ward: wardMatch ? wardMatch.ward_name : address.ward,
              }));
            }
          } else {
            // District not found - still set info but warn user
            console.warn('District not found in API:', district);
            setShippingInfo(prev => ({
              ...prev,
              fullName: address.name || user?.name || '',
              phone: address.phone || user?.phone || '',
              email: user?.email || '',
              address: address.street,
              city: province.province_name,
              district: district,
              ward: address.ward,
            }));
          }
        }
      } catch (error) {
        console.error('Error loading address location data:', error);
        toast.error('Không thể tải thông tin địa chỉ đầy đủ');
      }
    } else {
      // Province not found - set basic info
      setShippingInfo(prev => ({
        ...prev,
        fullName: address.name || user?.name || '',
        phone: address.phone || user?.phone || '',
        email: user?.email || '',
        address: address.street,
        city: city,
        district: district,
        ward: address.ward,
      }));
    }
  }, [provinces, user]);
// Handle Address Change
  const handleAddressChange = (name: keyof ShippingInfo, value: string) => {
    if (name === 'city') {
      const province = provinces.find(p => p.province_id === value);
      setSelectedProvinceId(value);
      setShippingInfo(prev => ({
        ...prev,
        city: province?.province_name || '',
        district: '',
        ward: ''
      }));
      if (value) fetchDistricts(value);
      else {
        setDistricts([]);
        setWards([]);
      }
    } else if (name === 'district') {
      const district = districts.find(d => d.district_id === value);
      setSelectedDistrictId(value);
      setShippingInfo(prev => ({
        ...prev,
        district: district?.district_name || '',
        ward: ''
      }));
      if (value) fetchWards(value);
      else setWards([]);
    } else if (name === 'ward') {
      const ward = wards.find(w => w.ward_id === value);
      setShippingInfo(prev => ({ ...prev, ward: ward?.ward_name || '' }));
    } else {
      setShippingInfo(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle Select Saved Address - NEW
  const handleSelectSavedAddress = async (addressId: number) => {
    const address = savedAddresses.find(a => a.id === addressId);
    if (address) {
      setSelectedAddressId(addressId);
      await loadAddressIntoForm(address);
      setShowAddressSelector(false);
      setIsEditingAddress(false);
      toast.success('Đã chọn địa chỉ giao hàng');
    }
  };

  // Handle Start Editing - NEW
  const handleStartEditing = () => {
    setShippingInfoBackup({ ...shippingInfo });
    setIsEditingAddress(true);
  };

  // Handle Cancel Editing - NEW
  const handleCancelEditing = () => {
    if (shippingInfoBackup) {
      setShippingInfo(shippingInfoBackup);
      setShippingInfoBackup(null);
    }
    setIsEditingAddress(false);
    toast.info('Đã hủy chỉnh sửa');
  };

  // Handle Save Address - NEW
  const handleSaveAddress = () => {
    if (validateForm()) {
      setIsEditingAddress(false);
      setShippingInfoBackup(null);
      setSelectedAddressId(null);
      toast.success('Đã lưu thông tin giao hàng');
    }
  };

  // Validate Form
  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingInfo> = {};
    if (!shippingInfo.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!shippingInfo.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^[0-9]{10}$/.test(shippingInfo.phone.replace(/\s/g, ''))) newErrors.phone = 'Số điện thoại không hợp lệ';
    if (!shippingInfo.email.trim()) newErrors.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) newErrors.email = 'Email không hợp lệ';
    if (!shippingInfo.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ chi tiết';
    if (!shippingInfo.city) newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
    if (!shippingInfo.district) newErrors.district = 'Vui lòng chọn quận/huyện';
    if (!shippingInfo.ward) newErrors.ward = 'Vui lòng chọn phường/xã';

    // Debug log
    if (Object.keys(newErrors).length > 0) {
      console.log('Validation errors:', newErrors);
      console.log('Current shippingInfo:', shippingInfo);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Apply Coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return toast.error('Vui lòng nhập mã giảm giá');
    setIsApplyingCoupon(true);
    try {
      const discount = await DiscountApi.findByCode(couponCode.trim().toUpperCase());
      const subtotal = calculateSubtotal();
      const now = new Date();

      if (!discount.active || new Date(discount.startAt) > now || new Date(discount.endAt) < now) {
        toast.error('Mã giảm giá không hợp lệ hoặc đã hết hạn');
        return;
      }
      if (discount.minOrderValue && subtotal < discount.minOrderValue) {
        toast.error(`Đơn tối thiểu phải đạt ${formatPrice(discount.minOrderValue)}`);
        return;
      }
      setAppliedCoupon(discount);
      toast.success(`Áp dụng mã ${discount.code} thành công!`);
    } catch {
      toast.error('Mã giảm giá không tồn tại');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Handle Remove Coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info('Đã xóa mã giảm giá');
  };

  // Handle Place Order
  const handlePlaceOrder = async () => {
    if (!validateForm()) return toast.error('Vui lòng kiểm tra lại thông tin!');

    setIsSubmitting(true);
    try {
      const orderItems = cartItems.map(item => ({ productId: item.productId, quantity: item.quantity }));
      const shippingAddressMap: Record<string, string> = {
        fullName: shippingInfo.fullName,
        phone: shippingInfo.phone,
        email: shippingInfo.email,
        address: shippingInfo.address,
        ward: shippingInfo.ward,
        district: shippingInfo.district,
        city: shippingInfo.city,
        ...(shippingInfo.note.trim() && { note: shippingInfo.note })
      };

      const orderRequest = {
        items: orderItems,
        shippingFee: shippingFees[shippingMethod],
        discountCode: appliedCoupon?.code || null,
        shippingAddress: shippingAddressMap,
        paymentMethod: paymentMethod.toUpperCase()
      };

      const createdOrder = await orderApi.create(orderRequest);

      if (paymentMethod === 'e_wallet') {
        const vnpayRequest: VNPayPaymentRequest = {
          orderId: createdOrder.id,
          amount: Math.round(calculateTotal()),
          orderInfo: `Thanh toan don hang ${createdOrder.id.substring(0, 8)}`,
          language: 'vn'
        };
        const res = await vnpayApi.createPaymentUrl(vnpayRequest);
        if (res.code === '00' && res.paymentUrl) {
          window.location.href = res.paymentUrl;
          return;
        }
        toast.error('Không thể tạo link thanh toán VNPay');
        return;
      }

      const orderData = {
        orderId: createdOrder.id,
        orderNumber: `ORD${createdOrder.id.split('-')[0].toUpperCase()}`,
        items: cartItems,
        shippingInfo,
        shippingMethod,
        paymentMethod,
        subtotal: calculateSubtotal(),
        discount: calculateDiscount(),
        shippingFee: shippingFees[shippingMethod],
        total: calculateTotal(),
        coupon: appliedCoupon,
        orderDate: createdOrder.createdAt || new Date().toISOString(),
        status: createdOrder.status,
        paymentStatus: createdOrder.paymentStatus
      };

      if (location.state?.cartItems) {
        for (const item of cartItems) await cartService.removeItem(item.productId);
        window.dispatchEvent(new Event('cartUpdated'));
      }

      toast.success('Đặt hàng thành công!');
      navigate('/order-success', { state: { orderData } });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại!';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load cart items
  useEffect(() => {
    const loadCheckoutItems = async () => {
      if (location.state?.product && location.state?.quantity) {
        const { product, quantity } = location.state;
        const buyNowItem: CartItem = {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          thumbnailUrl: product.thumbnailUrl || '/placeholder-product.jpg',
          inStock: product.inventory?.availableQuantity > 0,
        };
        setCartItems([buyNowItem]);
        return;
      }

      if (location.state?.cartItems && Array.isArray(location.state.cartItems)) {
        setCartItems(location.state.cartItems);
        return;
      }

      toast.info('Không có sản phẩm nào để thanh toán!');
      navigate('/cart');
    };

    loadCheckoutItems();
    window.scrollTo(0, 0);
  }, [location.state, navigate]);

  // Load Provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const res = await fetch('https://vapi.vnappmob.com/api/v2/province/');
        const data = await res.json();
        if (data.results) setProvinces(data.results);
      } catch {
        toast.error('Lỗi tải danh sách tỉnh/thành!');
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  // Load Saved Addresses - IMPROVED
  useEffect(() => {
    const loadSavedAddresses = async () => {
      if (!user || user.role === 'guest') {
        setLoadingAddresses(false);
        return;
      }

      try {
        const addresses = await AddressApi.getAll();
        setSavedAddresses(addresses);
        
        const defaultAddr = addresses.find((addr: Address) => addr.isDefault);

        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          await loadAddressIntoForm(defaultAddr);
          setIsEditingAddress(false);
        } else if (addresses.length > 0) {
          setSelectedAddressId(addresses[0].id);
          await loadAddressIntoForm(addresses[0]);
          setIsEditingAddress(false);
        }
      } catch (err) {
        console.error('Failed to load addresses:', err);
        toast.error('Không thể tải danh sách địa chỉ');
      } finally {
        setLoadingAddresses(false);
      }
    };

    if (provinces.length > 0) {
      loadSavedAddresses();
    }
  }, [user, provinces.length, loadAddressIntoForm]);

  // Show loading
  if (cartItems.length === 0 || loadingAddresses) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-16 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Đang tải thông tin thanh toán...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-3">
            <li><Link to="/" className="text-gray-700 hover:text-purple-600">Trang chủ</Link></li>
            <li><span className="mx-2 text-gray-400">/</span><Link to="/cart" className="text-gray-700 hover:text-purple-600">Giỏ hàng</Link></li>
            <li><span className="mx-2 text-gray-400">/</span><span className="text-gray-500">Thanh toán</span></li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold text-zinc-800 mb-8">Thanh toán đơn hàng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Shipping Info Section - IMPROVED */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold">Thông tin giao hàng</h2>
                </div>
                {!isEditingAddress && (
                  <button 
                    onClick={handleStartEditing} 
                    className="text-purple-600 flex items-center gap-2 hover:text-purple-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" /> Chỉnh sửa
                  </button>
                )}
              </div>

              {/* Saved Addresses Selector - NEW */}
              {savedAddresses.length > 0 && !isEditingAddress && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowAddressSelector(!showAddressSelector)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {selectedAddressId 
                          ? `Địa chỉ đã chọn (${savedAddresses.find(a => a.id === selectedAddressId)?.isDefault ? 'Mặc định' : 'Đã lưu'})`
                          : 'Chọn địa chỉ có sẵn'}
                      </span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${showAddressSelector ? 'rotate-180' : ''}`} />
                  </button>

                  {showAddressSelector && (
                    <div className="mt-2 border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          onClick={() => handleSelectSavedAddress(addr.id)}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                            selectedAddressId === addr.id ? 'bg-purple-50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">{addr.name}</span>
                                {addr.isDefault && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    Mặc định
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{addr.phone}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {addr.street}, {addr.ward}, {addr.province}
                              </p>
                            </div>
                            {selectedAddressId === addr.id && (
                              <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-1" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Current Address Indicator - NEW */}
              {selectedAddressId && !isEditingAddress && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  <span>
                    {savedAddresses.find(a => a.id === selectedAddressId)?.isDefault 
                      ? 'Đang sử dụng địa chỉ mặc định của bạn'
                      : 'Đang sử dụng địa chỉ đã lưu'}
                  </span>
                </div>
              )}

              {isEditingAddress ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Họ và tên *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input 
                        type="text" 
                        value={shippingInfo.fullName} 
                        onChange={e => handleAddressChange('fullName', e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg ${errors.fullName ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-purple-500 focus:border-transparent`} 
                        placeholder="Nguyễn Văn A" 
                      />
                      {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Số điện thoại *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input 
                          type="tel" 
                          value={shippingInfo.phone} 
                          onChange={e => handleAddressChange('phone', e.target.value)}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-purple-500 focus:border-transparent`} 
                          placeholder="0901234567" 
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input 
                          type="email" 
                          value={shippingInfo.email} 
                          onChange={e => handleAddressChange('email', e.target.value)}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-purple-500 focus:border-transparent`} 
                          placeholder="email@example.com" 
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Địa chỉ chi tiết *</label>
                    <input 
                      type="text" 
                      value={shippingInfo.address} 
                      onChange={e => handleAddressChange('address', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg ${errors.address ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-purple-500 focus:border-transparent`} 
                      placeholder="Số nhà, tên đường..." 
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tỉnh/Thành phố *</label>
                      <select 
                        value={selectedProvinceId} 
                        onChange={e => handleAddressChange('city', e.target.value)}
                        disabled={loadingProvinces}
                        className={`w-full px-4 py-2.5 border rounded-lg ${errors.city ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                      >
                        <option value="">{loadingProvinces ? 'Đang tải...' : '-- Chọn tỉnh/thành --'}</option>
                        {provinces.map(p => (
                          <option key={p.province_id} value={p.province_id}>{p.province_name}</option>
                        ))}
                      </select>
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Quận/Huyện *</label>
                      <select 
                        value={selectedDistrictId} 
                        onChange={e => handleAddressChange('district', e.target.value)}
                        disabled={!selectedProvinceId || loadingDistricts}
                        className={`w-full px-4 py-2.5 border rounded-lg ${errors.district ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                      >
                        <option value="">{loadingDistricts ? 'Đang tải...' : '-- Chọn quận/huyện --'}</option>
                        {districts.map(d => (
                          <option key={d.district_id} value={d.district_id}>{d.district_name}</option>
                        ))}
                      </select>
                      {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Phường/Xã *</label>
                      <select 
                        value={wards.find(w => w.ward_name === shippingInfo.ward)?.ward_id || ''}
                        onChange={e => handleAddressChange('ward', e.target.value)}
                        disabled={!selectedDistrictId || loadingWards}
                        className={`w-full px-4 py-2.5 border rounded-lg ${errors.ward ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                      >
                        <option value="">{loadingWards ? 'Đang tải...' : '-- Chọn phường/xã --'}</option>
                        {wards.map(w => (
                          <option key={w.ward_id} value={w.ward_id}>{w.ward_name}</option>
                        ))}
                      </select>
                      {errors.ward && <p className="text-red-500 text-xs mt-1">{errors.ward}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Ghi chú (không bắt buộc)</label>
                    <textarea 
                      value={shippingInfo.note} 
                      onChange={e => handleAddressChange('note', e.target.value)}
                      rows={3} 
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ghi chú về thời gian giao hàng..." 
                    />
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={handleCancelEditing}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                    >
                      Hủy
                    </button>
                    <button 
                      onClick={handleSaveAddress}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors"
                    >
                      Xác nhận thông tin
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-gray-700">
                  <p><strong>{shippingInfo.fullName}</strong> - {shippingInfo.phone}</p>
                  <p>{shippingInfo.email}</p>
                  <div className="text-sm space-y-1">
                    <p><strong>Địa chỉ:</strong> {shippingInfo.address || <span className="text-red-500">Chưa có</span>}</p>
                    <p><strong>Phường/Xã:</strong> {shippingInfo.ward || <span className="text-red-500">Chưa chọn</span>}</p>
                    <p><strong>Quận/Huyện:</strong> {shippingInfo.district || <span className="text-red-500">Chưa chọn</span>}</p>
                    <p><strong>Tỉnh/Thành:</strong> {shippingInfo.city || <span className="text-red-500">Chưa chọn</span>}</p>
                  </div>
                  {shippingInfo.note && <p className="text-sm italic">Ghi chú: {shippingInfo.note}</p>}
                </div>
              )}
            </motion.div>
            {/* Shipping Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                  <Truck className="h-5 w-5 text-cyan-600" />
                </div>
                <h2 className="text-xl font-semibold text-zinc-800">Phương thức giao hàng</h2>
              </div>

              <div className="space-y-3">
                <label className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  shippingMethod === 'standard' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      value="standard"
                      checked={shippingMethod === 'standard'}
                      onChange={(e) => setShippingMethod(e.target.value as ShippingMethod)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Giao hàng tiêu chuẩn</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Giao trong 3-5 ngày
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900">{formatPrice(shippingFees.standard)}</span>
                </label>

                <label className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  shippingMethod === 'express' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      value="express"
                      checked={shippingMethod === 'express'}
                      onChange={(e) => setShippingMethod(e.target.value as ShippingMethod)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-gray-900">Giao hàng nhanh</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Giao trong 24-48h
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900">{formatPrice(shippingFees.express)}</span>
                </label>
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-zinc-800">Phương thức thanh toán</h2>
              </div>

              <div className="space-y-3">
                <label className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === 'cod' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Thanh toán khi nhận hàng (COD)</p>
                        <p className="text-sm text-gray-600">Thanh toán bằng tiền mặt khi nhận hàng</p>
                      </div>
                    </div>
                  </div>
                  <Shield className="h-5 w-5 text-green-600" />
                </label>

                <label className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === 'bank_transfer' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Chuyển khoản ngân hàng</p>
                        <p className="text-sm text-gray-600">Chuyển khoản qua ATM/Internet Banking</p>
                      </div>
                    </div>
                  </div>
                  <Shield className="h-5 w-5 text-green-600" />
                </label>

                <label className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === 'e_wallet' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="e_wallet"
                      checked={paymentMethod === 'e_wallet'}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Thanh toán qua VNPay</p>
                        <p className="text-sm text-gray-600">Thanh toán qua ví điện tử, thẻ ATM, thẻ quốc tế</p>
                      </div>
                    </div>
                  </div>
                  <Shield className="h-5 w-5 text-green-600" />
                </label>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6 h-fit"
          >
            <h2 className="text-xl font-semibold text-zinc-800 mb-6 flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              Tóm tắt đơn hàng
            </h2>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <div className="flex items-center gap-3">
                    <img src={item.thumbnailUrl} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">x{item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4 space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Tạm tính</span>
                <span>{formatPrice(calculateSubtotal())}</span>
              </div>

              <div className="flex justify-between text-gray-700">
                <span>Phí vận chuyển</span>
                <span>{formatPrice(shippingFees[shippingMethod])}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Giảm giá ({appliedCoupon.code})</span>
                  <span>-{formatPrice(calculateDiscount())}</span>
                </div>
              )}

              <div className="flex justify-between items-center mt-4 border-t border-gray-200 pt-4">
                <span className="text-lg font-semibold text-gray-900">Tổng cộng</span>
                <span className="text-xl font-bold text-purple-600">{formatPrice(calculateTotal())}</span>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mã giảm giá</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Nhập mã giảm giá (VD: GIAM10)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {appliedCoupon ? (
                  <button
                    onClick={handleRemoveCoupon}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 
                              flex items-center gap-1 whitespace-nowrap w-[110px] justify-center transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Xóa
                  </button>
                ) : (
                  isApplyingCoupon ? (
                    <button
                      disabled
                      className="px-4 py-2 bg-gray-400 text-white rounded-lg 
                                flex items-center gap-1 cursor-not-allowed whitespace-nowrap 
                                w-[110px] justify-center"
                    >
                      <Tag className="h-4 w-4" />
                      Đang kiểm tra...
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg 
                                hover:bg-purple-700 flex items-center gap-1 whitespace-nowrap 
                                w-[110px] justify-center transition-colors"
                    >
                      <Tag className="h-4 w-4" />
                      Áp dụng
                    </button>
                  )
                )}
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className={`w-full mt-6 py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-colors ${
                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-5 w-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Đặt hàng ngay
                </>
              )}
            </button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;

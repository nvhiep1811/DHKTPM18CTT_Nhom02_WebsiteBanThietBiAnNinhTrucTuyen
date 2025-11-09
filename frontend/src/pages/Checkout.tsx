import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  CreditCard, 
  Truck, 
  Package, 
  Wallet,
  CheckCircle,
  Edit,
  Tag,
  Clock,
  Shield,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAppSelector } from '../hooks';
import { cartService, type CartItem } from '../utils/cartService';
import { orderApi } from '../utils/api';

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
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    city: 'Hồ Chí Minh',
    district: '',
    ward: '',
    note: ''
  });
  
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string; discount: number} | null>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(true);
  const [errors, setErrors] = useState<Partial<ShippingInfo>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);


   useEffect(() => {
    const loadCheckoutItems = async () => {
      // Trường hợp 1: Mua ngay từ trang chi tiết (product + quantity)
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

      // Trường hợp 2: Thanh toán từ giỏ hàng (cartItems)
      if (location.state?.cartItems && Array.isArray(location.state.cartItems)) {
        setCartItems(location.state.cartItems);
        return;
      }

      // Trường hợp 3: Không có dữ liệu → chuyển về giỏ hàng
      toast.info('Không có sản phẩm nào để thanh toán. Vui lòng chọn sản phẩm!');
      navigate('/cart');
    };

    loadCheckoutItems();
    window.scrollTo(0, 0);
  }, [location.state, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const shippingFees = {
    standard: 30000,
    express: 50000
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    if (appliedCoupon) {
      return calculateSubtotal() * (appliedCoupon.discount / 100);
    }
    return 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + shippingFees[shippingMethod];
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingInfo> = {};

    if (!shippingInfo.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }
    if (!shippingInfo.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10}$/.test(shippingInfo.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    if (!shippingInfo.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!shippingInfo.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }
    if (!shippingInfo.district.trim()) {
      newErrors.district = 'Vui lòng chọn quận/huyện';
    }
    if (!shippingInfo.ward.trim()) {
      newErrors.ward = 'Vui lòng chọn phường/xã';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApplyCoupon = () => {
    const validCoupons: Record<string, number> = {
      'GIAM10': 10,
      'GIAM15': 15,
      'GIAM20': 20
    };

    if (validCoupons[couponCode.toUpperCase()]) {
      setAppliedCoupon({
        code: couponCode.toUpperCase(),
        discount: validCoupons[couponCode.toUpperCase()]
      });
      toast.success(`Áp dụng mã giảm giá ${validCoupons[couponCode.toUpperCase()]}% thành công!`);
    } else {
      toast.error('Mã giảm giá không hợp lệ!');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info('Đã xóa mã giảm giá');
  };

  const sendOrderConfirmationEmail = async (orderData: any) => {
    console.log('Sending confirmation email to:', shippingInfo.email);
    console.log('Order data:', orderData);
    return true;
  };

  const handlePlaceOrder = async () => {
  if (!validateForm()) {
    toast.error('Vui lòng kiểm tra lại thông tin!');
    return;
  }

  setIsSubmitting(true);

  try {
    // ========================================
    // 1. CHUẨN BỊ DỮ LIỆU
    // ========================================
    
    // Chuẩn bị order items
    const orderItems = cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));

    // Chuẩn bị shipping address (Map<String, String>)
    const shippingAddressMap: Record<string, string> = {
      fullName: shippingInfo.fullName,
      phone: shippingInfo.phone,
      email: shippingInfo.email,
      address: shippingInfo.address,
      ward: shippingInfo.ward,
      district: shippingInfo.district,
      city: shippingInfo.city
    };

    // Thêm note nếu có
    if (shippingInfo.note.trim()) {
      shippingAddressMap.note = shippingInfo.note;
    }

    // Tạo order request
    const orderRequest = {
      items: orderItems,
      shippingFee: shippingFees[shippingMethod],
      discountCode: appliedCoupon?.code || null,
      shippingAddress: shippingAddressMap
    };

    // ========================================
    // 2. GỌI API TẠO ORDER
    // ========================================
    const createdOrder = await orderApi.create(orderRequest);

    // ========================================
    // 3. XỬ LÝ RESPONSE - Lấy thông tin từ backend
    // ========================================
    
    // Tạo orderData để hiển thị ở trang success
    const orderData = {
      orderId: createdOrder.id, // UUID từ backend
      orderNumber: `ORD${createdOrder.id.split('-')[0].toUpperCase()}`, // VD: ORDABC123
      items: cartItems, // Danh sách sản phẩm (có đầy đủ thông tin)
      shippingInfo, // Thông tin giao hàng
      shippingMethod, // standard/express
      paymentMethod, // cod/bank_transfer/e_wallet
      subtotal: calculateSubtotal(), // Tạm tính
      discount: calculateDiscount(), // Giảm giá
      shippingFee: shippingFees[shippingMethod], // Phí ship
      total: calculateTotal(), // Tổng cộng
      coupon: appliedCoupon, // Mã giảm giá đã áp dụng
      orderDate: createdOrder.createdAt || new Date().toISOString(), // Ngày đặt
      status: createdOrder.status, // PENDING/CONFIRMED/...
      paymentStatus: createdOrder.paymentStatus // UNPAID/PAID
    };

    // ========================================
    // 5. XÓA GIỎ HÀNG SAU KHI ĐẶT HÀNG THÀNH CÔNG
    // ========================================
    
    // CHỈ xóa khi thanh toán từ cart
    // KHÔNG xóa khi mua ngay (vì sản phẩm chưa có trong cart)
    if (location.state?.cartItems) {
      for (const item of cartItems) {
        await cartService.removeItem(item.productId);
      }
      // Cập nhật UI giỏ hàng
      window.dispatchEvent(new Event('cartUpdated'));
    }

    // ✅ Thông báo thành công
    toast.success('Đặt hàng thành công!');
    
    // Chuyển sang trang order success
    navigate('/order-success', { state: { orderData } });

  } catch (error: any) {
    console.error('Error placing order:', error);
    
    // ========================================
    // 4. XỬ LÝ LỖI CHI TIẾT
    // ========================================
    
    // 400 Bad Request - Thông tin không hợp lệ
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.message || 'Thông tin đơn hàng không hợp lệ';
      toast.error(errorMessage);
    } 
    // 404 Not Found - Sản phẩm không tồn tại
    else if (error.response?.status === 404) {
      toast.error('Một số sản phẩm không còn tồn tại');
    } 
    // 409 Conflict - Hết hàng hoặc không đủ số lượng
    else if (error.response?.status === 409) {
      toast.error('Một số sản phẩm đã hết hàng hoặc không đủ số lượng');
    } 
    // Lỗi chung
    else {
      toast.error('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!');
    }
  } finally {
    setIsSubmitting(false);
  }
};

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Đang tải...</p>
          </div>
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
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="text-gray-700 hover:text-purple-600">Trang chủ</Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link to="/cart" className="text-gray-700 hover:text-purple-600">Giỏ hàng</Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">Thanh toán</span>
              </div>
            </li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold text-zinc-800 mb-8">Thanh toán đơn hàng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-zinc-800">Thông tin giao hàng</h2>
                </div>
                {!isEditingAddress && (
                  <button
                    onClick={() => setIsEditingAddress(true)}
                    className="text-purple-600 hover:text-purple-700 flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Chỉnh sửa
                  </button>
                )}
              </div>

              {isEditingAddress ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={shippingInfo.fullName}
                        onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.fullName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          value={shippingInfo.phone}
                          onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            errors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="0912345678"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          value={shippingInfo.email}
                          onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="email@example.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Số nhà, tên đường"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tỉnh/Thành phố *
                      </label>
                      <select
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="Đà Nẵng">Đà Nẵng</option>
                        <option value="Cần Thơ">Cần Thơ</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quận/Huyện *
                      </label>
                      <select
                        value={shippingInfo.district}
                        onChange={(e) => setShippingInfo({...shippingInfo, district: e.target.value})}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.district ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Chọn quận/huyện</option>
                        <option value="Quận 1">Quận 1</option>
                        <option value="Quận 2">Quận 2</option>
                        <option value="Quận 3">Quận 3</option>
                        <option value="Quận Bình Thạnh">Quận Bình Thạnh</option>
                        <option value="Quận Phú Nhuận">Quận Phú Nhuận</option>
                      </select>
                      {errors.district && (
                        <p className="text-red-500 text-sm mt-1">{errors.district}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phường/Xã *
                      </label>
                      <select
                        value={shippingInfo.ward}
                        onChange={(e) => setShippingInfo({...shippingInfo, ward: e.target.value})}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.ward ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Chọn phường/xã</option>
                        <option value="Phường 1">Phường 1</option>
                        <option value="Phường 2">Phường 2</option>
                        <option value="Phường 3">Phường 3</option>
                      </select>
                      {errors.ward && (
                        <p className="text-red-500 text-sm mt-1">{errors.ward}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú (không bắt buộc)
                    </label>
                    <textarea
                      value={shippingInfo.note}
                      onChange={(e) => setShippingInfo({...shippingInfo, note: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                      placeholder="Ghi chú về đơn hàng, ví dụ: thời gian giao hàng..."
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (validateForm()) {
                        setIsEditingAddress(false);
                        toast.success('Đã lưu thông tin giao hàng');
                      }
                    }}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Xác nhận thông tin
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{shippingInfo.fullName}</p>
                      <p className="text-gray-600">{shippingInfo.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <p className="text-gray-600">{shippingInfo.email}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <p className="text-gray-600">
                      {shippingInfo.address}, {shippingInfo.ward}, {shippingInfo.district}, {shippingInfo.city}
                    </p>
                  </div>
                  {shippingInfo.note && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Ghi chú:</strong> {shippingInfo.note}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

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
                      <Wallet className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">Ví điện tử</p>
                                                <p className="text-sm text-gray-600">Thanh toán qua Momo, ZaloPay hoặc VNPay</p>
                      </div>
                    </div>
                  </div>
                  <Shield className="h-5 w-5 text-green-600" />
                </label>
              </div>
            </motion.div>
          </div>

          {/* Cột bên phải - Tóm tắt đơn hàng */}
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

            {/* Mã giảm giá */}
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
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Xóa
                  </button>
                ) : (
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1"
                  >
                    <Tag className="h-4 w-4" />
                    Áp dụng
                  </button>
                )}
              </div>
            </div>

            {/* Nút đặt hàng */}
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

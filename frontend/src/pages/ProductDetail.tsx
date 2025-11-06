import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShoppingCart, Heart, Star, Minus, Plus, Truck, Shield, RotateCcw, CheckCircle, User, Edit, Upload, X, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { cartService } from '../utils/cartService';
import { useAppSelector } from '../hooks';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  rating: number;
  reviewCount: number;
  category: string;
  brand?: string;
  brandId?: string;
  inStock: boolean;
  stock: number;
  description: string;
  features: string[];
  specifications: { [key: string]: string };
}

interface Review {
  id: string;
  userName: string;
  userId: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  productId: string;
  orderItemId?: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: '',
    brand: '',
    inStock: true,
    stock: '',
    description: '',
    image: ''
  });
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const userRole: 'guest' | 'user' | 'admin' = isAuthenticated && user ? (user.role.toLowerCase() as 'user' | 'admin') : 'guest';

  // Mock product data
  useEffect(() => {
    // Mock products database
    const mockProducts: { [key: string]: Product } = {
      '1': {
        id: '1',
        name: 'Camera IP Wifi 4K Ultra HD',
        price: 2500000,
        originalPrice: 3000000,
        image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        images: [
          'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1567443024551-6e3b63c8c816?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        ],
        rating: 4.8,
        reviewCount: 124,
        category: 'Camera An Ninh',
        brand: 'Hikvision',
        brandId: '1',
        inStock: true,
        stock: 25,
        description: 'Camera IP Wifi 4K Ultra HD với độ phân giải cao, hỗ trợ kết nối không dây và xem trực tiếp qua ứng dụng di động. Thiết kế chống nước IP67, phù hợp cho cả trong nhà và ngoài trời.',
        features: [
          'Độ phân giải 4K Ultra HD',
          'Kết nối Wifi ổn định',
          'Chống nước IP67',
          'Xem trực tiếp qua app',
          'Báo động thông minh',
          'Lưu trữ đám mây'
        ],
        specifications: {
          'Độ phân giải': '4K Ultra HD (3840x2160)',
          'Góc nhìn': '360°',
          'Kết nối': 'WiFi 2.4GHz/5GHz',
          'Chống nước': 'IP67',
          'Bộ nhớ': 'MicroSD lên đến 256GB',
          'Pin': '5000mAh (tùy chọn)',
          'Kích thước': '120x80x60mm',
          'Trọng lượng': '350g'
        }
      },
      '2': {
        id: '2',
        name: 'Khóa Cửa Thông Minh Vân Tay',
        price: 4200000,
        image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        images: [
          'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1567443024551-6e3b63c8c816?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        ],
        rating: 4.9,
        reviewCount: 89,
        category: 'Kiểm Soát Ra Vào',
        brand: 'Xiaomi',
        brandId: '3',
        inStock: true,
        stock: 15,
        description: 'Khóa cửa thông minh với cảm biến vân tay tiên tiến, hỗ trợ mở khóa bằng vân tay, mật khẩu, thẻ từ và app điện thoại. Thiết kế sang trọng, bảo mật cao.',
        features: [
          'Cảm biến vân tay chính xác',
          'Mở khóa đa phương thức',
          'Kết nối Bluetooth & WiFi',
          'Pin sử dụng 12 tháng',
          'Cảnh báo chống trộm',
          'Chống nước IP65'
        ],
        specifications: {
          'Loại khóa': 'Khóa vân tay điện tử',
          'Phương thức mở': 'Vân tay, Mật khẩu, Thẻ từ, App',
          'Dung lượng vân tay': 'Lên đến 100 vân tay',
          'Kết nối': 'Bluetooth 5.0 & WiFi',
          'Pin': 'Pin AA x 8 (12 tháng)',
          'Chống nước': 'IP65',
          'Kích thước': '340x75x30mm',
          'Trọng lượng': '2.8kg'
        }
      },
      '3': {
        id: '3',
        name: 'Hệ Thống Báo Động Không Dây',
        price: 1800000,
        originalPrice: 2200000,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        images: [
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1567443024551-6e3b63c8c816?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        ],
        rating: 4.7,
        reviewCount: 156,
        category: 'Hệ Thống Báo Động',
        brand: 'Dahua',
        brandId: '2',
        inStock: true,
        stock: 30,
        description: 'Hệ thống báo động không dây thông minh với cảm biến chuyển động, cửa ra vào và remote điều khiển từ xa. Dễ dàng lắp đặt và sử dụng.',
        features: [
          'Cảm biến chuyển động PIR',
          'Cảm biến cửa từ tính',
          'Remote điều khiển từ xa',
          'Còi báo động 120dB',
          'Kết nối WiFi & GSM',
          'Pin sạc lithium'
        ],
        specifications: {
          'Loại hệ thống': 'Báo động không dây',
          'Tần số': '433MHz',
          'Còi báo động': '120dB',
          'Kết nối': 'WiFi & GSM',
          'Số thiết bị': 'Lên đến 100 cảm biến',
          'Pin': 'Lithium 2000mAh',
          'Kích thước': '200x150x45mm',
          'Trọng lượng': '500g'
        }
      },
      '4': {
        id: '4',
        name: 'Camera Ngoài Trời Chống Nước IP67',
        price: 3200000,
        image: 'https://images.unsplash.com/photo-1567443024551-6e3b63c8c816?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        images: [
          'https://images.unsplash.com/photo-1567443024551-6e3b63c8c816?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        ],
        rating: 4.6,
        reviewCount: 203,
        category: 'Camera An Ninh',
        brand: 'Hikvision',
        brandId: '1',
        inStock: false,
        stock: 0,
        description: 'Camera ngoài trời chống nước chuẩn IP67, tầm nhìn ban đêm 30m, hỗ trợ ghi hình 2K HD. Phù hợp cho giám sát ngoài trời trong mọi điều kiện thời tiết.',
        features: [
          'Chống nước IP67',
          'Tầm nhìn ban đêm 30m',
          'Độ phân giải 2K HD',
          'Phát hiện chuyển động AI',
          'Lưu trữ cloud & local',
          'Chống bụi & chống va đập'
        ],
        specifications: {
          'Độ phân giải': '2K HD (2304x1296)',
          'Góc nhìn': '110°',
          'Tầm nhìn ban đêm': '30m',
          'Chống nước': 'IP67',
          'Kết nối': 'WiFi & Ethernet',
          'Bộ nhớ': 'MicroSD 128GB',
          'Kích thước': '180x90x90mm',
          'Trọng lượng': '650g'
        }
      },
      '5': {
        id: '5',
        name: 'Chuông Cửa Thông Minh Video',
        price: 1500000,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        images: [
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1567443024551-6e3b63c8c816?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        ],
        rating: 4.5,
        reviewCount: 78,
        category: 'Thiết Bị Thông Minh',
        brand: 'Xiaomi',
        brandId: '3',
        inStock: true,
        stock: 20,
        description: 'Chuông cửa video thông minh với camera HD, đàm thoại 2 chiều, phát hiện chuyển động và thông báo real-time qua app điện thoại.',
        features: [
          'Camera HD 1080p',
          'Đàm thoại 2 chiều',
          'Phát hiện chuyển động',
          'Thông báo qua app',
          'Tầm nhìn ban đêm',
          'Pin sạc lâu dài'
        ],
        specifications: {
          'Độ phân giải': '1080p Full HD',
          'Góc nhìn': '160°',
          'Kết nối': 'WiFi 2.4GHz',
          'Pin': 'Lithium 5000mAh',
          'Thời gian pin': '6 tháng',
          'Chống nước': 'IP54',
          'Kích thước': '130x45x25mm',
          'Trọng lượng': '180g'
        }
      },
      '6': {
        id: '6',
        name: 'Bộ Kit Camera 8 Kênh NVR',
        price: 8500000,
        originalPrice: 10000000,
        image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        images: [
          'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1567443024551-6e3b63c8c816?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        ],
        rating: 4.8,
        reviewCount: 45,
        category: 'Camera An Ninh',
        brand: 'Dahua',
        brandId: '2',
        inStock: true,
        stock: 8,
        description: 'Bộ kit camera giám sát 8 kênh NVR hoàn chỉnh, bao gồm đầu ghi 8 kênh, 8 camera IP 2MP và phụ kiện lắp đặt. Giải pháp hoàn hảo cho nhà xưởng, cửa hàng.',
        features: [
          'Đầu ghi NVR 8 kênh',
          '8 camera IP 2MP',
          'HDD 2TB tích hợp',
          'Xem từ xa qua app',
          'Ghi hình 24/7',
          'Phụ kiện lắp đặt đầy đủ'
        ],
        specifications: {
          'Số kênh': '8 kênh',
          'Độ phân giải camera': '2MP (1920x1080)',
          'HDD': '2TB',
          'Kết nối': 'Ethernet PoE',
          'Xem từ xa': 'App iOS & Android',
          'Nguồn': 'AC 220V',
          'Kích thước NVR': '380x320x52mm',
          'Trọng lượng': '15kg (full bộ)'
        }
      }
    };

    const mockProduct = mockProducts[id || '1'] || mockProducts['1'];

    const mockReviews: Review[] = [
      {
        id: '1',
        userName: 'Nguyễn Văn A',
        userId: 'user1',
        rating: 5,
        comment: 'Camera rất chất lượng, hình ảnh rõ nét. Dễ dàng cài đặt và sử dụng. Rất hài lòng với sản phẩm.',
        date: '2025-01-10',
        verified: true,
        status: 'APPROVED',
        productId: id || '1',
        orderItemId: 'OI001'
      },
      {
        id: '2',
        userName: 'Trần Thị B',
        userId: 'user2',
        rating: 4,
        comment: 'Sản phẩm tốt, giao hàng nhanh. Chỉ có điều app đôi lúc lag một chút nhưng vẫn chấp nhận được.',
        date: '2025-01-08',
        verified: true,
        status: 'APPROVED',
        productId: id || '1',
        orderItemId: 'OI002'
      },
      {
        id: '3',
        userName: 'Lê Văn C',
        userId: 'user3',
        rating: 5,
        comment: 'Đã mua 2 cái cho nhà và công ty. Hoạt động ổn định, bảo mật tốt. Giá cả hợp lý.',
        date: '2025-01-05',
        verified: true,
        status: 'PENDING',
        productId: id || '1',
        orderItemId: 'OI003'
      }
    ];

    setTimeout(() => {
      setProduct(mockProduct);
      setReviews(mockReviews);
      setLoading(false);
    }, 1000);
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    const success = await cartService.addToCart(product, quantity);
    if (success) {
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
      window.dispatchEvent(new Event('cartUpdated'));
    } else {
      toast.error('Thêm vào giỏ hàng thất bại. Vui lòng thử lại.');
    }
  };

  const handleBuyNow = () => {
    if (userRole === 'guest') {
      toast.info('Vui lòng đăng nhập để mua hàng!');
      navigate('/login');
      return;
    }

    if (!product) return;

    // Mock buy now - in real app, redirect to checkout
    console.log(`Buy now: ${quantity} x ${product.name}`);
    toast.success('Đang chuyển đến trang thanh toán...');
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Đã xóa khỏi danh sách yêu thích' : 'Đã thêm vào danh sách yêu thích');
  };

  const handleEditProduct = () => {
    if (!product) return;
    setEditFormData({
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      category: product.category,
      brand: product.brand || '',
      inStock: product.inStock,
      stock: product.stock.toString(),
      description: product.description,
      image: product.image
    });
    setEditImagePreviews(product.images || [product.image]);
    setIsEditModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setEditImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveEdit = () => {
    if (!product) return;
    
    // Validate form
    if (!editFormData.name || !editFormData.price || !editFormData.category) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    if (editImagePreviews.length === 0) {
      toast.error('Vui lòng thêm ít nhất một ảnh sản phẩm!');
      return;
    }

    // Update product with new data
    const updatedProduct: Product = {
      ...product,
      name: editFormData.name,
      price: parseFloat(editFormData.price),
      originalPrice: editFormData.originalPrice ? parseFloat(editFormData.originalPrice) : undefined,
      category: editFormData.category,
      brand: editFormData.brand || undefined,
      inStock: editFormData.inStock,
      stock: parseInt(editFormData.stock),
      description: editFormData.description,
      images: editImagePreviews,
      image: editImagePreviews[0] // Set first image as main image
    };

    setProduct(updatedProduct);
    
    // In a real app, this would make an API call
    toast.success('Đã cập nhật sản phẩm thành công!');
    setIsEditModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleOpenReviewModal = () => {
    if (userRole === 'guest') {
      toast.info('Vui lòng đăng nhập để viết đánh giá!');
      navigate('/login');
      return;
    }
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setNewReview({ rating: 5, comment: '' });
  };

  const handleSubmitReview = () => {
    if (!newReview.comment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá!');
      return;
    }

    if (newReview.comment.length > 1000) {
      toast.error('Nội dung đánh giá không được vượt quá 1000 ký tự!');
      return;
    }

    const review: Review = {
      id: Date.now().toString(),
      userName: user?.name || 'Anonymous',
      userId: user?.id || 'guest',
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString(),
      verified: true, // Assume user has purchased
      status: 'PENDING', // Will be PENDING until admin approves
      productId: product?.id || '',
      orderItemId: 'OI' + Date.now()
    };

    setReviews([review, ...reviews]);
    toast.success('Đánh giá của bạn đã được gửi và đang chờ duyệt!');
    handleCloseReviewModal();
  };

  const handleApproveReview = (reviewId: string) => {
    setReviews(reviews.map(r => 
      r.id === reviewId ? { ...r, status: 'APPROVED' as const } : r
    ));
    toast.success('Đã phê duyệt đánh giá!');
  };

  const handleRejectReview = (reviewId: string) => {
    setReviews(reviews.map(r => 
      r.id === reviewId ? { ...r, status: 'REJECTED' as const } : r
    ));
    toast.success('Đã từ chối đánh giá!');
  };

  const handleDeleteReview = (reviewId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      setReviews(reviews.filter(r => r.id !== reviewId));
      toast.success('Đã xóa đánh giá thành công!');
    }
  };

  // Filter reviews by rating
  const filteredReviews = filterRating 
    ? reviews.filter(r => r.rating === filterRating && (userRole === 'admin' ? true : r.status === 'APPROVED'))
    : reviews.filter(r => userRole === 'admin' ? true : r.status === 'APPROVED');

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
              <div className="space-y-4">
                <div className="w-full h-96 bg-gray-300 rounded-lg"></div>
                <div className="flex space-x-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-20 h-20 bg-gray-300 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="text-gray-700 hover:text-purple-600">Trang chủ</Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link to="/products" className="text-gray-700 hover:text-purple-600">Sản phẩm</Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex space-x-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-purple-600' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-cyan-500 font-medium uppercase tracking-wide">
                    {product.category}
                  </span>
                  {product.brand && (
                    <span className="text-sm text-purple-600 font-semibold bg-purple-50 px-3 py-1 rounded-full">
                      {product.brand}
                    </span>
                  )}
                </div>
                {userRole === 'admin' && (
                  <button
                    onClick={handleEditProduct}
                    className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Edit className="h-4 w-4" />
                    Chỉnh sửa
                  </button>
                )}
              </div>
              <h1 className="text-3xl font-bold text-zinc-800 mt-2">{product.name}</h1>
              
              <div className="flex items-center mt-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 ml-2">
                  {product.rating} ({product.reviewCount} đánh giá)
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-purple-600">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="bg-pink-100 text-pink-600 px-2 py-1 rounded text-sm font-medium">
                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <span className={`flex items-center ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                {product.inStock ? <CheckCircle className="h-5 w-5 mr-2" /> : null}
                {product.inStock ? 'Còn hàng' : 'Hết hàng'}
              </span>
              {product.inStock && (
                <span className="text-gray-600">Còn {product.stock} sản phẩm</span>
              )}
            </div>

            <p className="text-gray-700 leading-relaxed">{product.description}</p>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <span className="font-medium text-gray-900">Số lượng:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2 hover:bg-gray-50 disabled:opacity-50"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 text-center min-w-[3rem]">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-2 hover:bg-gray-50 disabled:opacity-50"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {product.inStock ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-gray-100 text-zinc-800 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Thêm vào giỏ hàng
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Mua ngay
                  </button>
                </>
              ) : (
                <div className="w-full bg-gray-200 text-gray-600 px-6 py-3 rounded-lg text-center font-medium cursor-not-allowed">
                  Hết hàng
                </div>
              )}

              {/* Wishlist luôn hoạt động */}
              <button
                onClick={handleWishlist}
                className={`p-3 rounded-lg border ${
                  isWishlisted
                    ? 'bg-pink-50 border-pink-200 text-pink-600'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Features */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-zinc-800 mb-4">Tính năng nổi bật</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Shipping Info */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center text-gray-700">
                <Truck className="h-5 w-5 text-cyan-500 mr-3" />
                <span>Giao hàng toàn quốc trong 24-48h</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Shield className="h-5 w-5 text-purple-500 mr-3" />
                <span>Bảo hành chính hãng 2 năm</span>
              </div>
              <div className="flex items-center text-gray-700">
                <RotateCcw className="h-5 w-5 text-pink-500 mr-3" />
                <span>Đổi trả miễn phí trong 30 ngày</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Specifications */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gray-50 rounded-lg p-6 mb-12"
        >
          <h2 className="text-2xl font-bold text-zinc-800 mb-6">Thông số kỹ thuật</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-900">{key}</span>
                <span className="text-gray-700">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-zinc-800">
              Đánh giá từ khách hàng ({filteredReviews.length})
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <div className="flex items-center mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-zinc-800">{product.rating}</span>
              </div>
              <button
                onClick={handleOpenReviewModal}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Viết đánh giá
              </button>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Lọc theo:</span>
            <button
              onClick={() => setFilterRating(null)}
              className={`px-3 py-1 rounded-full text-sm ${
                filterRating === null 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => setFilterRating(rating)}
                className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                  filterRating === rating 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {rating} <Star className="h-3 w-3 fill-current" />
              </button>
            ))}
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  {filterRating 
                    ? `Chưa có đánh giá ${filterRating} sao nào` 
                    : 'Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!'}
                </p>
              </div>
            ) : (
              filteredReviews.map((review) => (
                <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-zinc-800">{review.userName}</span>
                          {review.verified && (
                            <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                              Đã mua hàng
                            </span>
                          )}
                          {/* Status badge for admin */}
                          {userRole === 'admin' && (
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              review.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                              review.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {review.status === 'APPROVED' ? 'Đã duyệt' :
                               review.status === 'REJECTED' ? 'Đã từ chối' : 'Chờ duyệt'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-500 ml-2">
                            {new Date(review.date).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Admin actions */}
                    {userRole === 'admin' && (
                      <div className="flex items-center gap-2">
                        {review.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproveReview(review.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Phê duyệt"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleRejectReview(review.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Từ chối"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </main>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Viết đánh giá sản phẩm</h3>
              <button onClick={handleCloseReviewModal} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Rating selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đánh giá của bạn *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 cursor-pointer transition-colors ${
                          rating <= newReview.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 hover:text-yellow-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    ({newReview.rating}/5 sao)
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhận xét của bạn * <span className="text-xs text-gray-500">(tối đa 1000 ký tự)</span>
                </label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={5}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {newReview.comment.length}/1000 ký tự
                </p>
              </div>

              {/* Info note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Lưu ý:</strong> Đánh giá của bạn sẽ được kiểm duyệt trước khi hiển thị công khai. 
                  Vui lòng đánh giá khách quan và trung thực.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseReviewModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitReview}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                Gửi đánh giá
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Chỉnh sửa sản phẩm</h3>
              <button onClick={handleCloseEditModal} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập tên sản phẩm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá (VND) *
                </label>
                <input
                  type="number"
                  value={editFormData.price}
                  onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập giá sản phẩm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá gốc (VND) - Không bắt buộc
                </label>
                <input
                  type="number"
                  value={editFormData.originalPrice}
                  onChange={(e) => setEditFormData({...editFormData, originalPrice: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập giá gốc nếu có khuyến mãi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục *
                </label>
                <select
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Chọn danh mục</option>
                  <option value="Camera An Ninh">Camera An Ninh</option>
                  <option value="Khóa Thông Minh">Khóa Thông Minh</option>
                  <option value="Báo Động">Báo Động</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thương hiệu
                </label>
                <select
                  value={editFormData.brand}
                  onChange={(e) => setEditFormData({...editFormData, brand: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Chọn thương hiệu</option>
                  <option value="Hikvision">Hikvision</option>
                  <option value="Dahua">Dahua</option>
                  <option value="Xiaomi">Xiaomi</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tồn kho
                </label>
                <input
                  type="number"
                  value={editFormData.stock}
                  onChange={(e) => setEditFormData({...editFormData, stock: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập số lượng tồn kho"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh sản phẩm
                </label>
                
                {/* Upload button */}
                <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
                  <Upload className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Chọn ảnh từ máy tính</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">Có thể chọn nhiều ảnh. Hỗ trợ: JPG, PNG, GIF</p>
                
                {/* Image previews */}
                {editImagePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {editImagePreviews.map((image, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={image} 
                          alt={`Preview ${index + 1}`}
                          className="h-24 w-full rounded-lg object-cover border-2 border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Nhập mô tả sản phẩm"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editInStock"
                  checked={editFormData.inStock}
                  onChange={(e) => setEditFormData({...editFormData, inStock: e.target.checked})}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="editInStock" className="ml-2 text-sm text-gray-700">
                  Còn hàng
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseEditModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProductDetail;
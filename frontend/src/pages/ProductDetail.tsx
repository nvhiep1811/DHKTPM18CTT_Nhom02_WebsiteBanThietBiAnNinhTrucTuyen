import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShoppingCart, Heart, Star, Minus, Plus, Truck, Shield, RotateCcw, CheckCircle, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { cartService } from '../utils/cartService';

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
  inStock: boolean;
  stock: number;
  description: string;
  features: string[];
  specifications: { [key: string]: string };
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
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

  const userRole: 'guest' | 'customer' | 'admin' = 'guest';

  // Mock product data
  useEffect(() => {
    const mockProduct: Product = {
      id: id || '1',
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
    };

    const mockReviews: Review[] = [
      {
        id: '1',
        userName: 'Nguyễn Văn A',
        rating: 5,
        comment: 'Camera rất chất lượng, hình ảnh rõ nét. Dễ dàng cài đặt và sử dụng. Rất hài lòng với sản phẩm.',
        date: '2025-01-10',
        verified: true
      },
      {
        id: '2',
        userName: 'Trần Thị B',
        rating: 4,
        comment: 'Sản phẩm tốt, giao hàng nhanh. Chỉ có điều app đôi lúc lag một chút nhưng vẫn chấp nhận được.',
        date: '2025-01-08',
        verified: true
      },
      {
        id: '3',
        userName: 'Lê Văn C',
        rating: 5,
        comment: 'Đã mua 2 cái cho nhà và công ty. Hoạt động ổn định, bảo mật tốt. Giá cả hợp lý.',
        date: '2025-01-05',
        verified: true
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
              <span className="text-sm text-cyan-500 font-medium uppercase tracking-wide">
                {product.category}
              </span>
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
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 bg-gray-100 text-zinc-800 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                Thêm vào giỏ hàng
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mua ngay
              </button>
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
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-zinc-800">
              Đánh giá từ khách hàng ({reviews.length})
            </h2>
            <div className="flex items-center">
              <div className="flex items-center mr-4">
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
          </div>

          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium text-zinc-800 mr-2">{review.userName}</span>
                        {review.verified && (
                          <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                            Đã mua hàng
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
                </div>
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
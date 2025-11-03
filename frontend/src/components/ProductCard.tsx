import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Star, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  category: string;
  inStock: boolean;
}

interface ProductCardProps {
  product: Product;
  userRole?: 'guest' | 'user' | 'admin';
  onAddToCart?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  userRole = 'guest',
  onAddToCart,
  onDeleteProduct
}) => {
  const handleAddToCart = async () => {
    await onAddToCart?.(product);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col group relative"
    >

      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute top-2 left-2 bg-pink-400 text-white px-2 py-1 rounded text-xs font-semibold">
            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">Hết hàng</span>
          </div>
        )}

        {/* Eye icon for all users - always visible on hover */}
        <Link
          to={`/products/${product.id}`}
          className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Eye className="h-4 w-4 text-zinc-800" />
        </Link>

        {/* Admin delete button */}
        {userRole === 'admin' && (
          <button
            onClick={() => onDeleteProduct?.(product.id)}
            className="absolute top-2 right-14 bg-red-600 p-2 rounded-full shadow-md hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Xóa sản phẩm"
          >
            <Trash2 className="h-4 w-4 text-white" />
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-cyan-500 font-medium uppercase tracking-wide">
            {product.category}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-zinc-800 mb-2 line-clamp-2 min-h-[3.5rem]">
          <Link to={`/products/${product.id}`} className="hover:text-purple-600 transition-colors">
            {product.name}
          </Link>
        </h3>

        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            ({product.reviewCount})
          </span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-purple-600">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto flex space-x-2">
          <Link
            to={`/products/${product.id}`}
            className="flex-1 bg-gray-100 text-zinc-800 px-4 py-2 rounded-lg text-center hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Xem chi tiết
          </Link>
          {product.inStock && userRole !== 'admin' && (
            <button
              onClick={handleAddToCart}
              className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
              aria-label="Thêm vào giỏ hàng"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
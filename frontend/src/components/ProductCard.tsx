import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Star, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import type { ProductSummary } from '../types/types';

interface ProductCardProps {
  product: ProductSummary;
  onAddToCart?: (product: ProductSummary) => Promise<void> | void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [isAdding, setIsAdding] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);

  const handleAddToCart = async () => {
    if (!product.inStock) {
      toast.warning('Sản phẩm hiện đã hết hàng!');
      return;
    }

    if (product.availableStock !== undefined && product.availableStock <= 0) {
      toast.warning('Sản phẩm tạm hết trong kho!');
      return;
    }

    if (!onAddToCart) {
      toast.error('Không thể thêm sản phẩm — chưa có handler.');
      return;
    }

    try {
      setIsAdding(true);
      await onAddToCart(product);
      window.dispatchEvent(new Event('cartUpdated'));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col group relative"
    >
      {/* Product image */}
      <div className="relative">
        <img
          src={product.thumbnailUrl}
          alt={product.name}
          className="w-full h-48 object-cover"
          loading="lazy"
        />

        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">Hết hàng</span>
          </div>
        )}

        {/* View details */}
        <Link
          to={`/products/${product.id}`}
          className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Eye className="h-4 w-4 text-zinc-800" />
        </Link>
      </div>

      {/* Product info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-cyan-500 font-medium uppercase tracking-wide">
            {product.category.name}
          </span>
          {product.brand && (
            <span className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-1 rounded">
              {product.brand.name}
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-zinc-800 mb-2 line-clamp-2 min-h-[3.5rem]">
          <Link
            to={`/products/${product.id}`}
            className="hover:text-purple-600 transition-colors"
          >
            {product.name}
          </Link>
        </h3>

        {product.reviewCount > 0 && (
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
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-purple-600">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-auto flex space-x-2">
          <Link
            to={`/products/${product.id}`}
            className="flex-1 bg-gray-100 text-zinc-800 px-4 py-2 rounded-lg text-center hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Xem chi tiết
          </Link>

          {product.inStock ? (
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors ${
                isAdding ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              aria-label="Thêm vào giỏ hàng"
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
            </button>
          ) : (
            <button
              disabled
              className="bg-gray-200 text-gray-500 p-2 rounded-lg cursor-not-allowed"
              aria-label="Hết hàng"
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
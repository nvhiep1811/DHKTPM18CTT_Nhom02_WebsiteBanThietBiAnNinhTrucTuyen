import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';
import { cartService } from '../utils/cartService';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

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

interface FeaturedProductsProps {
  userRole?: 'guest' | 'user' | 'admin';
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ userRole = 'guest' }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - In real app, this would be an API call
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Camera IP Wifi 4K Ultra HD',
        price: 2500000,
        originalPrice: 3000000,
        image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        rating: 4.8,
        reviewCount: 124,
        category: 'Camera An Ninh',
        inStock: true
      },
      {
        id: '2',
        name: 'Khóa Cửa Thông Minh Vân Tay',
        price: 4200000,
        image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        rating: 4.9,
        reviewCount: 89,
        category: 'Khóa Thông Minh',
        inStock: true
      },
      {
        id: '3',
        name: 'Hệ Thống Báo Động Không Dây',
        price: 1800000,
        originalPrice: 2200000,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        rating: 4.7,
        reviewCount: 156,
        category: 'Báo Động',
        inStock: true
      },
      {
        id: '4',
        name: 'Camera Ngoài Trời Chống Nước IP67',
        price: 3200000,
        image: 'https://images.unsplash.com/photo-1567443024551-6e3b63c8c816?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        rating: 4.6,
        reviewCount: 203,
        category: 'Camera An Ninh',
        inStock: false
      }
    ];

    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddToCart = async(product: Product) => {
    const success = await cartService.addToCart(product);
    if (success) {
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
      window.dispatchEvent(new Event('cartUpdated'));
    } else {
      toast.error('Thêm vào giỏ hàng thất bại. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-800 mb-4">Sản Phẩm Nổi Bật</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-300"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-zinc-800 mb-4">Sản Phẩm Nổi Bật</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Khám phá những sản phẩm an ninh được khách hàng tin tưởng và lựa chọn nhiều nhất
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <ProductCard
                product={product}
                userRole={userRole}
                onAddToCart={handleAddToCart}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            to="/products"
            className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Xem Tất Cả Sản Phẩm
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
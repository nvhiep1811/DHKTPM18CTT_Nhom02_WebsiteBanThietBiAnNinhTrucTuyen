import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Camera, Lock, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

const HeroSection: React.FC = () => {
  const features = [
    {
      icon: Camera,
      title: 'Camera An Ninh',
      description: 'Giám sát 24/7 với chất lượng HD'
    },
    {
      icon: Lock,
      title: 'Khóa Thông Minh',
      description: 'Bảo mật tối đa cho ngôi nhà'
    },
    {
      icon: Shield,
      title: 'Hệ Thống Báo Động',
      description: 'Cảnh báo tức thì khi có xâm nhập'
    },
    {
      icon: Smartphone,
      title: 'Điều Khiển Từ Xa',
      description: 'Quản lý mọi lúc mọi nơi qua app'
    }
  ];

  return (
    <section className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-zinc-800 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Bảo Vệ An Toàn
                <span className="block text-cyan-500">Ngôi Nhà Của Bạn</span>
              </h1>
              <p className="text-xl text-gray-200 leading-relaxed">
                Khám phá bộ sưu tập thiết bị an ninh hiện đại với công nghệ tiên tiến, 
                đảm bảo an toàn tuyệt đối cho gia đình và doanh nghiệp.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="bg-cyan-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-cyan-600 transition-colors text-center"
              >
                Khám Phá Sản Phẩm
              </Link>
              <Link
                to="/contact"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors text-center"
              >
                Tư Vấn Miễn Phí
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-400">1000+</div>
                <div className="text-gray-300">Khách hàng tin tưởng</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-400">24/7</div>
                <div className="text-gray-300">Hỗ trợ kỹ thuật</div>
              </div>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Security System"
              className="rounded-lg shadow-2xl"
              loading="eager"
            />
            <div className="absolute -bottom-6 -left-6 bg-white text-zinc-800 p-6 rounded-lg shadow-xl">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="font-bold">Bảo hành 2 năm</div>
                  <div className="text-sm text-gray-600">Chính hãng 100%</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-center hover:bg-opacity-20 transition-all duration-300"
            >
              <feature.icon className="h-12 w-12 text-cyan-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-300 text-sm">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
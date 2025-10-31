import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-purple-600" />
              <span className="text-xl font-bold">SecureShop</span>
            </div>
            <p className="text-gray-300 text-sm">
              Chuyên cung cấp thiết bị an ninh chất lượng cao, đảm bảo an toàn cho ngôi nhà và doanh nghiệp của bạn.
            </p>
            <div className="flex space-x-4">
              <Link to="#" className="text-gray-300 hover:text-cyan-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link to="#" className="text-gray-300 hover:text-cyan-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link to="#" className="text-gray-300 hover:text-cyan-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-600">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-cyan-500 transition-colors text-sm">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-cyan-500 transition-colors text-sm">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-cyan-500 transition-colors text-sm">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-cyan-500 transition-colors text-sm">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Product Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-600">Danh mục sản phẩm</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products?category=camera" className="text-gray-300 hover:text-cyan-500 transition-colors text-sm">
                  Camera an ninh
                </Link>
              </li>
              <li>
                <Link to="/products?category=alarm" className="text-gray-300 hover:text-cyan-500 transition-colors text-sm">
                  Hệ thống báo động
                </Link>
              </li>
              <li>
                <Link to="/products?category=access" className="text-gray-300 hover:text-cyan-500 transition-colors text-sm">
                  Kiểm soát ra vào
                </Link>
              </li>
              <li>
                <Link to="/products?category=smart" className="text-gray-300 hover:text-cyan-500 transition-colors text-sm">
                  Thiết bị thông minh
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-600">Thông tin liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                <span className="text-gray-300 text-sm">123 Đường ABC, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                <span className="text-gray-300 text-sm">0123 456 789</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                <span className="text-gray-300 text-sm">info@secureshop.vn</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-300 text-sm">
              © 2025 SecureShop. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-gray-300 hover:text-cyan-500 transition-colors text-sm">
                Chính sách bảo mật
              </Link>
              <Link to="/terms" className="text-gray-300 hover:text-cyan-500 transition-colors text-sm">
                Điều khoản sử dụng
              </Link>
            </div>
            <p className="text-gray-300 text-sm">
              Built with ❤️ by <Link rel="nofollow" target="_blank" to="https://fiveting.dev" className="text-cyan-500 hover:text-cyan-400 transition-colors">Fiveting</Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
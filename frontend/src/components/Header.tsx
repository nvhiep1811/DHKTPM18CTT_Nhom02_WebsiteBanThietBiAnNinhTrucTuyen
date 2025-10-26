import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Shield, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cartService } from '../utils/cartService';

interface HeaderProps {
  userRole?: 'guest' | 'customer' | 'admin';
}

const Header: React.FC<HeaderProps> = ({ userRole = 'guest' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const navigate = useNavigate();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleAuthAction = () => {
    if (userRole === 'guest') {
      navigate('/login');
    } else {
      // Handle logout
      navigate('/');
    }
  };

  useEffect(() => {
    const updateCartCount = async () => {
      const count = await cartService.getCartCount();
      setCartItemCount(count);
    };
    
    // Load lần đầu
    updateCartCount();

    // Listen cho updates
    window.addEventListener('cartUpdated', updateCartCount);
    
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-purple-600" />
            <span className="text-xl font-bold text-zinc-800">SecureShop</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-zinc-800 hover:text-purple-600 transition-colors">
              Trang chủ
            </Link>
            <Link to="/products" className="text-zinc-800 hover:text-purple-600 transition-colors">
              Sản phẩm
            </Link>
            <Link to="/about" className="text-zinc-800 hover:text-purple-600 transition-colors">
              Giới thiệu
            </Link>
            <Link to="/contact" className="text-zinc-800 hover:text-purple-600 transition-colors">
              Liên hệ
            </Link>
            {userRole === 'admin' && (
              <Link to="/admin" className="text-zinc-800 hover:text-purple-600 transition-colors">
                Quản trị
              </Link>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-zinc-800 hover:text-purple-600 transition-colors">
              <Search className="h-5 w-5" />
            </button>
            
            <Link to="/cart" className="relative p-2 text-zinc-800 hover:text-purple-600 transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-400 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            <button
              onClick={handleAuthAction}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <User className="h-4 w-4" />
              <span>{userRole === 'guest' ? 'Đăng nhập' : 'Tài khoản'}</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-zinc-800 hover:text-purple-600 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-4">
              <Link
                to="/"
                className="block text-zinc-800 hover:text-purple-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Trang chủ
              </Link>
              <Link
                to="/products"
                className="block text-zinc-800 hover:text-purple-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sản phẩm
              </Link>
              <Link
                to="/about"
                className="block text-zinc-800 hover:text-purple-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Giới thiệu
              </Link>
              <Link
                to="/contact"
                className="block text-zinc-800 hover:text-purple-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Liên hệ
              </Link>
              {userRole === 'admin' && (
                <Link
                  to="/admin"
                  className="block text-zinc-800 hover:text-purple-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Quản trị
                </Link>
              )}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleAuthAction}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {userRole === 'guest' ? 'Đăng nhập' : 'Tài khoản'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
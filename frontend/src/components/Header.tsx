import React, { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  Shield,
  Search,
  LogOut,
  Package,
  UserCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cartService } from "../utils/cartService";
import { useAppDispatch, useAppSelector } from "../hooks";
import { logout } from "../stores/authSlice";

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  const handleLogout = () => {
    dispatch(logout());
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const updateCartCount = async () => {
      const count = await cartService.getCartCount();
      setCartItemCount(count);
    };

    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);
    return () => window.removeEventListener("cartUpdated", updateCartCount);
  }, []);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `relative font-medium transition-colors pb-1 after:content-[''] after:absolute after:left-0 after:-bottom-[2px] after:h-[2px] after:w-full after:scale-x-0 after:origin-right after:transition-transform after:duration-300 ${
      isActive
        ? "text-purple-600 after:scale-x-100 after:origin-left after:bg-purple-600"
        : "text-zinc-800 hover:text-purple-600 hover:after:scale-x-100 hover:after:origin-left after:bg-purple-300"
    }`;

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* === Header Top === */}
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-purple-600" />
            <span className="text-xl font-bold text-zinc-800">SecureShop</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to="/" className={navClass}>
              Trang chủ
            </NavLink>
            <NavLink to="/products" className={navClass}>
              Sản phẩm
            </NavLink>
            <NavLink to="/about" className={navClass}>
              Giới thiệu
            </NavLink>
            <NavLink to="/contact" className={navClass}>
              Liên hệ
            </NavLink>
            {user?.role === "admin" && (
              <NavLink to="/admin" className={navClass}>
                Quản trị
              </NavLink>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-zinc-800 hover:text-purple-600 transition-colors">
              <Search className="h-5 w-5" />
            </button>

            <Link
              to="/cart"
              className="relative p-2 text-zinc-800 hover:text-purple-600 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* USER MENU */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="User Avatar"
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                  <span className="max-w-32 truncate">
                    {user.name || user.email}
                  </span>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                    >
                      <div className="py-2">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <UserCircle className="h-4 w-4 mr-2" />
                          Thông tin cá nhân
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Đơn hàng của tôi
                        </Link>
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Đăng xuất
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <Link
              to="/cart"
              className="relative p-2 text-zinc-800 hover:text-purple-600 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            <button
              onClick={toggleMobileMenu}
              className="p-2 text-zinc-800 hover:text-purple-600 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* === Mobile Menu === */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200 shadow-lg"
          >
            <div className="flex flex-col px-5 py-4 space-y-2">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `block w-full px-3 py-2 rounded-md text-base font-medium text-center ${
                    isActive
                      ? "bg-purple-100 text-purple-700"
                      : "text-zinc-700 hover:bg-purple-50 hover:text-purple-600"
                  }`
                }
                onClick={toggleMobileMenu}
              >
                Trang chủ
              </NavLink>

              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `block w-full px-3 py-2 rounded-md text-base font-medium text-center ${
                    isActive
                      ? "bg-purple-100 text-purple-700"
                      : "text-zinc-700 hover:bg-purple-50 hover:text-purple-600"
                  }`
                }
                onClick={toggleMobileMenu}
              >
                Sản phẩm
              </NavLink>

              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `block w-full px-3 py-2 rounded-md text-base font-medium text-center ${
                    isActive
                      ? "bg-purple-100 text-purple-700"
                      : "text-zinc-700 hover:bg-purple-50 hover:text-purple-600"
                  }`
                }
                onClick={toggleMobileMenu}
              >
                Giới thiệu
              </NavLink>

              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `block w-full px-3 py-2 rounded-md text-base font-medium text-center ${
                    isActive
                      ? "bg-purple-100 text-purple-700"
                      : "text-zinc-700 hover:bg-purple-50 hover:text-purple-600"
                  }`
                }
                onClick={toggleMobileMenu}
              >
                Liên hệ
              </NavLink>

              {user?.role === "admin" && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `block w-full px-3 py-2 rounded-md text-base font-medium text-center ${
                      isActive
                        ? "bg-purple-100 text-purple-700"
                        : "text-zinc-700 hover:bg-purple-50 hover:text-purple-600"
                    }`
                  }
                  onClick={toggleMobileMenu}
                >
                  Quản trị
                </NavLink>
              )}

              <hr className="my-2 border-gray-200" />

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={toggleMobileMenu}
                    className="block text-sm text-gray-700"
                  >
                    <UserCircle className="inline h-4 w-4 mr-1" /> Hồ sơ
                  </Link>
                  <Link
                    to="/orders"
                    onClick={toggleMobileMenu}
                    className="block text-sm text-gray-700"
                  >
                    <Package className="inline h-4 w-4 mr-1" /> Đơn hàng
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block text-sm text-red-600 w-full text-left"
                  >
                    <LogOut className="inline h-4 w-4 mr-1" /> Đăng xuất
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={toggleMobileMenu}
                  className="block bg-purple-600 text-white px-4 py-2 rounded-lg text-center"
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
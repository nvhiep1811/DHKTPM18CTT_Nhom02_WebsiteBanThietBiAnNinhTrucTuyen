import React, { useEffect, useState, useRef } from "react";
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

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // 🔍 Example mock data for search
  const allProducts: Product[] = [
    {
      id: "1",
      name: "Camera IP Wifi 4K Ultra HD",
      price: 2500000,
      image:
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=80&q=80",
    },
    {
      id: "2",
      name: "Khóa Cửa Thông Minh Vân Tay",
      price: 4200000,
      image:
        "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=80&q=80",
    },
    {
      id: "3",
      name: "Hệ Thống Báo Động Không Dây",
      price: 1800000,
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=80&q=80",
    },
  ];

  // 🧠 Search filtering
  useEffect(() => {
    if (searchTerm.trim()) {
      const results = allProducts.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results.slice(0, 5));
    } else setSearchResults([]);
  }, [searchTerm]);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen)
      setTimeout(() => searchInputRef.current?.focus(), 100);
    else {
      setSearchTerm("");
      setSearchResults([]);
    }
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setIsSearchOpen(false);
      setSearchTerm("");
    }
  };

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
            {user?.role?.toLowerCase() === "admin" && (
              <NavLink to="/admin" className={navClass}>
                Quản trị
              </NavLink>
            )}
          </nav>

          {/* Desktop Actions */}
          <motion.div
            className="hidden md:flex items-center space-x-4 relative"
            animate={{ marginLeft: isSearchOpen ? 12 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* === Search Bar === */}
            <div ref={searchRef} className="relative flex items-center">
              <AnimatePresence>
                {isSearchOpen ? (
                  <motion.div
                    initial={{ width: 0, opacity: 0, scaleX: 0, originX: 1 }}
                    animate={{
                      width: 320,
                      opacity: 1,
                      scaleX: 1,
                      originX: 1,
                      marginLeft: 8,
                      marginRight: 8,
                    }}
                    exit={{
                      width: 0,
                      opacity: 0,
                      scaleX: 0,
                      originX: 0,
                      marginLeft: 0,
                      marginRight: 0,
                    }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center"
                  >
                    <form onSubmit={handleSearchSubmit} className="relative w-full">
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-72 pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <button
                        type="button"
                        onClick={toggleSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </form>

                    {/* Search Results */}
                    <AnimatePresence>
                      {searchTerm && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-50"
                        >
                          {searchResults.length > 0 ? (
                            searchResults.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => {
                                  navigate(`/products/${p.id}`);
                                  setIsSearchOpen(false);
                                  setSearchTerm("");
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                              >
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-10 h-10 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-zinc-800">
                                    {p.name}
                                  </p>
                                  <p className="text-xs text-purple-600 font-semibold">
                                    {p.price.toLocaleString("vi-VN")} đ
                                  </p>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500">
                              Không tìm thấy sản phẩm
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <button
                    onClick={toggleSearch}
                    className="p-2 text-zinc-800 hover:text-purple-600 transition-colors"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
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

            {/* User menu */}
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
          </motion.div>

          {/* === Mobile Menu Button === */}
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
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* === Mobile Menu (unchanged) === */}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;

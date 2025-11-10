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
  TrendingUp,
  Clock,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cartService } from "../utils/cartService";
import { useAppDispatch, useAppSelector } from "../hooks";
import { logout } from "../stores/authSlice";
import { productApi } from "../utils/api";
import type { ProductSummary } from "../types/types";

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ProductSummary[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  const popularSearches = ["Camera 4K", "Khóa vân tay", "Báo động", "Chuông cửa"];

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Search filtering with debounce
  useEffect(() => {
    if (searchTerm.trim()) {
      setIsSearching(true);
    }

    const timeoutId = setTimeout(async () => {
      if (searchTerm.trim()) {
        try {
          const results = await productApi.getAll({ keyword: searchTerm });
          setSearchResults(results.content);
        } catch {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const toggleSearch = () => {
    const newState = !isSearchOpen;
    setIsSearchOpen(newState);
    
    if (newState) {
      // Use requestAnimationFrame for better timing with animations
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (isMobile) {
            mobileSearchInputRef.current?.focus();
          } else {
            searchInputRef.current?.focus();
          }
        }, 50);
      });
    } else {
      setSearchTerm("");
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setSearchTerm("");
        setSearchResults([]);
      }
    };

    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    const updateCartCount = async () => {
      const count = await cartService.getCartCount();
      setCartItemCount(count);
    };
    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);
    return () => window.removeEventListener("cartUpdated", updateCartCount);
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchTerm.trim()) {
      saveRecentSearch(searchTerm);
      navigate(`/products`, { state: { keyword: searchTerm } });
      setIsSearchOpen(false);
      setSearchTerm("");
      setSearchResults([]);
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
    setIsSearchOpen(false);
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleQuickSearch = (term: string) => {
    setSearchTerm(term);
    if (isMobile) {
      mobileSearchInputRef.current?.focus();
    } else {
      searchInputRef.current?.focus();
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
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-purple-600" />
            <span className="text-lg sm:text-xl font-bold text-zinc-800">SecureShop</span>
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
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Container */}
            <div ref={searchRef} className="relative">
              <AnimatePresence mode="wait">
                {isSearchOpen ? (
                  <motion.div
                    key="search-open"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 380, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <form onSubmit={handleSearchSubmit} className="relative">
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 h-5 w-5 pointer-events-none" />
                      <button
                        type="button"
                        onClick={toggleSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </form>

                    {/* Enhanced Search Dropdown */}
                    <AnimatePresence>
                      {isSearchOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-[480px] overflow-y-auto"
                        >
                          {isSearching ? (
                            <div className="px-4 py-8 text-center">
                              <Loader2 className="h-8 w-8 text-purple-500 animate-spin mx-auto mb-3" />
                              <p className="text-gray-500 text-sm">Đang tìm kiếm...</p>
                            </div>
                          ) : searchTerm ? (
                            // Search Results
                            searchResults.length > 0 ? (
                              <div>
                                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                    Kết quả tìm kiếm ({searchResults.length})
                                  </p>
                                </div>
                                <div className="py-1">
                                  {searchResults.slice(0, 5).map((product, index) => (
                                    <motion.button
                                      key={product.id}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                      onClick={() => handleProductClick(product.id)}
                                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors group"
                                    >
                                      <div className="relative flex-shrink-0">
                                        <img
                                          src={product.thumbnailUrl}
                                          alt={product.name}
                                          className="w-12 h-12 object-cover rounded-lg border border-gray-200 group-hover:border-purple-300 transition-colors"
                                        />
                                      </div>
                                      <div className="flex-1 text-left min-w-0">
                                        <p className="text-sm font-medium text-zinc-800 group-hover:text-purple-600 transition-colors line-clamp-1">
                                          {product.name}
                                        </p>
                                        <p className="text-sm text-purple-600 font-bold mt-0.5">
                                          {product.price.toLocaleString("vi-VN")} đ
                                        </p>
                                      </div>
                                      <Search className="h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors flex-shrink-0" />
                                    </motion.button>
                                  ))}
                                </div>
                                <div className="border-t border-gray-200 p-3">
                                  <button
                                    onClick={() => handleSearchSubmit()}
                                    className="w-full text-center text-purple-600 hover:text-purple-700 font-semibold text-sm py-2 hover:bg-purple-50 rounded-lg transition-colors"
                                  >
                                    Xem tất cả kết quả →
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="px-4 py-8 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <Search className="h-8 w-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-sm">Không tìm thấy sản phẩm</p>
                                <p className="text-gray-400 text-xs mt-1">Thử tìm kiếm với từ khóa khác</p>
                              </div>
                            )
                          ) : (
                            // Default Search View
                            <div>
                              {/* Recent Searches */}
                              {recentSearches.length > 0 && (
                                <div className="border-b border-gray-200">
                                  <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
                                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      Tìm kiếm gần đây
                                    </p>
                                  </div>
                                  <div className="py-1">
                                    {recentSearches.map((term, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors group"
                                      >
                                        <button
                                          onClick={() => handleQuickSearch(term)}
                                          className="flex items-center gap-2 text-left flex-grow min-w-0"
                                        >
                                          <Clock className="h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors flex-shrink-0" />
                                          <span className="text-sm text-gray-700 group-hover:text-purple-600 transition-colors truncate">
                                            {term}
                                          </span>
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const updated = recentSearches.filter((_, i) => i !== index);
                                            setRecentSearches(updated);
                                            localStorage.setItem("recentSearches", JSON.stringify(updated));
                                          }}
                                          className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 ml-2"
                                        >
                                          <X className="h-4 w-4" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {/* Popular Searches */}
                              <div>
                                <div className="px-4 py-2 bg-gray-50">
                                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    Tìm kiếm phổ biến
                                  </p>
                                </div>
                                <div className="py-1">
                                  {popularSearches.map((term, index) => (
                                    <button
                                      key={index}
                                      onClick={() => handleQuickSearch(term)}
                                      className="w-full text-left px-4 py-2.5 hover:bg-purple-50 transition-colors flex items-center gap-2 group"
                                    >
                                      <TrendingUp className="h-4 w-4 text-purple-400 group-hover:text-purple-600 transition-colors flex-shrink-0" />
                                      <span className="text-sm text-gray-700 group-hover:text-purple-600 transition-colors">
                                        {term}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.button
                    key="search-closed"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={toggleSearch}
                    className="p-2 text-zinc-800 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                  >
                    <Search className="h-5 w-5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-zinc-800 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold"
                >
                  {cartItemCount}
                </motion.span>
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
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={toggleSearch}
              className="p-2 text-zinc-800 hover:text-purple-600 transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              to="/cart"
              className="relative p-2 text-zinc-800 hover:text-purple-600 transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {cartItemCount}
                </span>
              )}
            </Link>

            <button
              onClick={toggleMobileMenu}
              className="p-2 text-zinc-800 hover:text-purple-600 transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {isSearchOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={toggleSearch}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-white min-h-screen"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    ref={mobileSearchInputRef}
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 h-5 w-5 pointer-events-none" />
                  <button
                    type="button"
                    onClick={toggleSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </form>
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 70px)' }}>
                {isSearching ? (
                  <div className="px-4 py-8 text-center">
                    <Loader2 className="h-8 w-8 text-purple-500 animate-spin mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Đang tìm kiếm...</p>
                  </div>
                ) : searchTerm ? (
                  searchResults.length > 0 ? (
                    <div>
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Kết quả tìm kiếm ({searchResults.length})
                        </p>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {searchResults.map((product, index) => (
                          <motion.button
                            key={product.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleProductClick(product.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors active:bg-purple-100"
                          >
                            <div className="relative flex-shrink-0">
                              <img
                                src={product.thumbnailUrl}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                              />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <p className="text-sm font-medium text-zinc-800 line-clamp-2">
                                {product.name}
                              </p>
                              <p className="text-sm text-purple-600 font-bold mt-1">
                                {product.price.toLocaleString("vi-VN")} đ
                              </p>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                      <div className="border-t border-gray-200 p-4">
                        <button
                          onClick={() => handleSearchSubmit()}
                          className="w-full text-center text-purple-600 hover:text-purple-700 font-semibold text-sm py-3 hover:bg-purple-50 rounded-lg transition-colors active:bg-purple-100"
                        >
                          Xem tất cả kết quả →
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-12 text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="h-10 w-10 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-base">Không tìm thấy sản phẩm</p>
                      <p className="text-gray-400 text-sm mt-2">Thử tìm kiếm với từ khóa khác</p>
                    </div>
                  )
                ) : (
                  <div>
                    {recentSearches.length > 0 && (
                      <div className="border-b border-gray-200">
                        <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Tìm kiếm gần đây
                          </p>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {recentSearches.map((term, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between px-4 py-3 active:bg-gray-50"
                            >
                              <button
                                onClick={() => handleQuickSearch(term)}
                                className="flex items-center gap-2 text-left flex-grow min-w-0"
                              >
                                <Clock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                <span className="text-sm text-gray-700 truncate">
                                  {term}
                                </span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const updated = recentSearches.filter((_, i) => i !== index);
                                  setRecentSearches(updated);
                                  localStorage.setItem("recentSearches", JSON.stringify(updated));
                                }}
                                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 ml-2 p-1"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="px-4 py-3 bg-gray-50">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Tìm kiếm phổ biến
                        </p>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {popularSearches.map((term, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuickSearch(term)}
                            className="w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors active:bg-purple-100 flex items-center gap-2"
                          >
                            <TrendingUp className="h-5 w-5 text-purple-400 flex-shrink-0" />
                            <span className="text-sm text-gray-700">
                              {term}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200 shadow-lg"
          >
            <div className="flex flex-col px-4 py-3 space-y-1">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `block w-full px-3 py-2.5 rounded-md text-base font-medium text-center ${
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
                  `block w-full px-3 py-2.5 rounded-md text-base font-medium text-center ${
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
                  `block w-full px-3 py-2.5 rounded-md text-base font-medium text-center ${
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
                  `block w-full px-3 py-2.5 rounded-md text-base font-medium text-center ${
                    isActive
                      ? "bg-purple-100 text-purple-700"
                      : "text-zinc-700 hover:bg-purple-50 hover:text-purple-600"
                  }`
                }
                onClick={toggleMobileMenu}
              >
                Liên hệ
              </NavLink>
              
              {user?.role?.toLowerCase() === "admin" && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `block w-full px-3 py-2.5 rounded-md text-base font-medium text-center ${
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

              {/* User Section in Mobile Menu */}
              <div className="pt-3 mt-3 border-t border-gray-200">
                {isAuthenticated && user ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt="User Avatar"
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-purple-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.name || user.email}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      onClick={toggleMobileMenu}
                    >
                      <UserCircle className="h-5 w-5 mr-3" />
                      Thông tin cá nhân
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      onClick={toggleMobileMenu}
                    >
                      <Package className="h-5 w-5 mr-3" />
                      Đơn hàng của tôi
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors mt-1"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors w-full"
                    onClick={toggleMobileMenu}
                  >
                    <User className="h-5 w-5" />
                    <span>Đăng nhập</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
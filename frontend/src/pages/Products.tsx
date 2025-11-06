import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { Filter, Search, Grid, List, Plus, X, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { cartService } from '../utils/cartService';
import { toast } from 'react-toastify';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  category: string;
  brand?: string;
  brandId?: string;
  inStock: boolean;
}

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProductData, setNewProductData] = useState({
    name: '',
    price: '',
    category: '',
    brand: '',
    stock: '',
    image: '',
    description: ''
  });

  // Get user role from Redux store
  const userRole = useSelector((state: any) => state.auth.user?.role || 'guest');

  const categories = [
    { id: 'all', name: 'Tất cả sản phẩm' },
    { id: 'camera', name: 'Camera an ninh' },
    { id: 'alarm', name: 'Hệ thống báo động' },
    { id: 'access', name: 'Kiểm soát ra vào' },
    { id: 'smart', name: 'Thiết bị thông minh' }
  ];

  // Mock products data
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
        category: 'camera',
        brand: 'Hikvision',
        brandId: '1',
        inStock: true
      },
      {
        id: '2',
        name: 'Khóa Cửa Thông Minh Vân Tay',
        price: 4200000,
        image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        rating: 4.9,
        reviewCount: 89,
        category: 'access',
        brand: 'Xiaomi',
        brandId: '3',
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
        category: 'alarm',
        brand: 'Dahua',
        brandId: '2',
        inStock: true
      },
      {
        id: '4',
        name: 'Camera Ngoài Trời Chống Nước IP67',
        price: 3200000,
        image: 'https://images.unsplash.com/photo-1567443024551-6e3b63c8c816?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        rating: 4.6,
        reviewCount: 203,
        category: 'camera',
        brand: 'Hikvision',
        brandId: '1',
        inStock: false
      },
      {
        id: '5',
        name: 'Chuông Cửa Thông Minh Video',
        price: 1500000,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        rating: 4.5,
        reviewCount: 78,
        category: 'smart',
        brand: 'Xiaomi',
        brandId: '3',
        inStock: true
      },
      {
        id: '6',
        name: 'Bộ Kit Camera 8 Kênh NVR',
        price: 8500000,
        originalPrice: 10000000,
        image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        rating: 4.8,
        reviewCount: 45,
        category: 'camera',
        brand: 'Dahua',
        brandId: '2',
        inStock: true
      }
    ];

    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm, sortBy]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const handleAddToCart = async (product: Product) => {
    const success = await cartService.addToCart(product);
    if (success) {
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
      window.dispatchEvent(new Event('cartUpdated'));
    } else {
      toast.error('Thêm vào giỏ hàng thất bại. Vui lòng thử lại.');
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      setProducts(products.filter(p => p.id !== productId));
      toast.success('Đã xóa sản phẩm thành công!');
    }
  };

  const handleAddProduct = () => {
    if (!newProductData.name || !newProductData.price || !newProductData.category) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    const product: Product = {
      id: Date.now().toString(),
      name: newProductData.name,
      price: parseFloat(newProductData.price),
      category: newProductData.category,
      brand: newProductData.brand || undefined,
      image: newProductData.image || 'https://via.placeholder.com/400x300?text=No+Image',
      rating: 0,
      reviewCount: 0,
      inStock: parseInt(newProductData.stock) > 0
    };

    setProducts([...products, product]);
    setNewProductData({
      name: '',
      price: '',
      category: '',
      brand: '',
      stock: '',
      image: '',
      description: ''
    });
    setShowAddModal(false);
    toast.success('Đã thêm sản phẩm thành công!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-800 mb-4">Sản Phẩm An Ninh</h1>
              <p className="text-gray-600">
                Khám phá bộ sưu tập thiết bị an ninh chất lượng cao với công nghệ hiện đại
              </p>
            </div>
            {userRole === 'admin' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Thêm sản phẩm
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                Bộ lọc
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="name">Sắp xếp theo tên</option>
                <option value="price-low">Giá thấp đến cao</option>
                <option value="price-high">Giá cao đến thấp</option>
                <option value="rating">Đánh giá cao nhất</option>
              </select>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-zinc-800 mb-4">Danh mục</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-purple-100 text-purple-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
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
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-gray-600">
                    Hiển thị {filteredProducts.length} sản phẩm
                  </p>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`grid gap-6 ${
                      viewMode === 'grid'
                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                        : 'grid-cols-1'
                    }`}
                  >
                    {filteredProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                      <ProductCard
                        product={product}
                        userRole={userRole}
                        onAddToCart={handleAddToCart}
                        onDeleteProduct={handleDeleteProduct}
                      />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Thêm sản phẩm mới</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  value={newProductData.name}
                  onChange={(e) => setNewProductData({...newProductData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập tên sản phẩm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá (VND) *
                </label>
                <input
                  type="number"
                  value={newProductData.price}
                  onChange={(e) => setNewProductData({...newProductData, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập giá sản phẩm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục *
                </label>
                <select
                  value={newProductData.category}
                  onChange={(e) => setNewProductData({...newProductData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Chọn danh mục</option>
                  <option value="Camera an ninh">Camera an ninh</option>
                  <option value="Hệ thống báo động">Hệ thống báo động</option>
                  <option value="Kiểm soát ra vào">Kiểm soát ra vào</option>
                  <option value="Thiết bị thông minh">Thiết bị thông minh</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thương hiệu
                </label>
                <select
                  value={newProductData.brand}
                  onChange={(e) => setNewProductData({...newProductData, brand: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Chọn thương hiệu</option>
                  <option value="Hikvision">Hikvision</option>
                  <option value="Dahua">Dahua</option>
                  <option value="Xiaomi">Xiaomi</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tồn kho
                </label>
                <input
                  type="number"
                  value={newProductData.stock}
                  onChange={(e) => setNewProductData({...newProductData, stock: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập số lượng tồn kho"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình ảnh (URL)
                </label>
                <input
                  type="url"
                  value={newProductData.image}
                  onChange={(e) => setNewProductData({...newProductData, image: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập URL hình ảnh"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={newProductData.description}
                  onChange={(e) => setNewProductData({...newProductData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Nhập mô tả sản phẩm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleAddProduct}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Thêm sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Products;
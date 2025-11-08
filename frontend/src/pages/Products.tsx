import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { Filter, Search, Grid, List } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cartService } from "../utils/cartService";
import type { Brand, CategorySummary, ProductSummary } from "../types/types";
import { brandApi, categoryApi, productApi } from "../utils/api";
import type { ProductQueryParams } from "../types/query";
import Pagination from "../components/Pagination";
import SkeletonCard from "../components/SkeletonCard";

const Products: React.FC = () => {

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);
  
  const [searchParams, setSearchParams] = useSearchParams();

  // === States ===
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    parseInt(searchParams.get("category") || "0")
  );
  const [selectedBrand, setSelectedBrand] = useState<number | null>(
    parseInt(searchParams.get("brand") || "0")
  );
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);  
  const [loadingFilters, setLoadingFilters] = useState(true);

  // === Pagination ===
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(12);

  // === Fetch products ===
  const fetchProducts = async (filters: ProductQueryParams = {}) => {
    try {
      setLoading(true);

      const response = await productApi.getAll({
        active: filters.active ?? true,
        categoryId: filters.categoryId,
        brandId: filters.brandId,
        keyword: filters.keyword,
        page: filters.page ?? 0,
        size: filters.size ?? pageSize,
        sort: filters.sort ?? "name,asc",
      });

      setProducts(response.content);
      setTotalPages(response.page.totalPages);
      setTotalElements(response.page.totalElements);      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAllFilters = async () => {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          categoryApi.getAll(),
          brandApi.getAll({ size: 10 }),
        ]);

        setCategories([{ id: 0, name: "Tất cả" }, ...categoriesData]);
        setBrands([{ id: 0, name: "Tất cả" }, ...brandsData.content]);
      } catch (error) {
        console.error("Error fetching filters:", error);
      } finally {
        setLoadingFilters(false);
      }
    };

    fetchAllFilters();
  }, []);

  // === Load products whenever filters change ===
  useEffect(() => {
    const params: any = { page };

    if (selectedCategory && selectedCategory !== 0) {
      params.categoryId = selectedCategory;
    }
    if (selectedBrand && selectedBrand !== 0) {
      params.brandId = selectedBrand;
    }
    if (searchTerm.trim()) {
      params.keyword = searchTerm.trim();
    }

    switch (sortBy) {
      case "price-low":
        params.sort = "price,asc";
        break;
      case "price-high":
        params.sort = "price,desc";
        break;
      case "rating":
        params.sort = "rating,desc";
        break;
      case "name":
      default:
        params.sort = "name,asc";
        break;
    }

    fetchProducts(params);
  }, [selectedCategory, selectedBrand, searchTerm, sortBy, page]);

  // === Handle category change ===
  const handleCategoryChange = (category: number) => {
    setSelectedCategory(category);
    setPage(0);
    if (category === 0) {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category.toString());
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSearchParams(searchParams);
  };

  // === Handle brand change ===
  const handleBrandChange = (brand: number) => {
    setSelectedBrand(brand);
    setPage(0);
    if (brand === 0) {
      searchParams.delete("brand");
    } else {
      searchParams.set("brand", brand.toString());
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSearchParams(searchParams);
  };

  // === Handle add to cart ===
  const handleAddToCart = async (product: ProductSummary) => {
    const success = await cartService.addToCart(product);
    if (success) {
      window.dispatchEvent(new Event("cartUpdated"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-800 mb-2">Sản Phẩm An Ninh</h1>
          <p className="text-gray-600">
            Khám phá bộ sưu tập thiết bị an ninh chất lượng cao với công nghệ hiện đại
          </p>
        </div>

        {/* Search & Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search box */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Sort & View controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                Bộ lọc
              </button>

              <div className="relative inline-block">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(0);
                  }}
                  className="
                    w-52
                    px-4 py-2
                    bg-white
                    text-gray-700
                    text-sm
                    rounded-xl
                    border border-gray-200
                    shadow-sm
                    transition-all
                    duration-200
                    hover:border-gray-400
                    focus:outline-none
                    focus:ring-2
                    focus:ring-purple-500/40
                    focus:border-purple-500
                    appearance-none
                    cursor-pointer
                  "
                >
                  <option value="name">Sắp xếp theo tên</option>
                  <option value="price-low">Giá thấp đến cao</option>
                  <option value="price-high">Giá cao đến thấp</option>
                  <option value="rating">Đánh giá cao nhất</option>
                </select>

                {/* Icon mũi tên */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${
                    viewMode === "grid"
                      ? "bg-purple-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${
                    viewMode === "list"
                      ? "bg-purple-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside
            className={`w-64 flex-shrink-0 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">

              {/* Category filter */}
              <div>
                <h3 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
                  Danh mục
                  {loadingFilters && (
                    <span className="h-3 w-3 rounded-full bg-purple-400 animate-pulse" />
                  )}
                </h3>

                <div className="space-y-2">
                  {loadingFilters ? (
                    // Skeleton placeholders (5 items)
                    [...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="h-8 w-full bg-gray-100 rounded-lg animate-pulse"
                      />
                    ))
                  ) : (
                    categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category.id
                            ? "bg-purple-100 text-purple-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Brand filter */}
              <div>
                <h3 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
                  Thương hiệu
                  {loadingFilters && (
                    <span className="h-3 w-3 rounded-full bg-purple-400 animate-pulse" />
                  )}
                </h3>

                <div className="space-y-2">
                  {loadingFilters ? (
                    // Skeleton placeholders (5 items)
                    [...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="h-8 w-full bg-gray-100 rounded-lg animate-pulse"
                      />
                    ))
                  ) : (
                    brands.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => handleBrandChange(brand.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedBrand === brand.id
                            ? "bg-purple-100 text-purple-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {brand.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {[...Array(9)].map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key={`${selectedCategory}-${page}-${sortBy}-${searchTerm}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="flex justify-between items-center mb-6">
                  <p className="text-gray-600">
                    Hiển thị {products.length} / {totalElements} sản phẩm
                  </p>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
                  </div>
                ) : (
                  <>
                    <div
                      className={`grid gap-6 ${
                        viewMode === "grid"
                          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                          : "grid-cols-1"
                      }`}
                    >
                      {products.map((product, index) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <ProductCard product={product} onAddToCart={handleAddToCart} />
                        </motion.div>
                      ))}
                    </div>

                    <Pagination
                      page={page}
                      totalPages={totalPages}
                      totalElements={totalElements}
                      pageSize={pageSize}
                      onPageChange={(newPage) => {
                        setPage(newPage);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      onPageSizeChange={(newSize) => {
                        setPageSize(newSize);
                        setPage(0);
                      }}
                    />
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
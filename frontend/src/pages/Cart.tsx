import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { cartService, type CartItem } from '../utils/cartService';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks';
import ConfirmDialog from '../components/ConfirmDialog';

const Cart: React.FC = () => {
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { isAuthenticated } = useAppSelector(state => state.auth);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    const items = await cartService.getCart();
    setCartItems(items);
    // Tự động chọn tất cả items có sẵn trong kho
    const availableItemIds = items
      .filter(item => item.inStock)
      .map(item => item.productId);
    setSelectedItems(new Set(availableItemIds));
    setLoading(false);
  };

  // Toggle select single item
  const toggleSelectItem = (id: string) => {
    const item = cartItems.find(i => i.productId === id);
    if (!item?.inStock) {
      toast.warning('Sản phẩm tạm hết hàng, không thể chọn');
      return;
    }

    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Toggle select all items
  const toggleSelectAll = () => {
    const availableItems = cartItems.filter(item => item.inStock);
    
    if (selectedItems.size === availableItems.length) {
      // Deselect all
      setSelectedItems(new Set());
    } else {
      // Select all available items
      setSelectedItems(new Set(availableItems.map(item => item.productId)));
    }
  };

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const success = await cartService.updateQuantity(id, newQuantity);
    if (success) {
      setCartItems(items =>
        items.map(item =>
          item.productId === id ? { ...item, quantity: newQuantity } : item
        )
      );
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const removeItem = async (id: string) => {
    const success = await cartService.removeItem(id);
    if (success) {
      setCartItems(items => items.filter(item => item.productId !== id));
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const clearCart = async () => {
    const success = await cartService.clearCart();
    if (success) {
      setCartItems([]);
      setSelectedItems(new Set());
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Đã xóa tất cả sản phẩm trong giỏ hàng.');
      navigate('/products');
    } else {
      toast.error('Không thể xóa giỏ hàng. Vui lòng thử lại.');
    }
  };

  // ✅ Xóa nhiều sản phẩm - dùng ConfirmDialog
  const deleteSelectedItems = () => {
    if (selectedItems.size === 0) {
      toast.warning('Vui lòng chọn sản phẩm để xóa');
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmOpen(false);
    try {
      for (const id of Array.from(selectedItems)) {
        await cartService.removeItem(id);
      }
      setCartItems((items) => items.filter((i) => !selectedItems.has(i.productId)));
      setSelectedItems(new Set());
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Đã xóa các sản phẩm đã chọn');
    } catch {
      toast.error('Không thể xóa sản phẩm. Vui lòng thử lại.');
    }
  };

  // Calculate total for selected items only
  const calculateSelectedSubtotal = () => {
    return cartItems
      .filter(item => selectedItems.has(item.productId))
      .reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleCheckout = () => {

    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để tiếp tục thanh toán!');
      navigate('/login');
      return;
    }

    if (selectedItems.size === 0) {
      toast.warning('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }

    const selectedProducts = cartItems.filter(item => selectedItems.has(item.productId));

    const outOfStock = selectedProducts.filter(item => !item.inStock);
    if (outOfStock.length > 0) {
      toast.error('Một số sản phẩm đã chọn hiện tạm hết hàng');
      return;
    }

    navigate('/checkout', {
      state: {
        cartItems: selectedProducts,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-300 rounded w-1/4"></div>
              <div className="h-64 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="min-h-screen bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <ShoppingBag className="w-24 h-24 mx-auto text-gray-400 mb-6" />
              <h2 className="text-3xl font-bold text-zinc-800 mb-4">
                Giỏ Hàng Trống
              </h2>
              <p className="text-gray-600 mb-8">
                Bạn chưa có sản phẩm nào trong giỏ hàng
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Tiếp Tục Mua Sắm
              </Link>
            </motion.div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = calculateSelectedSubtotal();
  const shipping = subtotal > 5000000 ? 0 : 50000;
  const total = subtotal + shipping;
  const availableItemsCount = cartItems.filter(item => item.inStock).length;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-zinc-800 mb-2">
              Giỏ Hàng Của Bạn
            </h1>
            <p className="text-gray-600">
              Bạn có {cartItems.length} sản phẩm trong giỏ hàng
              {selectedItems.size > 0 && (
                <span className="text-purple-600 font-semibold ml-2">
                  ({selectedItems.size} đã chọn)
                </span>
              )}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2 space-y-4"
            >
              {/* Select All Checkbox */}
              <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === availableItemsCount && availableItemsCount > 0}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="font-semibold text-gray-700">
                    Chọn tất cả ({availableItemsCount} sản phẩm)
                  </span>
                </div>
                
                {selectedItems.size > 0 && (
                  <button
                    onClick={deleteSelectedItems}
                    className="text-red-500 hover:text-red-700 transition-colors font-semibold flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa đã chọn ({selectedItems.size})
                  </button>
                )}
              </div>

              {/* Cart Items List */}
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${
                    !item.inStock ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <div className="flex items-start pt-1">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.productId)}
                        onChange={() => toggleSelectItem(item.productId)}
                        disabled={!item.inStock}
                        className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Product Image */}
                    <div className="w-24 h-24 flex-shrink-0">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <Link 
                        to={`/products/${item.productId}`} 
                        className="text-lg font-semibold text-zinc-800 mb-2 hover:text-purple-600 transition-colors block"
                      >
                        {item.name}
                      </Link>
                      <p className="text-purple-600 font-bold text-xl mb-3">
                        {formatPrice(item.price)}
                      </p>

                      {/* Stock Info */}
                      {item.availableStock !== undefined && (
                        <p className="text-sm text-gray-500 my-2">
                          Còn lại:{" "}
                          <span
                            className={`font-medium ${
                              item.availableStock - item.quantity <= 3
                                ? "text-red-500"
                                : "text-gray-800"
                            }`}
                          >
                            {item.availableStock - item.quantity} sản phẩm
                          </span>{" "}
                          trong kho
                        </p>
                      )}

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>

                          <span className="px-4 py-2 font-semibold text-zinc-800 min-w-[3rem] text-center">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => {
                              if (item.availableStock && item.quantity >= item.availableStock) {
                                toast.info(`Chỉ còn ${item.availableStock} sản phẩm trong kho.`);
                                return;
                              }
                              updateQuantity(item.productId, item.quantity + 1);
                            }}
                            className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!!item.availableStock && item.quantity >= item.availableStock}
                          >
                            <Plus className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-red-500 hover:text-red-700 transition-colors p-2"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Out of Stock Warning */}
                      {!item.inStock && (
                        <p className="text-red-500 text-sm mt-2 font-semibold">
                          ⚠️ Sản phẩm tạm hết hàng
                        </p>
                      )}
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Tổng</p>
                      <p className="text-xl font-bold text-zinc-800">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Clear Cart Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 transition-colors font-semibold flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Xóa Toàn Bộ Giỏ Hàng
              </motion.button>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h2 className="text-xl font-bold text-zinc-800 mb-6">
                  Tổng Đơn Hàng
                </h2>

                {selectedItems.size === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">
                      Chưa có sản phẩm nào được chọn
                    </p>
                    <p className="text-sm text-gray-400">
                      Vui lòng chọn sản phẩm để thanh toán
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-gray-600">
                        <span>Sản phẩm đã chọn:</span>
                        <span className="font-semibold text-purple-600">{selectedItems.size}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Tạm tính:</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Phí vận chuyển:</span>
                        <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                          {shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
                        </span>
                      </div>
                      {subtotal > 0 && subtotal < 5000000 && (
                        <p className="text-sm text-purple-600">
                          Mua thêm {formatPrice(5000000 - subtotal)} để được miễn phí vận chuyển
                        </p>
                      )}
                      <div className="border-t pt-4">
                        <div className="flex justify-between text-xl font-bold text-zinc-800">
                          <span>Tổng cộng:</span>
                          <span className="text-purple-600">{formatPrice(total)}</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleCheckout}
                      className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors mb-4"
                    >
                      Tiến Hành Thanh Toán ({selectedItems.size})
                    </button>
                  </>
                )}

                <Link
                  to="/products"
                  className="block text-center text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                >
                  ← Tiếp Tục Mua Sắm
                </Link>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      ✓
                    </div>
                    <span>Miễn phí đổi trả trong 7 ngày</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      ✓
                    </div>
                    <span>Bảo hành chính hãng</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      ✓
                    </div>
                    <span>Thanh toán an toàn</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
      <ConfirmDialog
        open={confirmOpen}
        title="Xóa sản phẩm"
        message={`Bạn có chắc muốn xóa ${selectedItems.size} sản phẩm đã chọn khỏi giỏ hàng?`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default Cart;
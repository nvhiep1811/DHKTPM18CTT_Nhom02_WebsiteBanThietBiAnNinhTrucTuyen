import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ArrowLeft, Mail, Clock, AlertCircle } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link, useLocation } from "react-router-dom";
import { productApi, orderApi } from "../utils/api";
import type { ProductSummary } from "../types/types";
import ProductCard from "../components/ProductCard";

interface OrderData {
  orderId: string;
  status: string;
  paymentStatus: string;
}

const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const orderData = location.state?.orderData as OrderData | undefined;
  
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [isConfirmed, setIsConfirmed] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch sản phẩm gợi ý
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProducts = async () => {
      try {
        const response = await productApi.getAll({ page: 0, size: 6, sort: "rating,desc" });
        setProducts(response.content);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm gợi ý:", error);
      }
    };
    fetchProducts();
  }, []);

  // ✅ Kiểm tra trạng thái xác nhận đơn hàng
  useEffect(() => {
    if (!orderData?.orderId) {
      setChecking(false);
      return;
    }

    const checkStatus = async () => {
      try {
        console.log("🔍 Checking order status for:", orderData.orderId);
        const response = await orderApi.checkConfirmationStatus(orderData.orderId);
        
        console.log("✅ Status response:", response);
        setIsConfirmed(response.isConfirmed);
        setError(null);
      } catch (error: any) {
        console.error("❌ Lỗi kiểm tra trạng thái:", error);
        
        // Xử lý lỗi cụ thể
        if (error.response?.status === 403) {
          setError("Không có quyền truy cập. Vui lòng đăng nhập lại.");
        } else if (error.response?.status === 404) {
          setError("Không tìm thấy đơn hàng.");
        } else {
          setError("Không thể kiểm tra trạng thái. Vui lòng thử lại sau.");
        }
        
        // Tạm thời set false để hiển thị UI pending
        setIsConfirmed(false);
      } finally {
        setChecking(false);
      }
    };

    // Check ngay lập tức
    checkStatus();

    // ✅ Polling mỗi 5s
    const interval = setInterval(checkStatus, 5000);
    
    // Cleanup khi unmount hoặc đã confirmed
    return () => clearInterval(interval);
  }, [orderData?.orderId]);

  // Stop polling khi đã confirmed
  useEffect(() => {
    if (isConfirmed === true) {
      console.log("✅ Order confirmed! Stopping polling.");
    }
  }, [isConfirmed]);

  // === Tính thời gian giao hàng ===
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const displayDate = new Date(deliveryDate);
  displayDate.setDate(deliveryDate.getDate() - 1);

  const formattedDate = displayDate.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* ✅ Kiểm tra xem có orderData không */}
        {!orderData ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-md text-center p-10"
          >
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-zinc-800 mb-3">
              Không tìm thấy thông tin đơn hàng
            </h1>
            <p className="text-gray-600 mb-6">
              Vui lòng kiểm tra email để xác nhận đơn hàng.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Tiếp tục mua hàng
            </Link>
          </motion.div>
        ) : checking ? (
          /* Loading State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-md text-center p-10"
          >
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang kiểm tra trạng thái đơn hàng...</p>
          </motion.div>
        ) : error ? (
          /* ❌ Error State */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-md text-center p-10"
          >
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-zinc-800 mb-3">
              Có lỗi xảy ra
            </h1>
            <p className="text-gray-600 mb-2">
              {error}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Mã đơn hàng: <span className="font-mono text-blue-600">#{orderData.orderId.substring(0, 8).toUpperCase()}</span>
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Thử lại
              </button>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Tiếp tục mua hàng
              </Link>
            </div>
          </motion.div>
        ) : isConfirmed === false ? (
          /* ⚠️ Chưa xác nhận - Yêu cầu check email */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-md p-10"
          >
            <div className="text-center mb-6">
              <Mail className="w-20 h-20 text-orange-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-zinc-800 mb-3">
                Vui lòng xác nhận đơn hàng 📧
              </h1>
              <p className="text-gray-600 mb-2">
                Đơn hàng <span className="font-bold text-blue-600">#{orderData.orderId.substring(0, 8).toUpperCase()}</span> đã được tạo thành công!
              </p>
            </div>

            {/* Alert Box */}
            <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-orange-900 mb-2">
                    Cần xác nhận trong vòng 24 giờ
                  </h3>
                  <p className="text-orange-800 text-sm mb-3">
                    Chúng tôi đã gửi email xác nhận đến địa chỉ của bạn. Vui lòng:
                  </p>
                  <ol className="text-orange-800 text-sm space-y-1 ml-4 list-decimal">
                    <li>Mở email từ <strong>SecureShop</strong></li>
                    <li>Click vào nút <strong>"Xác nhận đơn hàng"</strong></li>
                    <li>Quay lại trang này để xem cập nhật</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Status Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Trạng thái đơn hàng</p>
                <p className="font-bold text-orange-600">Chờ xác nhận</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
                <p className="font-bold text-gray-800">
                  #{orderData.orderId.substring(0, 8).toUpperCase()}
                </p>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-800">
                <strong>💡 Mẹo:</strong> Kiểm tra cả thư mục Spam/Junk nếu không thấy email. 
                Trang này sẽ tự động cập nhật khi bạn xác nhận.
              </p>
            </div>

            <div className="text-center">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Tiếp tục mua hàng
              </Link>
            </div>
          </motion.div>
        ) : (
          /* ✅ Đã xác nhận - Thông báo thành công */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-md text-center p-10"
          >
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-zinc-800 mb-3">
              Đặt hàng thành công 🎉
            </h1>
            <p className="text-gray-600 mb-2">
              Đơn hàng <span className="font-bold text-blue-600">#{orderData.orderId.substring(0, 8).toUpperCase()}</span> đã được xác nhận!
            </p>
            <p className="text-gray-600 mb-2">
              Cảm ơn bạn đã tin tưởng <span className="text-blue-600 font-semibold">Security Store</span>.
            </p>
            <p className="text-gray-700 mb-6">
              Dự kiến giao hàng vào:{" "}
              <span className="font-semibold text-green-600">{formattedDate}</span>
            </p>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Tiếp tục mua hàng
            </Link>
          </motion.div>
        )}

        {/* Sản phẩm tương tự */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-zinc-800 text-center mb-8">
            Có thể bạn sẽ thích 💡
          </h2>

          {products.length === 0 ? (
            <p className="text-center text-gray-500">Đang tải sản phẩm...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <ProductCard product={product} onAddToCart={() => {}} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderSuccess;
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { orderApi } from "../utils/api";

const ConfirmOrder: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Thiếu token xác nhận. Vui lòng kiểm tra lại link trong email.");
      return;
    }

    // Gọi API xác nhận
    const confirmOrder = async () => {
  try {
    const response = await orderApi.confirmOrder(token);

    if (response.success) {
      setStatus("success");
      setMessage(response.message);
    } else {
      // Nếu đơn hàng đã xác nhận => vẫn hiển thị thành công
      if (response.message === "Order already confirmed") {
        setStatus("success");
        setMessage("Đơn hàng này đã được xác nhận trước đó.");
      } else {
        setStatus("error");
        setMessage(response.message);
      }
    }
  } catch (error: any) {
    const msg = error.response?.data?.message;

    if (msg === "Order already confirmed") {
      setStatus("success");
      setMessage("Đơn hàng đã được xác nhận rồi.");
    } else {
      setStatus("error");
      setMessage(msg || "Đã có lỗi xảy ra. Vui lòng thử lại sau.");
    }
  }
};


    confirmOrder();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center"
      >
        {/* Loading State */}
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              Đang xác nhận đơn hàng...
            </h1>
            <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
          </>
        )}

        {/* Success State */}
        {status === "success" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              Xác nhận thành công! 🎉
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Tiếp tục mua sắm
            </button>
          </>
        )}

        {/* Error State */}
        {status === "error" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              Xác nhận thất bại
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate("/")}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Về trang chủ
              </button>
              <button
                onClick={() => navigate("/support")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Liên hệ hỗ trợ
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ConfirmOrder;
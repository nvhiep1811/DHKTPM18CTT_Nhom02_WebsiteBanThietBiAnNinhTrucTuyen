import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, AlertCircle, ArrowLeft, Home } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { vnpayApi, getVNPayResponseMessage, isPaymentSuccess, parseVNPayAmount, formatVNPayDate } from '../utils/vnpayService';
import { toast } from 'react-toastify';
import type { VNPayCallbackRequest } from '../types/vnpay';

const REDIRECT_SECONDS = 10;

const VNPayReturn: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [callbackData, setCallbackData] = useState<VNPayCallbackRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  const hasRunRef = useRef(false);

  // ---------------------------
  // XỬ LÝ CALLBACK (chạy 1 lần)
  // ---------------------------
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const processPaymentCallback = async () => {
      try {
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => (params[key] = value));

        if (!params.vnp_TxnRef || !params.vnp_ResponseCode) {
          setError('Thông tin callback không hợp lệ');
          setIsLoading(false);
          return;
        }

        const response = await vnpayApi.processCallback(params);
        setPaymentResult(response);
        setCallbackData(params as any);

        if (response.success && isPaymentSuccess(params.vnp_ResponseCode)) {
          toast.success('Thanh toán thành công!');
          clearCartAfterPayment();
        } else {
          toast.error(response.message || getVNPayResponseMessage(params.vnp_ResponseCode));
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi xử lý thanh toán');
        toast.error('Có lỗi xảy ra khi xử lý thanh toán');
      } finally {
        setIsLoading(false);
      }
    };

    processPaymentCallback();
  }, [searchParams]);

  // ---------------------------
  // AUTO REDIRECT COUNTDOWN
  // ---------------------------
  useEffect(() => {
    if (isLoading) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, navigate]);

  // ---------------------------
  // CLEAR CART ON SUCCESS
  // ---------------------------
  const clearCartAfterPayment = async () => {
    try {
      const { cartService } = await import('../utils/cartService');
      const cleared = await cartService.clearCart();

      if (cleared) window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // ---------------------------
  // LOADING UI
  // ---------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Clock className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang xử lý thanh toán...</h2>
            <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ---------------------------
  // ERROR UI
  // ---------------------------
  if (error || !callbackData || !paymentResult) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-md p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Lỗi xử lý thanh toán</h2>
            <p className="text-gray-600 mb-4">{error || 'Không thể xác nhận thông tin thanh toán'}</p>

            <p className="text-gray-500 text-sm mb-6">
              Tự động chuyển về trang chủ sau {countdown} giây...
            </p>

            <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
              <Home className="h-5 w-5" /> Về trang chủ
            </button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // ---------------------------
  // SUCCESS UI
  // ---------------------------
  const isSuccess = paymentResult.success && isPaymentSuccess(callbackData.vnp_ResponseCode);
  const amount = parseVNPayAmount(callbackData.vnp_Amount);
  const paymentDate = formatVNPayDate(callbackData.vnp_PayDate);
  const message = paymentResult.message || getVNPayResponseMessage(callbackData.vnp_ResponseCode);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-md overflow-hidden">

          {/* Header */}
          <div className={`p-8 text-center ${isSuccess ? 'bg-green-50' : 'bg-red-50'}`}>
            {isSuccess ? (
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="h-20 w-20 text-red-500 mx-auto mb-4" />
            )}
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
            </h1>
            <p className={`text-lg ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
              {message}
            </p>

            <p className="text-gray-500 text-sm mt-3">
              Tự động chuyển về trang chủ sau {countdown} giây...
            </p>
          </div>

          {/* Payment Details */}
          <div className="p-8 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin giao dịch</h2>

            <div className="grid grid-cols-2 gap-4">
              <Info label="Mã giao dịch" value={callbackData.vnp_TxnRef} />
              <Info label="Số tiền" value={`${amount.toLocaleString('vi-VN')} VND`} />
              <Info label="Ngân hàng" value={callbackData.vnp_BankCode} />
              <Info label="Thời gian" value={paymentDate} />

              {callbackData.vnp_TransactionNo && (
                <Info label="Mã giao dịch ngân hàng" value={callbackData.vnp_TransactionNo} colSpan />
              )}

              {callbackData.vnp_CardType && (
                <Info label="Loại thẻ" value={callbackData.vnp_CardType} />
              )}

              {paymentResult.order && (
                <Info label="Mã đơn hàng" value={paymentResult.order.id} colSpan />
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mt-6">
              <p className="text-sm text-gray-600">{callbackData.vnp_OrderInfo}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-8 bg-gray-50 flex gap-4 justify-center">
            {isSuccess ? (
              <>
                <button onClick={() => navigate('/profile')} className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                  Xem đơn hàng
                </button>
                <button onClick={() => navigate('/products')} className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors">
                  <ArrowLeft className="h-5 w-5" /> Tiếp tục mua hàng
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/cart')} className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                  Thử lại
                </button>
                <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors">
                  <Home className="h-5 w-5" /> Về trang chủ
                </button>
              </>
            )}
          </div>

        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default VNPayReturn;

// ---------------------------
// Small UI Component
// ---------------------------
const Info = ({
  label,
  value,
  colSpan = false,
}: {
  label: string;
  value: string | number;
  colSpan?: boolean;
}) => (
  <div className={colSpan ? 'col-span-2' : ''}>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium text-gray-900">{value}</p>
  </div>
);

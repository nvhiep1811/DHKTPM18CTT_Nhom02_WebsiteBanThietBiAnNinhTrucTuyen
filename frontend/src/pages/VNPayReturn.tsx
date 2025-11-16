import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, AlertCircle, ArrowLeft, Home } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { vnpayApi, getVNPayResponseMessage, isPaymentSuccess, parseVNPayAmount, formatVNPayDate } from '../utils/vnpayService';
import { toast } from 'react-toastify';
import type { VNPayCallbackRequest } from '../types/vnpay';

const VNPayReturn: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [callbackData, setCallbackData] = useState<VNPayCallbackRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  useEffect(() => {
    const processPaymentCallback = async () => {
      try {
        // Extract all params from URL
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        //in ra console log params nhận được
        console.log('VNPay Callback Params:', params);

        // Validate essential params
        if (!params.vnp_TxnRef || !params.vnp_ResponseCode) {
          setError('Thông tin callback không hợp lệ');
          setIsLoading(false);
          return;
        }

        // Call backend để validate signature và xử lý callback
        // Backend sẽ trả về full response như trong VNPAY_CALLBACK_GUIDE.md
        const response = await vnpayApi.processCallback(params);
        
        console.log('🎯 Backend response:', response);
        console.log('🎯 response.success:', response.success);
        console.log('🎯 vnp_ResponseCode:', params.vnp_ResponseCode);
        console.log('🎯 isPaymentSuccess:', isPaymentSuccess(params.vnp_ResponseCode));
        
        setPaymentResult(response); // Lưu full response từ backend
        setCallbackData(params as any); // Lưu callback params
        
        // Hiển thị thông báo
        if (response.success && isPaymentSuccess(params.vnp_ResponseCode)) {
          console.log('✅ Payment successful - clearing cart...');
          toast.success('Thanh toán thành công!');
          
          // XÓA GIỎ HÀNG SAU KHI THANH TOÁN THÀNH CÔNG
          clearCartAfterPayment();
          
        } else {
          toast.error(response.message || getVNPayResponseMessage(params.vnp_ResponseCode));
        }
        
      } catch (err: any) {
        console.error('Error processing callback:', err);
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi xử lý thanh toán');
        toast.error('Có lỗi xảy ra khi xử lý thanh toán');
      } finally {
        setIsLoading(false);
      }
    };

    processPaymentCallback();
  }, [searchParams]);

  // Hàm xóa giỏ hàng sau khi thanh toán thành công
  const clearCartAfterPayment = async () => {
    try {
      // Import cartService để xóa cart đúng cách
      const { cartService } = await import('../utils/cartService');
      
      // Xóa cart (tự động xử lý cả localStorage và backend)
      const cleared = await cartService.clearCart();
      
      if (cleared) {
        console.log('✅ Cart cleared after successful payment');
        
        // Trigger reload cart ở Header/Cart components
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        console.error('❌ Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Loading state
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

  // Error state
  if (error || !callbackData || !paymentResult) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-8 text-center"
          >
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Lỗi xử lý thanh toán</h2>
            <p className="text-gray-600 mb-6">{error || 'Không thể xác nhận thông tin thanh toán'}</p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Home className="h-5 w-5" />
              Về trang chủ
            </button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  const isSuccess = paymentResult.success && isPaymentSuccess(callbackData.vnp_ResponseCode);
  const amount = parseVNPayAmount(callbackData.vnp_Amount);
  const paymentDate = formatVNPayDate(callbackData.vnp_PayDate);
  const message = paymentResult.message || getVNPayResponseMessage(callbackData.vnp_ResponseCode);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-3xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
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
          </div>

          {/* Payment Details */}
          <div className="p-8 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin giao dịch</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Mã giao dịch</p>
                <p className="font-medium text-gray-900">{callbackData.vnp_TxnRef}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Số tiền</p>
                <p className="font-medium text-gray-900">{amount.toLocaleString('vi-VN')} VND</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Ngân hàng</p>
                <p className="font-medium text-gray-900">{callbackData.vnp_BankCode}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Thời gian</p>
                <p className="font-medium text-gray-900">{paymentDate}</p>
              </div>
              
              {callbackData.vnp_TransactionNo && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Mã giao dịch ngân hàng</p>
                  <p className="font-medium text-gray-900">{callbackData.vnp_TransactionNo}</p>
                </div>
              )}
              
              {callbackData.vnp_CardType && (
                <div>
                  <p className="text-sm text-gray-500">Loại thẻ</p>
                  <p className="font-medium text-gray-900">{callbackData.vnp_CardType}</p>
                </div>
              )}

              {/* Hiển thị Order ID nếu có */}
              {paymentResult.order && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Mã đơn hàng</p>
                  <p className="font-medium text-gray-900">{paymentResult.order.id}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mt-6">
              <p className="text-sm text-gray-600">
                {callbackData.vnp_OrderInfo}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-8 bg-gray-50 flex gap-4 justify-center">
            {isSuccess ? (
              <>
                <button
                  onClick={() => navigate('/profile')}
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Xem đơn hàng
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Tiếp tục mua hàng
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/cart')}
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Thử lại
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <Home className="h-5 w-5" />
                  Về trang chủ
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

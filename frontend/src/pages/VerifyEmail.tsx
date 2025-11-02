import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axiosInstance from '../utils/axiosConfig';

type VerificationState = 'verifying' | 'success' | 'error' | 'expired';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [state, setState] = useState<VerificationState>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setState('error');
        setErrorMessage('Token không hợp lệ');
        return;
      }

      try {
        await axiosInstance.get('/auth/verify-email', {
          params: { token }
        });

        setState('success');
        toast.success('Xác thực email thành công!');

        // Auto redirect to login after 5 seconds
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              navigate('/login');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);

      } catch (error) {
        console.log(error);
        
      }
    };

    verifyEmail();
  }, [token, navigate]);

  // Verifying state
  if (state === 'verifying') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <div className="text-center">
              <div className="flex justify-center">
                <Loader2 className="h-16 w-16 text-purple-600 animate-spin" />
              </div>
              <h2 className="mt-6 text-2xl font-bold text-zinc-800">
                Đang xác thực email...
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Vui lòng đợi trong giây lát
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Success state
  if (state === 'success') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-4">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
              </div>
              <h2 className="mt-6 text-3xl font-bold text-zinc-800">
                Xác thực thành công!
              </h2>
              <p className="mt-2 text-base text-gray-600">
                Tài khoản của bạn đã được kích hoạt
              </p>
            </div>

            <div className="bg-white py-8 px-6 shadow-lg rounded-lg space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900">
                      Email đã được xác thực thành công
                    </p>
                    <p className="text-sm text-green-700">
                      Bạn có thể đăng nhập ngay bây giờ
                    </p>
                  </div>
                </div>

                <div className="text-center py-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Tự động chuyển đến trang đăng nhập sau
                  </p>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 text-xl font-bold">
                    {countdown}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-center"
                >
                  Đăng nhập ngay
                </Link>
                <Link
                  to="/"
                  className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center"
                >
                  Về trang chủ
                </Link>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Expired state
  if (state === 'expired') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-orange-100 p-4">
                  <XCircle className="h-16 w-16 text-orange-600" />
                </div>
              </div>
              <h2 className="mt-6 text-3xl font-bold text-zinc-800">
                Link đã hết hạn
              </h2>
              <p className="mt-2 text-base text-gray-600">
                Link xác thực của bạn đã hết hiệu lực
              </p>
            </div>

            <div className="bg-white py-8 px-6 shadow-lg rounded-lg space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-orange-900 mb-1">
                      {errorMessage}
                    </p>
                    <p className="text-sm text-orange-700">
                      Link xác thực chỉ có hiệu lực trong 24 giờ. Vui lòng yêu cầu gửi lại email xác thực.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={async () => {
                    try {
                      const email = prompt('Nhập email của bạn:');
                      if (!email) return;

                      await axiosInstance.post('/auth/resend-verification', null, {
                        params: { email }
                      });

                      toast.success('Email xác thực đã được gửi lại!');
                    } catch (error) {
                      toast.error('Không thể gửi lại email. Vui lòng thử lại sau.');
                    }
                  }}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Gửi lại email xác thực
                </button>
                <Link
                  to="/register"
                  className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center"
                >
                  Đăng ký lại
                </Link>
                <Link
                  to="/"
                  className="block text-center text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                >
                  Về trang chủ
                </Link>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 p-4">
                <XCircle className="h-16 w-16 text-red-600" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-zinc-800">
              Xác thực thất bại
            </h2>
            <p className="mt-2 text-base text-gray-600">
              Không thể xác thực email của bạn
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow-lg rounded-lg space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900 mb-1">
                    {errorMessage || 'Đã xảy ra lỗi'}
                  </p>
                  <p className="text-sm text-red-700">
                    Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Các nguyên nhân có thể:
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Link xác thực không hợp lệ</li>
                  <li>• Link đã được sử dụng trước đó</li>
                  <li>• Link đã hết hạn (quá 24 giờ)</li>
                  <li>• Tài khoản đã được xác thực rồi</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={async () => {
                  try {
                    const email = prompt('Nhập email của bạn:');
                    if (!email) return;

                    await axiosInstance.post('/auth/resend-verification', null, {
                      params: { email }
                    });

                    toast.success('Email xác thực đã được gửi lại!');
                  } catch (error) {
                    toast.error('Không thể gửi lại email. Vui lòng thử lại sau.');
                  }
                }}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Gửi lại email xác thực
              </button>
              <Link
                to="/login"
                className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center"
              >
                Thử đăng nhập
              </Link>
              <Link
                to="/contact"
                className="block text-center text-purple-600 hover:text-purple-700 font-semibold transition-colors"
              >
                Liên hệ hỗ trợ
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VerifyEmail;
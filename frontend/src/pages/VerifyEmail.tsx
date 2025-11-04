import React, { useEffect, useState, useRef } from 'react';
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
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get('token');
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    
    const verifyEmail = async () => {
      try {
        if (!token) {
          setState('error');
          setErrorMessage('Token không hợp lệ');
          return;
        }

        hasVerified.current = true;
        
        await axiosInstance.get('/auth/verify-email', { 
          params: { token } 
        });

        // ✅ FIX: Nếu API trả về 200 → xác thực thành công
        setState('success');
        toast.success('Xác thực email thành công!');

        // Start countdown
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

      } catch (err: any) {        
        if (err.response?.status === 410) {
          setState('expired');
          setErrorMessage('Link xác thực đã hết hạn.');
        } else if (err.response?.status === 400) {
          setState('error');
          const message = err.response?.data?.message || 'Link xác thực không hợp lệ hoặc đã hết hạn.';
          setErrorMessage(message);
        } else {
          setState('error');
          const message = err.response?.data?.message || 'Đã xảy ra lỗi khi xác thực.';
          setErrorMessage(message);
        }
      }
    };

    verifyEmail();
  }, [token, navigate]);

  // ✉️ Gửi lại email xác thực
  const handleResendVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resendEmail.trim()) {
      toast.warn('Vui lòng nhập email của bạn.');
      return;
    }
    
    try {
      setIsResending(true);
      
      const response = await axiosInstance.post('/auth/resend-verification', {
        email: resendEmail.trim()
      });      

      if (response) {
        toast.success(response.data.message || 'Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư đến của bạn.');
        setResendEmail('');
      }
    } finally {
      setIsResending(false);
    }
  };

  // === UI States ===

  if (state === 'verifying') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <Loader2 className="h-16 w-16 text-purple-600 animate-spin mx-auto" />
            <h2 className="mt-6 text-2xl font-bold text-zinc-800">Đang xác thực email...</h2>
            <p className="mt-2 text-sm text-gray-600">Vui lòng đợi trong giây lát</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex items-center justify-center py-12 px-4">
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
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 mb-2">
                  Tự động chuyển đến trang đăng nhập sau
                </p>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 text-xl font-bold">
                  {countdown}
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

  // === Error / Expired State ===
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <div className={`rounded-full p-4 ${state === 'expired' ? 'bg-orange-100' : 'bg-red-100'}`}>
                <XCircle className={`h-16 w-16 ${state === 'expired' ? 'text-orange-600' : 'text-red-600'}`} />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-zinc-800">
              {state === 'expired' ? 'Link đã hết hạn' : 'Xác thực thất bại'}
            </h2>
            <p className="mt-2 text-base text-gray-600">
              {errorMessage || 'Không thể xác thực email của bạn.'}
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow-lg rounded-lg space-y-6">
            <form className="space-y-4" onSubmit={handleResendVerification}>
              <label className="block text-sm font-medium text-gray-700">
                Nhập email của bạn để gửi lại email xác thực:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                />
                <button
                  type='submit'
                  disabled={isResending}
                  className={`px-4 py-2 rounded-lg text-white font-semibold transition-colors ${
                    isResending ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {isResending ? 'Đang gửi...' : 'Gửi lại'}
                </button>
              </div>
            </form>

            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center"
              >
                Thử đăng nhập
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
};

export default VerifyEmail;
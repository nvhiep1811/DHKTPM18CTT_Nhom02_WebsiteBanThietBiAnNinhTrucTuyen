import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { authService } from '../utils/authService';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
    .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
    .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch('password');

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        toast.error('Link không hợp lệ');
        setIsVerifying(false);
        setIsTokenValid(false);
        return;
      }

      try {
        const response = await authService.verifyToken(token);
        
        setIsTokenValid(response.data === true);
        if (!response.data) {
          toast.error('Link đã hết hạn hoặc không hợp lệ');
        }
      } catch {
        setIsTokenValid(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Token không hợp lệ');
      return;
    }

    setIsLoading(true);
    
    try {
      await authService.resetPassword(token, data.password);
      
      setIsSuccess(true);
      toast.success('Đổi mật khẩu thành công!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            'Có lỗi xảy ra. Vui lòng thử lại!';
        toast.error(errorMessage);
      } else {
        toast.error('Không thể kết nối đến server. Vui lòng thử lại!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[a-z]/.test(pass)) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;

    if (strength <= 2) return { strength, label: 'Yếu', color: 'bg-red-500' };
    if (strength <= 3) return { strength, label: 'Trung bình', color: 'bg-yellow-500' };
    if (strength <= 4) return { strength, label: 'Mạnh', color: 'bg-green-500' };
    return { strength, label: 'Rất mạnh', color: 'bg-green-600' };
  };

  const passwordStrength = getPasswordStrength(password);

  // Loading state
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang xác thực...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Invalid token state
  if (!isTokenValid) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-red-100 p-3">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>
              </div>
              <h2 className="mt-6 text-3xl font-bold text-zinc-800">
                Link không hợp lệ
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Link khôi phục mật khẩu đã hết hạn hoặc không hợp lệ
              </p>
            </div>

            <div className="bg-white py-8 px-6 shadow-lg rounded-lg space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Vui lòng yêu cầu link khôi phục mật khẩu mới
              </p>
              <Link
                to="/forgot-password"
                className="block w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-center"
              >
                Yêu cầu link mới
              </Link>
              <Link
                to="/login"
                className="block text-center text-purple-600 hover:text-purple-700 font-semibold transition-colors"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h2 className="mt-6 text-3xl font-bold text-zinc-800">
                Đổi mật khẩu thành công!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Mật khẩu của bạn đã được cập nhật
              </p>
            </div>

            <div className="bg-white py-8 px-6 shadow-lg rounded-lg space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Bạn sẽ được chuyển đến trang đăng nhập trong giây lát...
              </p>
              <Link
                to="/login"
                className="block w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-center"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <Shield className="h-12 w-12 text-purple-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-zinc-800">
              Tạo mật khẩu mới
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Nhập mật khẩu mới cho tài khoản của bạn
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mật khẩu mới
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } rounded-md placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                    placeholder="Nhập mật khẩu mới"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                          style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-semibold ${
                        passwordStrength.strength <= 2 ? 'text-red-600' :
                        passwordStrength.strength <= 3 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
                
                {/* Password requirements */}
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500">Mật khẩu phải có:</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li className={password?.length >= 8 ? 'text-green-600' : ''}>
                      ✓ Ít nhất 8 ký tự
                    </li>
                    <li className={/[A-Z]/.test(password || '') ? 'text-green-600' : ''}>
                      ✓ 1 chữ hoa
                    </li>
                    <li className={/[a-z]/.test(password || '') ? 'text-green-600' : ''}>
                      ✓ 1 chữ thường
                    </li>
                    <li className={/[0-9]/.test(password || '') ? 'text-green-600' : ''}>
                      ✓ 1 chữ số
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Xác nhận mật khẩu
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-md placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang xử lý...
                    </div>
                  ) : (
                    'Đổi mật khẩu'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPassword;
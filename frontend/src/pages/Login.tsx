import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Shield, Mail, Lock } from "lucide-react";
import { toast } from "react-toastify";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axiosInstance from "../utils/axiosConfig";
import { useAppDispatch } from "../hooks";
import { loginSuccess } from "../stores/authSlice";
import type { User } from "../types/types";
import { cartService } from "../utils/cartService";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface AuthResponse {
  accessToken: string;
  expiresIn: number;
}

const Login: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Xử lý OAuth error
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthError = params.get("oauthError");

    if (oauthError) {
      const message = decodeURIComponent(oauthError).includes("canceled")
        ? "Bạn đã hủy đăng nhập với Google/Facebook."
        : decodeURIComponent(oauthError);

      window.history.replaceState({}, document.title, window.location.pathname);
      toast.error(message);
    }
  }, [location]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const { data: loginData } = await axiosInstance.post<AuthResponse>(
        "/auth/login",
        data
      );
      const { accessToken, expiresIn } = loginData;

      const expiresAt = Date.now() + expiresIn * 1000;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("tokenExpiresAt", expiresAt.toString());

      const { data: meData } = await axiosInstance.get<User>("/auth/me");

      const user: User = {
        id: meData.id,
        email: meData.email,
        name: meData.name,
        phone: meData.phone,
        role: meData.role as "guest" | "user" | "admin",
        avatarUrl: meData.avatarUrl,
      };

      dispatch(loginSuccess({ user, accessToken }));
      await cartService.mergeGuestCart();
      toast.success("Đăng nhập thành công!");

      setTimeout(() => {
        navigate(user.role === "ADMIN" ? "/admin" : "/");
      }, 0);
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("tokenExpiresAt");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: "google" | "facebook") => {
    const redirectTo = new URLSearchParams(location.search).get("redirect");
    const baseUrl =
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://localhost:12345";
    const oauthUrl = `${baseUrl}/oauth2/authorize/${provider}`;

    if (redirectTo) {
      window.location.href = `${oauthUrl}?redirect=${encodeURIComponent(
        redirectTo
      )}`;
    } else {
      window.location.href = oauthUrl;
    }
  };

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
              Đăng nhập tài khoản
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Hoặc{" "}
              <Link
                to="/register"
                className="font-medium text-purple-600 hover:text-purple-500"
              >
                tạo tài khoản mới
              </Link>
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("email")}
                    type="email"
                    autoComplete="email"
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    } rounded-md placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                    placeholder="Nhập email của bạn"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mật khẩu
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                      errors.password ? "border-red-300" : "border-gray-300"
                    } rounded-md placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                    placeholder="Nhập mật khẩu"
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
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Ghi nhớ đăng nhập
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-purple-600 hover:text-purple-500"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
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
                      Đang đăng nhập...
                    </div>
                  ) : (
                    "Đăng nhập"
                  )}
                </button>
              </div>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Hoặc đăng nhập với
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {/* Google button */}
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin("google")}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 48 48">
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.32 1.23 8.68 3.23l6.46-6.46C34.95 2.64 29.88 1 24 1 14.91 1 7.11 6.48 3.64 14.12l7.47 5.79C12.6 13.53 17.82 9.5 24 9.5z"
                      />
                      <path
                        fill="#34A853"
                        d="M46.15 24.49c0-1.64-.15-3.21-.43-4.74H24v9.48h12.4c-.54 2.85-2.13 5.26-4.53 6.9l7.02 5.46c4.09-3.77 6.42-9.32 6.42-17.1z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.97 28.44a14.6 14.6 0 0 1-.76-4.44c0-1.54.27-3.03.76-4.44l-7.33-5.69C2.53 16.54 1.5 20.16 1.5 24s1.03 7.46 2.16 10.13l7.31-5.69z"
                      />
                      <path
                        fill="#4285F4"
                        d="M24 46c5.92 0 10.87-1.96 14.49-5.33l-7.01-5.46c-1.96 1.34-4.52 2.29-7.48 2.29-6.18 0-11.41-4.03-13.04-9.32l-7.31 5.69C7.1 41.55 14.9 46 24 46z"
                      />
                    </svg>
                    <span>Google</span>
                  </button>

                  {/* Facebook button */}
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin("facebook")}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 48 48">
                      <path
                        fill="#1877F2"
                        d="M24 1C11.3 1 1 11.3 1 24c0 11.4 8.3 20.9 19.2 22.8V30.6h-5.8v-6.6h5.8v-5.1c0-5.8 3.5-9 8.7-9 2.5 0 5.1.4 5.1.4v5.6h-2.9c-2.9 0-3.8 1.8-3.8 3.6v4.5h6.4l-1 6.6h-5.4v16.2C38.7 44.9 47 35.4 47 24 47 11.3 36.7 1 24 1z"
                      />
                      <path
                        fill="#fff"
                        d="M32.4 30.6l1-6.6h-6.4v-4.5c0-1.8.9-3.6 3.8-3.6h2.9v-5.6s-2.6-.4-5.1-.4c-5.2 0-8.7 3.2-8.7 9v5.1h-5.8v6.6h5.8v16.2a23 23 0 0 0 7.2 0V30.6h5.3z"
                      />
                    </svg>
                    <span>Facebook</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;

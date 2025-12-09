import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { decodeToken } from "../utils/jwt";
import { loginSuccess } from "../stores/authSlice";
import type { User } from "../types/types";
import { cartService } from "../utils/cartService";
import { Loader2 } from "lucide-react";

const OAuth2Redirect: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handledRef = useRef(false);
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const handleOAuth2Login = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("access_token");
        const expiresIn = params.get("expires_in");
        const error = params.get("error");

        if (error) {
          setStatus("error");
          const errorMessage =
            params.get("error_message") || "Đăng nhập thất bại";
          toast.error(errorMessage);
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        if (!accessToken || !expiresIn) {
          setStatus("error");
          toast.error("Thiếu thông tin xác thực");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        const expiresAt = Date.now() + parseInt(expiresIn) * 1000;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("tokenExpiresAt", expiresAt.toString());

        const payload = decodeToken(accessToken);

        if (!payload?.sub || !payload?.email) {
          setStatus("error");
          toast.error("Thông tin người dùng không hợp lệ");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        const user: User = {
          id: payload.sub,
          name: payload.name,
          email: payload.email,
          phone: payload.phone || "",
          role: payload.role,
          avatarUrl: payload.avatarUrl,
        };

        dispatch(loginSuccess({ user, accessToken }));

        await cartService.mergeGuestCart();

        setStatus("success");
        toast.success("Đăng nhập thành công!");

        setTimeout(() => {
          navigate(user.role === "ADMIN" ? "/admin" : "/");
        }, 1000);
      } catch {
        setStatus("error");
        toast.error("Có lỗi xảy ra khi đăng nhập");
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    handleOAuth2Login();
  }, [dispatch, navigate]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
        {status === "processing" && (
          <>
            <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Đang xử lý đăng nhập
            </h2>
            <p className="text-gray-600">Vui lòng đợi trong giây lát...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Đăng nhập thành công!
            </h2>
            <p className="text-gray-600">Đang chuyển hướng...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Đăng nhập thất bại
            </h2>
            <p className="text-gray-600">Đang quay lại trang đăng nhập...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuth2Redirect;

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { decodeToken } from "../utils/jwt";
import { loginSuccess } from "../stores/authSlice";
import type { User } from "../types/types";

const OAuth2Redirect: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    const expiresIn = params.get("expires_in");

    if (accessToken && expiresIn) {
      const expiresAt = Date.now() + parseInt(expiresIn) * 1000;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("tokenExpiresAt", expiresAt.toString());

      const payload = decodeToken(accessToken);
      const user: User = {
        id: payload?.sub,
        name: payload?.name,
        email: payload?.email,
        role: payload?.role,
        avatarUrl: payload?.avatarUrl,
      };

      dispatch(loginSuccess({ user, accessToken }));
      navigate("/");
    } else {
      navigate("/login");
    }
  }, [dispatch, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-lg text-gray-600">Đang xử lý đăng nhập...</p>
    </div>
  );
};

export default OAuth2Redirect;
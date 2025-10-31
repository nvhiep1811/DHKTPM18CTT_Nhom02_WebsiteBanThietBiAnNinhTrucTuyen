import { Theme } from "@radix-ui/themes";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { router } from "./routes/index";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "./stores/authSlice";
import { decodeToken } from "./utils/jwt";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const payload = decodeToken(token);
      if (payload) {
        const user = {
          id: payload.sub,
          name: payload.name,
          email: payload.email,
          role: payload.role,
          avatarUrl: payload.avatarUrl,
        };
        dispatch(loginSuccess({ user, accessToken: token }));
      }
    }
  }, [dispatch]);

  return (
    <Theme appearance="inherit" radius="large" scaling="100%">
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </Theme>
  );
}

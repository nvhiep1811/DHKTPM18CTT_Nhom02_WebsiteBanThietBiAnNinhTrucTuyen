import Home from "../pages/Home";
import Products from "../pages/Products";
import ProductDetails from "../pages/ProductDetail";
import Login from "../pages/Login";
import Cart from "../pages/Cart";
import OAuth2Redirect from "../pages/OAuth2Redirect";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Profile from "../pages/Profile";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import GuestRoute from "../routes/GuestRoute";
import UserGuard from "../components/UserGuard";
import Register from "../pages/Register";
import VerifyEmail from "../pages/VerifyEmail";
import Terms from "../pages/Terms";
import Privacy from "../pages/Privacy";
import Checkout from "../pages/Checkout";
import OrderSuccess from "../pages/OrderSuccess";
import VNPayReturn from "../pages/VNPayReturn";
import { VNPAY_RETURN } from "./routePaths";
import Orders from "../pages/Orders";
import OrderDetail from "../pages/OrderDetail";

export const publicRoutes = {
  path: "/",
  children: [
    {
      index: true,
      element: <Home />,
    },
    {
      path: "products",
      element: <Products />,
    },
    {
      path: "products/:id",
      element: <ProductDetails />,
    },
    {
      path: "cart",
      element: <Cart />,
    },

    // Chỉ cho phép khi chưa login
    {
      path: "login",
      element: (
        <GuestRoute>
          <Login />
        </GuestRoute>
      ),
    },
    {
      path: "forgot-password",
      element: (
        <GuestRoute>
          <ForgotPassword />
        </GuestRoute>
      ),
    },
    {
      path: "reset-password",
      element: (
        <GuestRoute>
          <ResetPassword />
        </GuestRoute>
      ),
    },
    {
      path: "register",
      element: (
        <GuestRoute>
          <Register />
        </GuestRoute>
      ),
    },
    {
      path: "verify-email",
      element: (
        <GuestRoute>
          <VerifyEmail />
        </GuestRoute>
      ),
    },

    // Cần login mới truy cập được
    {
      path: "checkout",
      element: (
        <UserGuard>
          <Checkout />
        </UserGuard>
      ),
    },
    {
      path: "order-success",
      element: (
        <UserGuard>
          <OrderSuccess />
        </UserGuard>
      ),
    },
    {
      path: "orders",
      element: (
        <UserGuard>
          <Orders />
        </UserGuard>
      ),
    },
    {
      path: "orders/:id",
      element: (
        <UserGuard>
          <OrderDetail />
        </UserGuard>
      ),
    },
    {
      path: "profile",
      element: (
        <UserGuard>
          <Profile />
        </UserGuard>
      ),
    },
    {
      path: VNPAY_RETURN,
      element: (
        <UserGuard>
          <VNPayReturn />
        </UserGuard>
      ),
    },

    {
      path: "oauth2/redirect",
      element: <OAuth2Redirect />,
    },
    {
      path: "about",
      element: <About />,
    },
    {
      path: "contact",
      element: <Contact />,
    },
    {
      path: "terms",
      element: <Terms />,
    },
    {
      path: "privacy",
      element: <Privacy />,
    },
  ],
};

import Home from "../pages/Home";
import Products from "../pages/Products";
import ProductDetail from "../pages/ProductDetail";
import Login from "../pages/Login";
import Cart from "../pages/Cart";
import OAuth2Redirect from "../pages/OAuth2Redirect";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Profile from "../pages/Profile";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import GuestRoute from "../routes/GuestRoute";
import ProtectedRoute from "../routes/ProtectedRoute";

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
      element: <ProductDetail />,
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

    // Cần login mới truy cập được
    {
      path: "profile",
      element: (
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      ),
    },

    { 
      path: "oauth2/redirect", 
      element: <OAuth2Redirect /> 
    },
    {
      path: "about",
      element: <About />,
    },
    {
      path: "contact",
      element: <Contact />,
    },
  ],
};
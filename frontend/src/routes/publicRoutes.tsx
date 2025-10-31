import Home from "../pages/Home";
import Products from "../pages/Products";
import ProductDetail from "../pages/ProductDetail";
import Login from "../pages/Login";
import Cart from "../pages/Cart";
import OAuth2Redirect from "../pages/OAuth2Redirect";

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
      path: "login",
      element: <Login />,
    },
    {
      path: "cart",
      element: <Cart />,
    },
    { 
      path: "oauth2/redirect", 
      element: <OAuth2Redirect /> 
    },
  ],
};
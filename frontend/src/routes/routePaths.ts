export const ROUTE_PATHS = {
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  LOGIN: "/login",
  CART: "/cart",
  VNPAY_RETURN: "/payment/vnpay-return",
  ADMIN: {
    ROOT: "/admin",
    USERS: "/admin/users",
    SETTINGS: "/admin/settings",
  },
} as const;

export const VNPAY_RETURN = '/payment/vnpay-return';

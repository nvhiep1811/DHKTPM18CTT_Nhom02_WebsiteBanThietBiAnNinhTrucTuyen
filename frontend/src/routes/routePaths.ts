export const ROUTE_PATHS = {
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  LOGIN: "/login",
  CART: "/cart",
  ADMIN: {
    ROOT: "/admin",
    USERS: "/admin/users",
    SETTINGS: "/admin/settings",
  },
} as const;

import Admin from "../pages/Admin";
// import AuthGuard from "../components/AuthGuard";

export const adminRoutes = {
  path: "/admin",
  // element: <AuthGuard />, // Uncomment khi đã có AuthGuard
  children: [
    {
      index: true,
      element: <Admin />,
    },
    // Dễ dàng thêm các route admin khác
    // {
    //   path: "users",
    //   element: <AdminUsers />,
    // },
    // {
    //   path: "settings",
    //   element: <AdminSettings />,
    // },
  ],
};
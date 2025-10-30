import AuthGuard from "../components/AuthGuard";
import Admin from "../pages/Admin";

export const adminRoutes = {
  path: "/admin",
  element: <AuthGuard roles={["admin"]} />,
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
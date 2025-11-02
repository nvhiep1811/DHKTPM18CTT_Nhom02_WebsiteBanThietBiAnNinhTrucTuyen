import { createBrowserRouter } from "react-router-dom";
import { publicRoutes } from "./publicRoutes";
import { adminRoutes } from "./adminRoutes";
import { errorRoutes } from "./errorRoutes";

export const router = createBrowserRouter(
  [
    publicRoutes,
    adminRoutes,
    ...errorRoutes,
  ],
  {
    future: {
    v7_fetcherPersist: true,
  },
});
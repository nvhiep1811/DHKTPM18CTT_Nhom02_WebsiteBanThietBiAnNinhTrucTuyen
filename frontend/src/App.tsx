import { Theme } from "@radix-ui/themes";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { router } from "./routes/index";

export default function App() {
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

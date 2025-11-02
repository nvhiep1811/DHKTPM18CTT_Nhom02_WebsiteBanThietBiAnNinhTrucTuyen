import { Theme } from "@radix-ui/themes";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { router } from "./routes/index";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { restoreAuth } from "./stores/authSlice";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(restoreAuth() as any);
  }, [dispatch]);

  return (
    <Theme appearance="inherit" radius="large" scaling="100%">
      <RouterProvider 
        router={router} 
        future={{
          v7_startTransition: true,
        }}
      />
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

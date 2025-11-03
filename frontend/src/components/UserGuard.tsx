import React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks";

const UserGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default UserGuard;
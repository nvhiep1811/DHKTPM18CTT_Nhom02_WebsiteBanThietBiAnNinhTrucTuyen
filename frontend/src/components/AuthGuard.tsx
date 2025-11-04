import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks";

interface AuthGuardProps {
  roles?: string[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({ roles }) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role.toLowerCase())) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks";

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestRoute;
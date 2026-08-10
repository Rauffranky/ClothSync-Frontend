import { Navigate, useLocation } from "react-router-dom";
import { getAuthAccessToken } from "../axios/auth/authSession";

const getLoginPath = (pathname) => {
  if (pathname.startsWith("/laundry")) return "/laundry/login";
  if (pathname.startsWith("/superadmin")) return "/superadmin/login";
  return "/business/login";
};

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  if (getAuthAccessToken()) return children;

  return (
    <Navigate
      replace
      state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      to={getLoginPath(location.pathname)}
    />
  );
};

export default ProtectedRoute;

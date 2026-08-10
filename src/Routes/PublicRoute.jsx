import { Navigate } from "react-router-dom";
import { getAuthAccessToken } from "../axios/auth/authSession";
import { NAV } from "../Components/Layout/Dashboard/nav";
import { getFirstPermittedHref } from "../Utils/permissions";

const getAuthenticatedDestination = (portal) => {
  if (portal === "laundry") {
    return getFirstPermittedHref(NAV.laundry) || "/laundry/dashboard";
  }
  if (portal === "superadmin") return "/superadmin/dashboard";
  return "/business/dashboard";
};

const PublicRoute = ({ children, portal = "business" }) => {
  if (!getAuthAccessToken()) return children;

  return <Navigate replace to={getAuthenticatedDestination(portal)} />;
};

export default PublicRoute;

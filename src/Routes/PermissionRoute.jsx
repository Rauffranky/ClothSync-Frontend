import { Navigate } from "react-router-dom";
import { NAV } from "../Components/Layout/Dashboard/nav";
import { getFirstPermittedHref, hasPermission } from "../Utils/permissions";

const PermissionRoute = ({ children, permissionKey, portal = "laundry" }) => {
  if (hasPermission(permissionKey)) return children;

  const fallbackHref =
    getFirstPermittedHref(NAV[portal]) || `/${portal}/dashboard`;
  return <Navigate to={fallbackHref} replace />;
};

export default PermissionRoute;

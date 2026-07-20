import { Navigate } from "react-router-dom";
import { NAV } from "../Components/Layout/Dashboard/nav";
import { getFirstPermittedHref, hasPermission } from "../Utils/permissions";

const PermissionRoute = ({ children, permissionKey, portal = "laundry" }) => {
  if (hasPermission(permissionKey)) return children;

  const fallbackHref = getFirstPermittedHref(NAV[portal]);
  return <Navigate to={fallbackHref || `/${portal}/login`} replace />;
};

export default PermissionRoute;

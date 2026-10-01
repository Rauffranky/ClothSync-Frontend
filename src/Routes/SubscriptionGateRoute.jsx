import { Navigate, useLocation } from "react-router-dom";
import useOrganizationSubscription from "../Hooks/useOrganizationSubscription";

const SubscriptionGateRoute = ({ children }) => {
  const location = useLocation();
  const { hasActiveSubscription, isSuperAdmin, isLoading } =
    useOrganizationSubscription();

  const pathname = location.pathname;
  const isLaundry = pathname.startsWith("/laundry");
  const isBusiness = pathname.startsWith("/business");

  if (isSuperAdmin || (!isLaundry && !isBusiness)) {
    return children;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-(--color-aurora-teal) border-t-transparent" />
      </div>
    );
  }

  const isBillingPath =
    pathname === "/laundry/subscription-billing" ||
    pathname === "/business/subscription-billing";

  if (!hasActiveSubscription && !isBillingPath) {
    const target = isLaundry
      ? "/laundry/subscription-billing"
      : "/business/subscription-billing";
    return <Navigate to={target} replace />;
  }

  return children;
};

export default SubscriptionGateRoute;

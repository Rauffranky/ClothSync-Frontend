import { useMemo } from "react";
import { getTenantSessionUser } from "../axios/auth/tenantSession";

/**
 * Hook to get user's date format preferences (timezone and dateFormat)
 * Returns { timezone, dateFormat } or defaults to { timezone: "UTC", dateFormat: "MM/DD/YYYY" }
 */
export const useUserDatePreferences = () => {
  return useMemo(() => {
    const user = getTenantSessionUser();
    return {
      timezone: user?.timezone || "UTC",
      dateFormat: user?.dateFormat || "MM/DD/YYYY",
    };
  }, []);
};

export default useUserDatePreferences;

import { useEffect, useState } from "react";
import { TENANT_SESSION_USER_UPDATED_EVENT } from "../axios/auth/tenantSession";
import { getUserDatePreferences } from "../Utils/date";

export const useUserDatePreferences = () => {
  const [preferences, setPreferences] = useState(getUserDatePreferences);

  useEffect(() => {
    const syncPreferences = () => setPreferences(getUserDatePreferences());

    window.addEventListener(
      TENANT_SESSION_USER_UPDATED_EVENT,
      syncPreferences,
    );

    return () => {
      window.removeEventListener(
        TENANT_SESSION_USER_UPDATED_EVENT,
        syncPreferences,
      );
    };
  }, []);

  return preferences;
};

export default useUserDatePreferences;

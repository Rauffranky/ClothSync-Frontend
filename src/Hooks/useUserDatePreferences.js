import { useEffect, useState } from "react";
import { AUTH_SESSION_USER_UPDATED_EVENT } from "../axios/auth/authSession";
import { getUserDatePreferences } from "../Utils/date";

export const useUserDatePreferences = () => {
  const [preferences, setPreferences] = useState(getUserDatePreferences);

  useEffect(() => {
    const syncPreferences = () => setPreferences(getUserDatePreferences());

    window.addEventListener(
      AUTH_SESSION_USER_UPDATED_EVENT,
      syncPreferences,
    );

    return () => {
      window.removeEventListener(
        AUTH_SESSION_USER_UPDATED_EVENT,
        syncPreferences,
      );
    };
  }, []);

  return preferences;
};

export default useUserDatePreferences;

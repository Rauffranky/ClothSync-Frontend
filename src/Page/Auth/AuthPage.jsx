import { useEffect, useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import Login from "../../Auth/Login";
import Signup from "../../Auth/Signup";
import { getPortal } from "../../Auth/authConfig";
import { usePageMeta } from "../../Hooks/usePageMeta";
import { applyThemeMode, getThemeMode } from "../../Utils/themeMode";

const AuthPage = ({ defaultMode = "login", defaultRole = "business" }) => {
  const params = useParams();
  const routeMode = params.mode || defaultMode;
  const routeRole = params.role || defaultRole;
  const mode = routeMode === "signup" ? "signup" : "login";
  const portal = getPortal(routeRole);
  const isSignup = mode === "signup";

  const pageTitle = useMemo(
    () => `${isSignup ? "Sign Up" : "Login"} | ${portal.title}`,
    [isSignup, portal.title],
  );

  usePageMeta({
    title: pageTitle,
    meta: [
      {
        name: "description",
        content: "Business and laundry staff authentication for RFID Laundry.",
      },
    ],
  });

  useEffect(() => {
    applyThemeMode(getThemeMode());
  }, []);

  if (routeRole === "superadmin") {
    return <Navigate replace to="/superadmin/login" />;
  }

  return isSignup ? <Signup portal={portal} /> : <Login portal={portal} />;
};

export default AuthPage;

import { useEffect, useLayoutEffect, useState } from "react";
import AppRoutes from "./Routes";
import SplashScreen from "./Components/UI/SplashScreen";
import { applyThemeMode, getThemeMode } from "./Utils/themeMode";
import { startSocketConnection } from "./socket/client";
import useUserDatePreferences from "./Hooks/useUserDatePreferences";
import LiveScanRedirect from "./Components/Layout/Dashboard/LiveScanRedirect";

const SPLASH_SESSION_KEY = "clothsync-splash-shown";

const getInitialSplashState = () => {
  try {
    return sessionStorage.getItem(SPLASH_SESSION_KEY) === "true"
      ? "hidden"
      : "visible";
  } catch {
    return "visible";
  }
};

function App() {
  useUserDatePreferences();
  const [splashState, setSplashState] = useState(getInitialSplashState);
  const shouldShowSplash = splashState !== "hidden";

  useLayoutEffect(() => {
    applyThemeMode(getThemeMode());
  }, []);

  useEffect(() => startSocketConnection(), []);

  useEffect(() => {
    if (!shouldShowSplash) return undefined;

    try {
      sessionStorage.setItem(SPLASH_SESSION_KEY, "true");
    } catch {
      // The splash can still run when browser storage is unavailable.
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const exitDelay = prefersReducedMotion ? 700 : 2400;
    const removeDelay = exitDelay + (prefersReducedMotion ? 180 : 650);
    const exitTimer = window.setTimeout(() => {
      setSplashState("leaving");
    }, exitDelay);
    const removeTimer = window.setTimeout(() => {
      setSplashState("hidden");
    }, removeDelay);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, [shouldShowSplash]);

  return (
    <>
      <LiveScanRedirect />
      <AppRoutes />
      {shouldShowSplash && (
        <SplashScreen isLeaving={splashState === "leaving"} />
      )}
    </>
  );
}

export default App;

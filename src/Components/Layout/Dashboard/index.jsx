import { useEffect, useMemo, useState, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import {
  getAuthAccessToken,
  getAuthSessionUser,
  setAuthSessionUser,
} from "../../../axios/auth/authSession";
import { getTenantSettingsProfile } from "../../../axios/settings/tenantSettings";
import Header from "./Header";
import SideBar from "./SideBar";

const DashboardLayout = ({ portalKey }) => {
  const { pathname } = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] =
    useState(false);
  const [haveTenantPreferencesLoaded, setHaveTenantPreferencesLoaded] =
    useState(false);
  const activePortalKey = useMemo(() => {
    if (portalKey) return portalKey;
    if (pathname.startsWith("/business")) return "business";
    if (pathname.startsWith("/laundry")) return "laundry";
    return "superadmin";
  }, [pathname, portalKey]);

  useEffect(() => {
    if (activePortalKey !== "business" || !getAuthAccessToken()) {
      return undefined;
    }

    let isActive = true;

    getTenantSettingsProfile()
      .then((response) => {
        if (!isActive) return;

        const settingsProfile = response?.data?.profile || response?.profile;
        if (settingsProfile) {
          setAuthSessionUser({
            ...getAuthSessionUser(),
            ...settingsProfile,
          });
        }
      })
      .catch(() => {
        // Existing session defaults keep the portal usable if settings fail.
      })
      .finally(() => {
        if (isActive) setHaveTenantPreferencesLoaded(true);
      });

    return () => {
      isActive = false;
    };
  }, [activePortalKey]);

  const areTenantPreferencesReady =
    activePortalKey !== "business" ||
    !getAuthAccessToken() ||
    haveTenantPreferencesLoaded;

  return (
    <div className="min-h-screen bg-(--theme-page-background) text-(--theme-text-primary)">
      <div className="flex min-h-screen">
        <SideBar
          portal={activePortalKey}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          isDesktopOpen={!isDesktopSidebarCollapsed}
          onDesktopToggle={() =>
            setIsDesktopSidebarCollapsed((current) => !current)
          }
        />

        <div
          className="dashboard-content flex min-w-0 flex-1 flex-col"
          style={{
            "--sidebar-offset": isDesktopSidebarCollapsed ? "88px" : "256px",
          }}
        >
          <Header
            portalKey={activePortalKey}
            onOpenSidebar={() => setIsMobileSidebarOpen(true)}
          />
          <main className="min-w-0 flex-1 p-4 md:p-6 relative">
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[50vh]">
                  <div className="w-8 h-8 border-4 border-(--color-aurora-teal)/30 border-t-(--color-aurora-teal) rounded-full animate-spin"></div>
                </div>
              }
            >
              {areTenantPreferencesReady ? (
                <Outlet />
              ) : (
                <div className="flex min-h-[50vh] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-(--color-aurora-teal)/30 border-t-(--color-aurora-teal)" />
                </div>
              )}
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

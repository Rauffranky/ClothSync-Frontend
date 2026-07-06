import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import SideBar from "./SideBar";

const DashboardLayout = ({ portalKey }) => {
  const { pathname } = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] =
    useState(false);
  const activePortalKey = useMemo(() => {
    if (portalKey) return portalKey;
    if (pathname.startsWith("/business")) return "business";
    if (pathname.startsWith("/laundry")) return "laundry";
    return "superadmin";
  }, [pathname, portalKey]);

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
          <main className="min-w-0 flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

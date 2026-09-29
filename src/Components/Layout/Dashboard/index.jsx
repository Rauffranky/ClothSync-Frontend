import { useMemo, useState, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import SideBar from "./SideBar";
import GlobalUndoBanners from "./GlobalUndoBanners";

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
          <main className="min-w-0 flex-1 p-4 md:p-6 relative">
            <Suspense
              fallback={
                <div className="space-y-6 animate-pulse" aria-label="Loading page">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-7 w-48 rounded-lg bg-(--theme-surface-strong)" />
                      <div className="h-4 w-72 rounded bg-(--theme-surface-strong)" />
                    </div>
                    <div className="h-9 w-28 rounded-xl bg-(--theme-surface-strong)" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-28 rounded-2xl border border-(--theme-border-soft) bg-(--theme-surface-strong) p-4 space-y-3"
                      >
                        <div className="h-8 w-8 rounded-xl bg-(--theme-border)" />
                        <div className="h-4 w-24 rounded bg-(--theme-border)" />
                      </div>
                    ))}
                  </div>
                  <div className="h-80 rounded-2xl border border-(--theme-border-soft) bg-(--theme-surface-strong)" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
      {!pathname.includes("/bulk-scanning") &&
        pathname !== "/laundry/incoming-batches" && (
        <GlobalUndoBanners portal={activePortalKey} />
      )}
    </div>
  );
};

export default DashboardLayout;

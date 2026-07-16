import { Bell, Menu, Moon, Sun, ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../UI/Button";
import {
  applyThemeMode,
  getThemeMode,
  toggleThemeMode,
} from "../../../Utils/themeMode";
import { getFlatPortalItems, portalGroups } from "./nav";
import {
  getAuthenticatedTenant,
  getTenantAccessToken,
  getTenantSessionUser,
  setTenantSessionUser,
  TENANT_SESSION_USER_UPDATED_EVENT,
} from "../../../axios/auth/tenantAuth";

const Header = ({ portalKey, onOpenSidebar }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [themeMode, setThemeMode] = useState(getThemeMode);
  const [tenantProfile, setTenantProfile] = useState(getTenantSessionUser);

  useEffect(() => {
    applyThemeMode(themeMode);
  }, [themeMode]);

  useEffect(() => {
    const handleTenantProfileUpdate = (event) => {
      setTenantProfile(event.detail ?? getTenantSessionUser());
    };

    window.addEventListener(
      TENANT_SESSION_USER_UPDATED_EVENT,
      handleTenantProfileUpdate,
    );

    return () => {
      window.removeEventListener(
        TENANT_SESSION_USER_UPDATED_EVENT,
        handleTenantProfileUpdate,
      );
    };
  }, []);

  useEffect(() => {
    if (portalKey !== "business" || !getTenantAccessToken()) return;

    let isActive = true;

    getAuthenticatedTenant()
      .then((response) => {
        if (!isActive) return;
        const profile = response?.data ?? response;
        const mergedProfile = {
          ...getTenantSessionUser(),
          ...profile,
        };
        setTenantProfile(mergedProfile);
        setTenantSessionUser(mergedProfile);
      })
      .catch(() => {
        // Keep the last stored profile when a background refresh fails.
      });

    return () => {
      isActive = false;
    };
  }, [portalKey]);

  const activePortal = useMemo(() => {
    const portalFromKey = portalGroups.find(
      (portal) => portal.enabled && portal.key === portalKey,
    );

    if (portalFromKey) return portalFromKey;

    return portalGroups.find(
      (portal) => portal.enabled && pathname.startsWith(portal.basePath),
    );
  }, [pathname, portalKey]);

  const activeItem = useMemo(() => {
    const flatItems = getFlatPortalItems(activePortal?.key) || [];
    return flatItems
      .filter((item) => pathname.includes(`/${item.segment}`))
      .sort((a, b) => b.segment.length - a.segment.length)[0];
  }, [activePortal?.key, pathname]);

  const profileName =
    tenantProfile?.businessName ||
    tenantProfile?.name ||
    tenantProfile?.fullName ||
    activePortal?.user.name ||
    "User";
  const profileInitials = String(profileName)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const isNestedPage =
    activeItem &&
    pathname !== `${activePortal?.basePath}/${activeItem.segment}`;
  const nestedPageLabel =
    pathname === "/business/scanners/warnings"
      ? "Warnings"
      : pathname === "/business/staff-roles"
        ? "Roles"
        : "Details";

  return (
    <header className="sticky top-0 z-30 border-b border-(--theme-border) bg-(--layout-header-bg) px-4 py-3 backdrop-blur-[18px] backdrop-saturate-150">
      <div className="flex justify-between items-center gap-3">
        <div>
          <div className="flex min-w-0 items-center gap-3">
            <button
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-(--theme-border) bg-(--button-ghost-bg) text-(--theme-text-primary) lg:hidden"
              type="button"
              aria-label="Open sidebar"
              onClick={onOpenSidebar}
            >
              <Menu size={20} />
            </button>
            {isNestedPage && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<ArrowLeft size={16} />}
                onClick={() => navigate(`${activePortal?.basePath}/${activeItem?.segment}`)}
              />
            )}
            <div className="min-w-0">
              <p className="m-0 truncate text-lg font-medium text-(--theme-text-primary)">
                {activeItem?.label || "Dashboard"}
                {isNestedPage && (
                  <span className="text-(--theme-text-muted) font-semibold ml-2">
                    / <span className="ml-1 text-(--theme-text-secondary)">{nestedPageLabel}</span>
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <Button
            leftIcon={
              themeMode === "dark" ? <Sun size={17} /> : <Moon size={17} />
            }
            onClick={() => setThemeMode(toggleThemeMode())}
            rounded="14px"
            size="sm"
            type="button"
            variant="secondary"
          />

          <button
            className="relative grid h-10 w-10 place-items-center rounded-2xl border border-(--theme-border) bg-(--button-ghost-bg) text-(--theme-text-primary)"
            type="button"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-(--color-aurora-teal) shadow-[0_0_12px_var(--color-aurora-teal)]" />
          </button>

          <div className="hidden items-center gap-3 rounded-2xl border border-(--theme-border) bg-(--button-ghost-bg) px-2 py-1 md:flex">
            <div className="min-w-0 text-right">
              <p className="m-0 truncate text-xs font-black text-(--theme-text-primary)">
                {profileName}
              </p>
              <p className="m-0 truncate text-[11px] font-semibold text-(--theme-text-muted)">
                {tenantProfile?.email || activePortal?.user.email}
              </p>
            </div>
            <span
              className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl text-xs font-black text-white"
              style={{ background: activePortal?.accent }}
            >
              {tenantProfile?.avatar ? (
                <img
                  alt={`${profileName} avatar`}
                  className="h-full w-full object-cover"
                  src={tenantProfile.avatar}
                />
              ) : (
                profileInitials
              )}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

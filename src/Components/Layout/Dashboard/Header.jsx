import { Bell, Menu, Moon, Sun } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Button from "../../UI/Button";
import {
  applyThemeMode,
  getThemeMode,
  toggleThemeMode,
} from "../../../Utils/themeMode";
import { getFlatPortalItems, portalGroups } from "./nav";

const Header = ({ portalKey, onOpenSidebar }) => {
  const { pathname } = useLocation();
  const [themeMode, setThemeMode] = useState(getThemeMode);

  useEffect(() => {
    applyThemeMode(themeMode);
  }, [themeMode]);

  const activePortal = useMemo(() => {
    const portalFromKey = portalGroups.find(
      (portal) => portal.enabled && portal.key === portalKey,
    );

    if (portalFromKey) return portalFromKey;

    return portalGroups.find(
      (portal) => portal.enabled && pathname.startsWith(portal.basePath),
    );
  }, [pathname, portalKey]);

  const activeItem = useMemo(
    () =>
      getFlatPortalItems(activePortal?.key).find((item) =>
        pathname.endsWith(`/${item.segment}`),
      ),
    [activePortal?.key, pathname],
  );

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
            <div className="min-w-0">
              <p className="m-0 truncate text-lg font-medium text-(--theme-text-primary)">
                {activeItem?.label || "Dashboard"}
              </p>
              {/* <p className="m-0 truncate text-xs font-semibold text-(--theme-text-secondary)">
                {activePortal?.label || "Portal"}
              </p> */}
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
                {activePortal?.user.name}
              </p>
              <p className="m-0 truncate text-[11px] font-semibold text-(--theme-text-muted)">
                {activePortal?.user.email}
              </p>
            </div>
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-xs font-black text-white"
              style={{ background: activePortal?.accent }}
            >
              {activePortal?.shortLabel}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

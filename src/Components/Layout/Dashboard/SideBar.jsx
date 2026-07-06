/* eslint-disable no-unused-vars */

import {
  Bell,
  CreditCard,
  X,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { NAV } from "./nav";
import GlobalTooltip from "../../UI/Tooltip";

const SideBar = ({
  isOpen = false,
  onClose = () => {},
  isDesktopOpen,
  onDesktopToggle,
  portal = "superadmin",
}) => {
  const location = useLocation();
  const menu = useMemo(
    () =>
      (NAV[portal] || []).flatMap((item) =>
        Array.isArray(item.items) ? item.items : item,
      ),
    [portal],
  );
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState({});

  const renderLogoArea = (isMobile = false) => {
    return (
      <div
        onClick={handleLogo}
        className={isMobile ? "cursor-pointer flex flex-col gap-1" : "cursor-pointer my-3.5"}
      >
        <h1 className="text-2xl text-gradient-aurora-flow font-bold">
          Cloth Sync
        </h1>
      </div>
    );
  };
  
  const handleLogo = () => {
    navigate(`/${portal}/dashboard`);
  };

  const handleLogout = () => {
    navigate("/auth/login");
    if (isOpen) onClose();
  };

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const toggleSubmenu = (id) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isAnySubmenuActive = (submenus = []) =>
    submenus.some(
      (s) =>
        location.pathname === s.href ||
        location.pathname.startsWith(`${s.href}/`),
    );

  const renderLink = (
    { id, label, href, Icon, submenus, badge },
    isMobile = false,
  ) => {
    const hasSubmenus = submenus && submenus.length > 0;
    const isSubmenuActive = hasSubmenus && isAnySubmenuActive(submenus);
    const isActive =
      location.pathname === href ||
      location.pathname.startsWith(`${href}/`) ||
      isSubmenuActive;

    const isExpanded = !!expandedMenus[id] || isSubmenuActive;
    const showLabel = isMobile || isDesktopOpen;

    return (
      <div key={id} className="mb-1">
        <GlobalTooltip
          text={label}
          position="right"
          className="w-full"
          disabled={isMobile}
        >
          <div
            onClick={() => {
              if (label === "Logout") {
                handleLogout();
                return;
              }
              if (hasSubmenus) {
                if (!showLabel && !isMobile) onDesktopToggle();
                else toggleSubmenu(id);
              } else {
                navigate(href);
                if (isMobile) onClose();
              }
            }}
            className={[
              "relative flex items-center justify-between cursor-pointer group transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              showLabel ? "px-4 py-2.5" : "w-11 h-11 mx-auto px-0 py-0",
              "rounded-[10px]",
              isActive
                ? "bg-(--button-secondary-bg) border border-(--button-secondary-border) shadow-(--button-secondary-shadow)"
                : "hover:bg-(--button-ghost-bg-hover) border border-transparent",
            ].join(" ")}
          >
            <div
              className={[
                "flex items-center w-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                showLabel ? "gap-3 justify-start" : "gap-0 justify-center",
              ].join(" ")}
            >
              <div className="relative flex items-center justify-center shrink-0">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className={[
                    "relative z-10 transition-colors duration-300",
                    isActive
                      ? "text-(--color-aurora-teal)"
                      : "text-(--theme-text-muted) group-hover:text-(--theme-text-primary)",
                  ].join(" ")}
                />
              </div>

              <span
                className={[
                  "font-medium text-[14px] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  isMobile
                    ? "min-w-0 flex-1 whitespace-normal wrap-break-word pr-3 opacity-100"
                    : showLabel
                    ? "max-w-40 flex-1 whitespace-nowrap overflow-hidden text-ellipsis pr-4 opacity-100"
                    : "max-w-0 flex-none pr-0 opacity-0",
                  isActive
                    ? "text-(--color-aurora-teal)"
                    : "text-(--theme-text-secondary) group-hover:text-(--theme-text-primary)",
                ].join(" ")}
              >
                {label}
              </span>

              <div
                className={[
                  "absolute right-4 w-1.5 h-1.5 rounded-full bg-(--color-aurora-teal) shadow-[0_0_8px_var(--color-aurora-teal)] transition-opacity duration-300",
                  isActive && showLabel ? "opacity-100" : "opacity-0",
                ].join(" ")}
              />
            </div>

            {hasSubmenus && (
              <div
                className={[
                  "transition-all duration-300",
                  showLabel ? "max-w-5 opacity-100" : "max-w-0 opacity-0",
                  isExpanded ? "rotate-180" : "",
                ].join(" ")}
              >
                <ChevronDown
                  size={16}
                  className={
                    isActive
                      ? "text-(--color-aurora-teal)"
                      : "text-(--theme-text-muted)"
                  }
                />
              </div>
            )}
          </div>
        </GlobalTooltip>

        {hasSubmenus && isExpanded && showLabel && (
          <div className="mt-1 space-y-1.5 px-3 pb-2 pt-1 border-l-2 border-(--theme-border) ml-6">
            {submenus.map((submenu) => {
              const isSubActive =
                location.pathname === submenu.href ||
                location.pathname.startsWith(`${submenu.href}/`);
              return (
                <NavLink
                  key={submenu.id}
                  to={submenu.href}
                  onClick={() => isMobile && onClose()}
                  className={[
                    "flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] transition-all duration-200",
                    isSubActive
                      ? "text-(--color-aurora-teal) font-medium"
                      : "text-(--theme-text-secondary) hover:text-(--theme-text-primary) hover:bg-(--button-ghost-bg-hover)",
                  ].join(" ")}
                >
                  <span>{submenu.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderMenuContent = (isMobile = false) => {
    return menu.map((item) => renderLink(item, isMobile));
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-9998 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={[
          "fixed z-9999 top-0 left-0 h-screen w-72 max-w-[86vw] lg:hidden",
          "transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          "bg-(--layout-sidebar-bg) shadow-(--layout-panel-shadow) border-r border-(--theme-border)",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="shrink-0 flex items-center justify-between px-4 py-3.5 border-b border-(--theme-border)">
          {renderLogoArea(true)}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-(--button-ghost-bg-hover) self-start"
          >
            <X size={22} className="text-(--theme-text-muted)" />
          </button>
        </div>

        <nav className="p-3 flex flex-col justify-between h-[calc(100dvh-64px)] overflow-auto hide-scrollbar">
          <div className="space-y-1">{renderMenuContent(true)}</div>
          <div className="mt-4">
            {renderLink(
              { id: "logout", label: "Logout", href: "#", Icon: LogOut },
              true,
            )}
          </div>
        </nav>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`
          dashboard-sidebar
          group/sidebar
          hidden lg:flex flex-col
          fixed top-0 left-0 bottom-0 h-screen
          bg-(--layout-sidebar-bg) border-r border-(--theme-border)
          backdrop-blur-[18px] backdrop-saturate-150
          z-50 overflow-visible font-jakarta
        `}
        style={{
          "--sidebar-width": isDesktopOpen ? "256px" : "88px",
          "--sidebar-pad": isDesktopOpen ? "16px" : "8px",
        }}
      >
        

        <div
          className={`flex items-center justify-center pt-2 pb-1 shrink-0 border-b border-(--theme-border)`}
        >
          {renderLogoArea(false)}
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 hide-scrollbar">
          {renderMenuContent(false)}
        </div>

        <div className="pt-2 pb-8 bg-transparent flex flex-col gap-2 border-t border-(--theme-border)">
          {renderLink(
            { id: "logout", label: "Logout", href: "#", Icon: LogOut },
            false,
          )}
          
        </div>
      </aside>
    </>
  );
};

export default SideBar;

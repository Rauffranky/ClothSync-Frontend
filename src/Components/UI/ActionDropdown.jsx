import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";
import Button from "./Button";

const ActionDropdown = ({
  items = [],
  triggerIcon = <MoreHorizontal size={16} />,
  triggerAriaLabel = "Open actions",
  width = 200,
  align = "left",
}) => {
  const menuId = useId();
  const [menuPosition, setMenuPosition] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    const closeMenu = () => {
      setMenuPosition(null);
      setHoveredItem(null);
    };
    const closeOtherMenus = (event) => {
      if (event.detail !== menuId) setMenuPosition(null);
    };

    window.addEventListener("action-dropdown-open", closeOtherMenus);
    window.addEventListener("mousedown", closeMenu);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);

    return () => {
      window.removeEventListener("action-dropdown-open", closeOtherMenus);
      window.removeEventListener("mousedown", closeMenu);
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, [menuId]);

  const openMenu = (event) => {
    event.stopPropagation();
    window.dispatchEvent(
      new CustomEvent("action-dropdown-open", { detail: menuId }),
    );

    const rect = event.currentTarget.getBoundingClientRect();
    const hasLeftSpace = rect.left > width + 20;
    const estimatedMenuHeight = 50 + items.length * 45;
    const preferredTop = rect.top - 8;
    const hasBottomSpace = preferredTop + estimatedMenuHeight <= window.innerHeight - 12;
    const preferredLeft =
      align === "right" || hasLeftSpace ? rect.left - width - 12 : rect.right + 12;
    const top = hasBottomSpace
      ? preferredTop
      : Math.max(12, rect.bottom - estimatedMenuHeight + 8);

    setMenuPosition((current) =>
      current
        ? null
        : {
            top,
            left: Math.max(
              12,
              Math.min(preferredLeft, window.innerWidth - width - 12),
            ),
          },
    );
  };

  return (
    <div className="flex justify-center">
      <Button
        aria-label={triggerAriaLabel}
        disableHoverTransform
        leftIcon={triggerIcon}
        onClick={openMenu}
        onMouseDown={(event) => event.stopPropagation()}
        size={{ minHeight: 30, padding: "0 10px" }}
        style={{
          minWidth: 48,
          transform: "none",
          boxShadow: menuPosition
            ? "0 0 0 3px color-mix(in srgb, var(--color-aurora-teal) 16%, transparent)"
            : "none",
        }}
        variant="outline"
      />

      {menuPosition &&
        createPortal(
          <div
            className="fixed z-50 rounded-2xl border p-2 shadow-(--layout-panel-shadow)"
            onMouseDown={(event) => event.stopPropagation()}
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              width,
              background: "var(--theme-surface-strong)",
              borderColor: "var(--theme-border)",
            }}
          >
            

            {items.map((item) => {
              const Icon = item.icon;
              const isHovered = hoveredItem === item.label && !item.disabled;

              return (
                <button
                  className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold first:mt-0"
                  disabled={item.disabled}
                  key={item.label}
                  onMouseEnter={() => setHoveredItem(item.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={(event) => {
                    event.stopPropagation();
                    item.onClick?.(item);
                    setMenuPosition(null);
                  }}
                  style={{
                    color: item.danger
                      ? "var(--color-overdue)"
                      : isHovered
                        ? "var(--theme-text-primary)"
                        : "var(--theme-text-secondary)",
                    background: item.danger
                      ? isHovered
                        ? "rgba(239, 68, 68, 0.11)"
                        : "transparent"
                      : isHovered
                        ? "rgba(20, 184, 166, 0.12)"
                        : "transparent",
                    cursor: item.disabled ? "not-allowed" : "pointer",
                    opacity: item.disabled ? 0.55 : 1,
                    transition:
                      "background-color 180ms ease, color 180ms ease, box-shadow 180ms ease",
                    boxShadow:
                      isHovered && item.danger
                        ? "inset 0 0 0 1px rgba(239, 68, 68, 0.16)"
                        : isHovered
                          ? "inset 0 0 0 1px rgba(20, 184, 166, 0.16)"
                          : "none",
                  }}
                  type="button"
                >
                  {Icon && <Icon size={17} />}
                  {item.label}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default ActionDropdown;

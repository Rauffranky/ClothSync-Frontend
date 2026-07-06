import { useEffect, useState } from "react";
import { Menu, Moon, Radio, Sun } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { landingNavigationItems } from "../../../Config/navigation";
import Button from "../../UI/Button";
import SlideOver from "../../UI/SlideOver";
import {
  applyThemeMode,
  getThemeMode,
  toggleThemeMode,
} from "../../../Utils/themeMode";

const Header = () => {
  const navigate = useNavigate();
  const { hash, pathname } = useLocation();
  const [themeMode, setThemeMode] = useState(getThemeMode);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    applyThemeMode(themeMode);
  }, [themeMode]);

  const handleNavigate = (item) => {
    navigate(item.hash ? `${item.to}${item.hash}` : item.to);
    setIsMobileMenuOpen(false);
  };

  const handleToggleTheme = () => {
    setThemeMode(toggleThemeMode());
  };

  return (
    <header className="sticky top-0 z-40 px-4 py-4">
      <div
        className="mx-auto flex w-full max-w-7xl items-center justify-between md:justify-start gap-4 rounded-[22px] border p-3 backdrop-blur-[18px] backdrop-saturate-150
        bg-(--layout-header-bg) border-(--theme-border) shadow-(--layout-panel-shadow)"
      >
        <button
          className="flex min-w-0 shrink-0 items-center gap-3"
          onClick={() => navigate("/")}
          type="button"
        >
          <span
            className="grid h-12 w-12 place-items-center rounded-2xl text-white shadow-[0_0_24px_rgba(20,184,166,0.32)]"
            style={{ background: "var(--gradient-aurora-flow)" }}
          >
            <Radio size={24} />
          </span>
        </button>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {landingNavigationItems.map((item) => {
            const isActive =
              pathname === item.to && (item.hash ? hash === item.hash : !hash);

            return (
              <button
                className="rounded-xl px-3 py-2 cursor-pointer text-sm font-bold transition hover:bg-[rgba(20,184,166,0.12)]"
                key={item.label}
                onClick={() => handleNavigate(item)}
                type="button"
                style={{
                  color: isActive
                    ? "var(--color-aurora-teal)"
                    : "var(--theme-text-secondary)",
                  background: isActive ? "rgba(20, 184, 166, 0.12)" : undefined,
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button
            leftIcon={
              themeMode === "dark" ? <Sun size={18} /> : <Moon size={18} />
            }
            onClick={handleToggleTheme}
            rounded="12px"
            size="sm"
            type="button"
            variant="secondary"
          />

          <Button
            onClick={() => navigate("/business/login")}
            rounded="12px"
            size="sm"
            type="button"
            variant="primary"
          >
            Login
          </Button>
        </div>

        <button
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border bg-white/30 dark:bg-(--button-secondary-bg) border-(--theme-border) text-(--theme-text-primary) hover:bg-[rgba(20,184,166,0.12)] transition md:hidden"
          type="button"
          aria-label="Open menu"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={20} />
        </button>
      </div>

      <SlideOver
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        direction="bottom"
        headerContent={
          <button
            className="flex min-w-0 shrink-0 items-center gap-3"
            onClick={() => {
              navigate("/");
              setIsMobileMenuOpen(false);
            }}
            type="button"
          >
            <span
              className="grid h-12 w-12 place-items-center rounded-2xl text-white shadow-[0_0_24px_rgba(20,184,166,0.32)]"
              style={{ background: "var(--gradient-aurora-flow)" }}
            >
              <Radio size={24} />
            </span>
          </button>
        }
      >
        <div className="flex flex-col gap-2">
          {landingNavigationItems.map((item) => {
            const isActive =
              pathname === item.to && (item.hash ? hash === item.hash : !hash);

            return (
              <button
                key={item.label}
                onClick={() => handleNavigate(item)}
                className="w-full text-left rounded-xl px-4 py-3 font-bold transition hover:bg-[rgba(20,184,166,0.12)]"
                style={{
                  color: isActive
                    ? "var(--color-aurora-teal)"
                    : "var(--theme-text-primary)",
                  background: isActive ? "rgba(20, 184, 166, 0.12)" : undefined,
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-auto flex flex-col gap-4 pt-4 border-t border-(--theme-border)">
          <div className="flex items-center justify-between px-2">
            <span className="font-semibold text-(--theme-text-primary)">Theme</span>
            <Button
              leftIcon={
                themeMode === "dark" ? <Sun size={18} /> : <Moon size={18} />
              }
              onClick={handleToggleTheme}
              rounded="12px"
              size="sm"
              type="button"
              variant="secondary"
            >
              {themeMode === "dark" ? "Light" : "Dark"}
            </Button>
          </div>
          
          <Button
            onClick={() => {
              navigate("/business/login");
              setIsMobileMenuOpen(false);
            }}
            rounded="12px"
            className="w-full justify-center"
            size="sm"
            type="button"
            variant="primary"
          >
            Login
          </Button>
        </div>
      </SlideOver>
    </header>
  );
};

export default Header;

import { useEffect, useState } from "react";
import { Menu, Moon, Radio, Sun } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { landingNavigationItems } from "../../../Config/navigation";
import Button from "../../UI/Button";
import {
  applyThemeMode,
  getThemeMode,
  toggleThemeMode,
} from "../../../Utils/themeMode";

const Header = () => {
  const navigate = useNavigate();
  const { hash, pathname } = useLocation();
  const [themeMode, setThemeMode] = useState(getThemeMode);

  useEffect(() => {
    applyThemeMode(themeMode);
  }, [themeMode]);

  const handleNavigate = (item) => {
    navigate(item.hash ? `${item.to}${item.hash}` : item.to);
  };

  const handleToggleTheme = () => {
    setThemeMode(toggleThemeMode());
  };

  return (
    <header className="sticky top-0 z-40 px-4 py-4">
      <div
        className="mx-auto flex w-full max-w-7xl items-center gap-4 rounded-[22px] border p-3 backdrop-blur-[18px] backdrop-saturate-150
        bg-(--layout-header-bg) border-(--theme-border) shadow-(--layout-panel-shadow)"
      >
        <button
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border bg-white/30 text-(--theme-text-primary) md:hidden"
          type="button"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

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

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
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

        <Button
          // className="ml-auto lg:ml-3"
          leftIcon={
            themeMode === "dark" ? <Sun size={18} /> : <Moon size={18} />
          }
          onClick={handleToggleTheme}
          rounded="12px"
          size="sm"
          type="button"
          variant="secondary"
        ></Button>

        <Button
          className="hidden sm:inline-flex"
          onClick={() => navigate("/business/login")}
          rounded="12px"
          size="sm"
          type="button"
          variant="primary"
        >
          Login
        </Button>
      </div>
    </header>
  );
};

export default Header;

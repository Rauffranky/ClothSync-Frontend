import { Mail, MapPin, Radio, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { landingNavigationItems } from "../../../Config/navigation";

const Footer = () => {
  const navigate = useNavigate();
  const handleNavigate = (item) => {
    navigate(item.hash ? `${item.to}${item.hash}` : item.to);
  };

  return (
    <footer className="px-4 py-6">
      <div
        className="mx-auto w-full max-w-7xl overflow-hidden rounded-[28px] border backdrop-blur-[18px] backdrop-saturate-150"
        style={{
          background: "var(--layout-footer-bg)",
          borderColor: "var(--theme-border)",
          boxShadow: "var(--layout-panel-shadow)",
        }}
      >
        <div className="grid gap-8 p-6 md:grid-cols-[1.1fr_1fr] md:p-8">
          <div>
            <div className="flex items-center gap-3">
              <span
                className="grid h-12 w-12 place-items-center rounded-2xl text-white shadow-[0_0_24px_rgba(20,184,166,0.32)]"
                style={{ background: "var(--gradient-aurora-flow)" }}
              >
                <Radio size={24} />
              </span>
              <div>
                <h2 className="m-0 text-lg font-black text-(--theme-text-primary)">
                  RFID Laundry
                </h2>
                <p className="m-0 text-xs font-semibold text-(--theme-text-secondary)">
                  Smart. Clean. Connected.
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-md text-sm font-medium leading-6 text-(--theme-text-secondary)">
              A smart RFID-powered laundry management platform for tenants,
              laundry staff, and admins.
            </p>

            <div className="mt-5 grid gap-3 text-sm font-semibold text-(--theme-text-secondary)">
              <a
                className="flex items-center gap-2 hover:text-(--color-aurora-teal)"
                href="mailto:support@rfidlaundry.com"
              >
                <Mail size={16} />
                support@rfidlaundry.com
              </a>
              <span className="flex items-center gap-2">
                <MapPin size={16} />
                Connected Laundry Operations
              </span>
            </div>
          </div>

          <div>
            <h3 className="m-0 text-sm font-black uppercase tracking-[0.14em] text-(--theme-text-primary)">
              Navigation
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {landingNavigationItems.map((item) => (
                <button
                  className="text-sm font-semibold text-(--theme-text-secondary) transition hover:text-(--color-aurora-teal)"
                  key={item.label}
                  onClick={() => handleNavigate(item)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className="flex flex-col gap-3 border-t px-6 py-4 text-sm font-semibold text-(--theme-text-secondary) md:flex-row md:items-center md:justify-between md:px-8"
          style={{ borderColor: "var(--theme-border)" }}
        >
          <span>
            Copyright {new Date().getFullYear()} RFID Laundry Management System.
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-(--color-aurora-teal)" />
            Secure RFID technology for contactless operations.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

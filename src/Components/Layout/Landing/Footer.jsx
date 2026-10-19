import { ArrowRight, Mail, Radio } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../../Logo";
import Button from "../../UI/Button";
import { landingNavigationItems } from "../../../Config/navigation";
import { SUPPORT_EMAIL } from "../../../Config/contact";

const linkClass =
  "w-fit rounded text-sm text-(--theme-text-secondary) transition-colors hover:text-(--color-aurora-teal) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-aurora-teal)";

export default function Footer() {
  return (
    <footer className="mt-8 border-t border-(--theme-border) bg-(--layout-footer-bg)">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-8">
        <div className="mb-12 flex flex-col justify-between gap-6 border-b border-(--theme-border) pb-10 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-(--color-aurora-teal)">
              <Radio size={15} /> Smart. Clean. Connected.
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-(--theme-text-primary) md:text-3xl">
              A clearer picture of every linen journey.
            </h2>
          </div>
          <Button as={Link} to="/contact" rightIcon={<ArrowRight size={17} />}>
            Let’s connect
          </Button>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" aria-label="Trackly home">
              <Logo className="h-10 w-auto" />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-7 text-(--theme-text-secondary)">
              Trackly brings businesses, laundry
              partners, and everyday operations into sync.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className={`${linkClass} mt-5 inline-flex items-center gap-2 break-all`}
            >
              <Mail size={16} className="shrink-0" />
              {SUPPORT_EMAIL}
            </a>
          </div>
          <FooterLinks
            title="Explore"
            links={landingNavigationItems
              .filter((item) => item.to !== "/contact")
              .map((item) => ({
                label: item.label,
                to: `${item.to}${item.hash || ""}`,
              }))}
          />
          <FooterLinks
            title="Your workspace"
            links={[
              { label: "Business portal", to: "/business/login" },
              { label: "Laundry portal", to: "/laundry/login" },
              { label: "Create business account", to: "/business/signup" },
              { label: "Create laundry account", to: "/laundry/signup" },
            ]}
          />
          <FooterLinks
            title="Help & legal"
            links={[
              { label: "Contact Us", to: "/contact" },
              { label: "Privacy Policy", to: "/privacy-policy" },
              { label: "Terms & Conditions", to: "/terms-and-conditions" },
            ]}
          />
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-(--theme-border) pt-6 text-xs text-(--theme-text-muted) sm:flex-row">
          <p>© {new Date().getFullYear()} Trackly. All rights reserved.</p>
          <p>
            Powered by{" "}
            <a
              href="https://code-xperts.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-(--color-aurora-teal) hover:underline"
            >
              Code Xperts
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }) {
  const { pathname, hash } = useLocation();

  return (
    <nav aria-label={title}>
      <h3 className="mb-5 text-xs font-bold uppercase tracking-widest text-(--theme-text-primary)">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map(({ label, to }) => {
          const [targetPath, targetHash = ""] = to.split("#");
          const isActive = pathname === targetPath && hash === (targetHash ? `#${targetHash}` : "");

          return (
            <li key={label}>
              <Link
                to={to}
                aria-current={isActive ? (targetHash ? "location" : "page") : undefined}
                className={`${linkClass}${isActive ? " font-semibold underline decoration-2 underline-offset-4" : ""}`}
                style={isActive ? { color: "var(--color-aurora-teal)" } : undefined}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

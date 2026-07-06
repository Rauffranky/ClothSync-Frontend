import { useState } from "react";
import { ArrowRight, Building2, Mail, Radio, ShieldCheck } from "lucide-react";
import Button from "../../../Components/UI/Button";
import Dropdown from "../../../Components/UI/Dropdown";
import Input from "../../../Components/UI/Input";

const stats = [
  { value: "24/7", label: "Live laundry tracking" },
  { value: "RFID", label: "Tag based garment flow" },
  { value: "3", label: "Tenant, staff, admin portals" },
];

const portalOptions = [
  { label: "Tenant Portal", value: "tenant" },
  { label: "Laundry Staff", value: "laundry-staff" },
  { label: "Super Admin", value: "super-admin" },
];

const Index = () => {
  const [email, setEmail] = useState("");
  const [portal, setPortal] = useState(null);

  return (
    <section className="grid min-h-[calc(100vh-180px)] items-center gap-10 py-8 lg:grid-cols-[1.08fr_0.92fr] lg:py-14">
      <div>
        <div
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold"
          style={{
            color: "var(--color-aurora-teal)",
            background: "rgba(20, 184, 166, 0.1)",
            borderColor: "rgba(20, 184, 166, 0.22)",
          }}
        >
          <Radio size={16} />
          RFID Laundry Management
        </div>

        <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight text-(--theme-text-primary) md:text-6xl">
          Smart laundry operations with real-time RFID control.
        </h1>

        <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-(--theme-text-secondary) md:text-lg">
          Manage tenant garments, laundry staff workflows, and admin visibility
          from one connected dashboard built for fast daily operations.
        </p>

        <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-[1fr_220px_auto]">
          <Input
            leftIcon={<Mail size={18} />}
            onChange={setEmail}
            placeholder="Enter your email"
            type="email"
            value={email}
          />
          <Dropdown
            onChange={setPortal}
            options={portalOptions}
            placeholder="Select portal"
            value={portal}
          />
          <Button rightIcon={<ArrowRight size={18} />} size="lg">
            Get Started
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {stats.map((item) => (
            <div
              className="rounded-2xl border p-4 backdrop-blur-lg"
              key={item.label}
              style={{
                background: "var(--theme-surface)",
                borderColor: "var(--theme-border)",
                boxShadow: "var(--button-ghost-shadow)",
              }}
            >
              <div className="text-2xl font-black text-(--theme-text-primary)">
                {item.value}
              </div>
              <div className="mt-1 text-sm font-semibold text-(--theme-text-secondary)">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="card-glass-border rounded-[28px]"
        style={{ boxShadow: "var(--card-glass-shadow)" }}
      >
        <div className="card-glass-inner rounded-[28px] p-5 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="m-0 text-sm font-bold text-(--theme-text-secondary)">
                Today&apos;s Flow
              </p>
              <h2 className="m-0 mt-1 text-2xl font-black text-(--theme-text-primary)">
                RFID Scan Queue
              </h2>
            </div>
            <span
              className="grid h-12 w-12 place-items-center rounded-2xl text-white"
              style={{ background: "var(--gradient-aurora-flow)" }}
            >
              <ShieldCheck size={24} />
            </span>
          </div>

          <div className="mt-6 grid gap-3">
            {[
              ["Tenant Batch", "42 garments checked in", "Ready"],
              ["Wash Cycle", "18 garments processing", "In Progress"],
              ["Dispatch", "27 garments verified", "Completed"],
            ].map(([title, detail, status]) => (
              <div
                className="flex items-center justify-between gap-4 rounded-2xl border p-4"
                key={title}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  borderColor: "var(--theme-border)",
                }}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                    style={{
                      color: "var(--color-aurora-teal)",
                      background: "rgba(20, 184, 166, 0.12)",
                    }}
                  >
                    <Building2 size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="m-0 truncate text-sm font-black text-(--theme-text-primary)">
                      {title}
                    </p>
                    <p className="m-0 mt-1 truncate text-xs font-semibold text-(--theme-text-secondary)">
                      {detail}
                    </p>
                  </div>
                </div>
                <span
                  className="shrink-0 rounded-full px-3 py-1 text-xs font-black"
                  style={{
                    color: "var(--color-aurora-teal)",
                    background: "rgba(20, 184, 166, 0.12)",
                  }}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Index;

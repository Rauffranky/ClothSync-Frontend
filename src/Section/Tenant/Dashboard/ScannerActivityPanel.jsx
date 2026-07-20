import { ArrowRight, Radio } from "lucide-react";
import Badge from "../../../Components/UI/Badge";
import Card from "../../../Components/UI/Card";

const scanners = [
  {
    id: "SCN-ENT-001",
    name: "Main Entrance",
    type: "Fixed · Entry mode",
    location: "Lobby — Floor 1",
    lastSeen: "2 min ago",
    status: "Active",
  },
  {
    id: "SCN-EXT-002",
    name: "Loading Bay Exit",
    type: "Fixed · Exit mode",
    location: "Warehouse — Floor G",
    lastSeen: "7 min ago",
    status: "Active",
  },
  {
    id: "SCN-PRT-003",
    name: "Handheld Unit A",
    type: "Portable · Automatic mode",
    location: "Roaming",
    lastSeen: "18 min ago",
    status: "Active",
  },
  {
    id: "SCN-ENT-004",
    name: "Laundry Room Entry",
    type: "Fixed · Entry mode",
    location: "Laundry — Floor 2",
    lastSeen: "1 hr ago",
    status: "Warning",
  },
];

const statusVariant = {
  Active: "success",
  Warning: "warning",
  Offline: "danger",
};

const ScannerItem = ({ scanner }) => (
  <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[color-mix(in_srgb,var(--color-aurora-teal)_6%,transparent)]">
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
      style={{
        background:
          scanner.status === "Active"
            ? "rgba(20,184,166,0.1)"
            : scanner.status === "Warning"
            ? "rgba(245,158,11,0.1)"
            : "rgba(239,68,68,0.1)",
      }}
    >
      <Radio
        size={17}
        style={{
          color:
            scanner.status === "Active"
              ? "var(--color-aurora-teal)"
              : scanner.status === "Warning"
              ? "var(--color-pending)"
              : "var(--color-overdue)",
        }}
      />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        <span
          className="truncate text-sm font-bold"
          style={{ color: "var(--theme-text-primary)" }}
        >
          {scanner.name}
        </span>
        <span
          className="text-xs font-semibold"
          style={{ color: "var(--theme-text-muted)" }}
        >
          {scanner.id}
        </span>
      </div>
      <p
        className="mt-0.5 text-xs"
        style={{ color: "var(--theme-text-muted)" }}
      >
        {scanner.type} &middot; {scanner.location}
      </p>
    </div>
    <div className="flex shrink-0 flex-col items-end gap-1">
      <span
        className="text-xs"
        style={{ color: "var(--theme-text-muted)" }}
      >
        {scanner.lastSeen}
      </span>
      <Badge variant={statusVariant[scanner.status] || "neutral"} size="sm">
        {scanner.status}
      </Badge>
    </div>
  </div>
);

const ScannerActivityPanel = () => {
  const activeCount = scanners.filter((s) => s.status === "Active").length;
  const warnCount = scanners.filter((s) => s.status === "Warning").length;
  const offlineCount = scanners.filter((s) => s.status === "Offline").length;

  return (
    <Card padding="20px 24px">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2
            className="text-base font-black"
            style={{ color: "var(--theme-text-primary)" }}
          >
            Scanner Activity
          </h2>
          <p
            className="mt-0.5 text-xs"
            style={{ color: "var(--theme-text-muted)" }}
          >
            {scanners.length} scanners registered
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Pill counters */}
          <div className="flex items-center gap-2 rounded-xl border px-2.5 py-1.5" style={{ borderColor: "var(--theme-border-soft)" }}>
            <span className="flex items-center gap-1 text-xs font-bold" style={{ color: "var(--color-seafoam)" }}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {activeCount} active
            </span>
            <span className="text-xs font-bold" style={{ color: "var(--color-pending)" }}>
              {warnCount} warn
            </span>
            <span className="text-xs font-bold" style={{ color: "var(--theme-text-muted)" }}>
              {offlineCount} offline
            </span>
          </div>
          <button
            type="button"
            className="flex items-center gap-1 text-xs font-bold"
            style={{ color: "var(--color-sky-blue)" }}
          >
            View All <ArrowRight size={13} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        {scanners.map((scanner) => (
          <ScannerItem key={scanner.id} scanner={scanner} />
        ))}
      </div>
    </Card>
  );
};

export default ScannerActivityPanel;

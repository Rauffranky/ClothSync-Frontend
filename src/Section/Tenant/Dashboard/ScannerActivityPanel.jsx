import { ArrowRight, Radio } from "lucide-react";
import Badge from "../../../Components/UI/Badge";
import Card from "../../../Components/UI/Card";
import Button from "../../../Components/UI/Button";
import IconWrapper from "../../../Components/UI/IconWrapper";
import { useDashboardData } from "./DashboardContext";
import { formatDateTime } from "../../../Utils/date";

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
  <div className="flex items-center gap-3 rounded-xl py-2.5 transition-colors hover:bg-[color-mix(in_srgb,var(--color-aurora-teal)_6%,transparent)]">
    <IconWrapper
      icon={Radio}
      sizeClassName="h-9 w-9"
      roundedClassName="rounded-xl"
      iconSize={17}
      style={{
        background:
          scanner.status === "Active"
            ? "rgba(20,184,166,0.1)"
            : scanner.status === "Warning"
              ? "rgba(245,158,11,0.1)"
              : "rgba(239,68,68,0.1)",
        color:
          scanner.status === "Active"
            ? "var(--color-aurora-teal)"
            : scanner.status === "Warning"
              ? "var(--color-pending)"
              : "var(--color-overdue)",
      }}
    />
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
  const data = useDashboardData();
  const liveItems = data?.scanners?.items;
  const rows = Array.isArray(liveItems) ? liveItems.map((item) => ({
    id: item.scannerId || item.id,
    name: item.name || item.scannerName || "Unnamed Scanner",
    type: `${item.scannerType || ""} · ${item.scannerMode || ""}`.trim(),
    location: item.location || item.zoneName || "—",
    lastSeen: formatDateTime(item.lastSeenAt || item.lastActivityAt, true, false, "—"),
    status: String(item.status || "inactive").replace(/(^|_)(\w)/g, (_, p, c) => `${p ? " " : ""}${c.toUpperCase()}`),
  })) : scanners;
  const activeCount = rows.filter((s) => s.status === "Active").length;
  const warnCount = rows.filter((s) => s.status === "Warning").length;
  const offlineCount = rows.filter((s) => ["Offline", "Inactive"].includes(s.status)).length;

  return (
    <Card>
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2
            className="font-bold"
            style={{ color: "var(--theme-text-primary)" }}
          >
            Scanner Activity
          </h2>
          <p
            className="mt-0.5 text-xs"
            style={{ color: "var(--theme-text-muted)" }}
          >
            {rows.length} scanners registered
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
          <Button
            rightIcon={<ArrowRight size={14} />}
            variant="link"
            className="text-[12px]!"
            style={{
              minHeight: "auto",
              padding: 0,
              border: "none",
              color: "var(--color-sky-blue)",
            }}
            disableHoverTransform
          >
            View All
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        {rows.map((scanner) => (
          <ScannerItem key={scanner.id} scanner={scanner} />
        ))}
      </div>
    </Card>
  );
};

export default ScannerActivityPanel;

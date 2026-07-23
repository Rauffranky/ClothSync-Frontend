import { ArrowRight, ChevronUp, Clock, Scale, Search, TriangleAlert } from "lucide-react";
import Badge from "../../../Components/UI/Badge";
import Card from "../../../Components/UI/Card";
import IconWrapper from "../../../Components/UI/IconWrapper";
import Button from "../../../Components/UI/Button";

const alerts = [
  {
    id: "not-checked-in",
    Icon: Clock,
    count: 47,
    label: "Not Checked In at Laundry",
    description: "Items dispatched but no check-in scan received",
    severity: "warning",
    severityLabel: "High",
  },
  {
    id: "too-long",
    Icon: TriangleAlert,
    count: 31,
    label: "In Laundry Too Long",
    description: "Exceeding 72-hour expected processing window",
    severity: "danger",
    severityLabel: "Critical",
  },
  {
    id: "return-mismatch",
    Icon: Scale,
    count: 8,
    label: "Return Count Mismatch",
    description: "Returned count differs from dispatched count",
    severity: "warning",
    severityLabel: "High",
  },
  {
    id: "suspected-lost",
    Icon: Search,
    count: 11,
    label: "Suspected Lost Items",
    description: "No scan activity in over 14 days",
    severity: "danger",
    severityLabel: "Critical",
  },
];

const AlertCard = ({ alert }) => {
  const { Icon, count, label, description, severity, severityLabel } = alert;
  const iconColor =
    severity === "danger" ? "var(--color-overdue)" : "var(--color-pending)";
  const iconBg =
    severity === "danger"
      ? "rgba(239,68,68,0.1)"
      : "rgba(245,158,11,0.1)";

  return (
    <div
      className="flex flex-1 flex-col gap-3 rounded-xl p-4"
      style={{
        background: "var(--theme-surface-strong)",
        border: "1px solid var(--theme-border-soft)",
        minWidth: "140px",
      }}
    >
      <IconWrapper
        icon={Icon}
        style={{ background: iconBg, color: iconColor }}
      />
      <div>
        <p
          className="text-2xl font-black leading-none"
          style={{ color: iconColor }}
        >
          {count}
        </p>
        <p
          className="mt-1 text-sm font-bold leading-snug"
          style={{ color: "var(--theme-text-primary)" }}
        >
          {label}
        </p>
        <p
          className="mt-0.5 text-xs leading-snug"
          style={{ color: "var(--theme-text-muted)" }}
        >
          {description}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={severity === "danger" ? "danger" : "warning"} size="sm">
          {severityLabel}
        </Badge>
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
          View
        </Button>
      </div>
    </div>
  );
};

const totalAlerts = alerts.reduce((s, a) => s + a.count, 0);

const InventoryAlerts = () => (
  <Card>
    {/* Header */}
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2
          className="font-bold"
          style={{ color: "var(--theme-text-primary)" }}
        >
          Inventory Alerts
        </h2>
        <p
          className="mt-0.5 text-xs"
          style={{ color: "var(--theme-text-muted)" }}
        >
          Operational issues requiring attention
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="rounded-full px-3 py-1 text-xs font-bold"
          style={{
            background: "rgba(239,68,68,0.1)",
            color: "var(--color-overdue)",
          }}
        >
          {totalAlerts} total items
        </span>
        <ChevronUp size={16} style={{ color: "var(--theme-text-muted)" }} />
      </div>
    </div>

    {/* Alert cards */}
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {alerts.map((alert) => (
        <AlertCard key={alert.id} alert={alert} />
      ))}
    </div>
  </Card>
);

export default InventoryAlerts;

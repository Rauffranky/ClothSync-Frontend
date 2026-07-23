import {
  ArrowLeftRight,
  Box,
  Building2,
  Clock,
  RotateCcw,
  RotateCw,
  TriangleAlert,
  WashingMachine,
} from "lucide-react";
import Card from "../../../Components/UI/Card";
import IconWrapper from "../../../Components/UI/IconWrapper";

const stats = [
  {
    id: "total-assets",
    label: "Total Assets",
    subLabel: "across all categories",
    value: "1,248",
    Icon: Box,
    color: "var(--color-sky-blue)",
    bgColor: "rgba(96,165,250,0.1)",
  },
  {
    id: "at-facility",
    label: "At Facility",
    subLabel: "on-premises assets",
    value: "437",
    Icon: Building2,
    color: "var(--color-seafoam)",
    bgColor: "rgba(52,211,153,0.1)",
  },
  {
    id: "sent-to-laundry",
    label: "Sent to Laundry",
    subLabel: "dispatched, on the way",
    value: "312",
    Icon: ArrowLeftRight,
    color: "var(--color-aurora-teal)",
    bgColor: "rgba(20,184,166,0.1)",
  },
  {
    id: "in-laundry",
    label: "In Laundry",
    subLabel: "currently in laundry process",
    value: "289",
    Icon: WashingMachine,
    color: "var(--color-super-admin-light)",
    bgColor: "rgba(167,139,250,0.1)",
  },
  {
    id: "returning",
    label: "Returning to Facility",
    subLabel: "dispatched from laundry",
    value: "156",
    Icon: RotateCcw,
    color: "var(--color-seafoam)",
    bgColor: "rgba(52,211,153,0.1)",
  },
  {
    id: "returned",
    label: "Returned to Facility",
    subLabel: "received",
    value: "42",
    Icon: RotateCw,
    color: "var(--color-sky-blue)",
    bgColor: "rgba(96,165,250,0.1)",
  },
  {
    id: "delayed",
    label: "Delayed Items",
    subLabel: "past expected return",
    value: "31",
    Icon: Clock,
    color: "var(--color-pending)",
    bgColor: "rgba(245,158,11,0.1)",
  },
  {
    id: "missing",
    label: "Missing / Lost",
    subLabel: "flagged exceptions",
    value: "11",
    Icon: TriangleAlert,
    color: "var(--color-overdue)",
    bgColor: "rgba(239,68,68,0.1)",
  },
];

const StatCard = ({ stat }) => {
  const { Icon, label, subLabel, value, color, bgColor } = stat;
  return (
    <Card padding="18px 20px">
      <div className="flex flex-col gap-3">
        <IconWrapper
          icon={Icon}
          sizeClassName="h-10 w-10"
          roundedClassName="rounded-xl"
          iconSize={20}
          style={{ background: bgColor, color }}
        />
        <div>
          <p
            className="text-2xl font-bold"
            style={{ color: "var(--theme-text-primary)" }}
          >
            {value}
          </p>
          <p
            className="mt-1 text-sm font-bold"
            style={{ color: "var(--theme-text-primary)" }}
          >
            {label}
          </p>
          <p
            className="mt-0.5 text-xs"
            style={{ color: "var(--theme-text-muted)" }}
          >
            {subLabel}
          </p>
        </div>
      </div>
    </Card>
  );
};

const StatsGrid = () => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
    {stats.map((stat) => (
      <StatCard key={stat.id} stat={stat} />
    ))}
  </div>
);

export default StatsGrid;

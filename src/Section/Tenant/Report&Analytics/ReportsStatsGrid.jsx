import {
  AlertTriangle,
  ArrowLeftRight,
  Clock,
  Package,
  RefreshCcw,
  WashingMachine,
} from "lucide-react";
import Card from "../../../Components/UI/Card";

const stats = [
  {
    id: "sent",
    label: "Total Items Sent",
    value: "1,621",
    sub: "Last 30 days",
    change: "+8%",
    positive: true,
    Icon: ArrowLeftRight,
    color: "var(--color-sky-blue)",
  },
  {
    id: "returned",
    label: "Total Returned",
    value: "1,168",
    sub: "Last 30 days",
    change: "+5%",
    positive: true,
    Icon: RefreshCcw,
    color: "var(--color-seafoam)",
  },
  {
    id: "delayed",
    label: "Delayed Items",
    value: "31",
    sub: "Last 30 days",
    change: "+3",
    positive: false,
    Icon: Clock,
    color: "var(--color-pending)",
  },
  {
    id: "missing",
    label: "Missing / Lost",
    value: "11",
    sub: "Last 30 days",
    change: "+2",
    positive: false,
    Icon: AlertTriangle,
    color: "var(--color-overdue)",
  },
  {
    id: "turnaround",
    label: "Avg. Turnaround",
    value: "28h",
    sub: "Last 30 days",
    change: "-1h",
    positive: true,
    Icon: Package,
    color: "var(--color-aurora-teal)",
  },
  {
    id: "wash",
    label: "Total Wash Cycles",
    value: "1,177",
    sub: "Last 30 days",
    change: "+47",
    positive: true,
    Icon: WashingMachine,
    color: "var(--color-super-admin-light)",
  },
];

const StatCard = ({ stat }) => (
  <Card padding="16px 20px">
    <div className="flex items-start justify-between gap-2">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${stat.color}18` }}
      >
        <stat.Icon size={17} style={{ color: stat.color }} />
      </div>
      <span
        className="rounded-full px-2 py-0.5 text-xs font-bold"
        style={{
          background: stat.positive ? "rgba(20,184,166,0.1)" : "rgba(239,68,68,0.1)",
          color: stat.positive ? "var(--color-aurora-teal)" : "var(--color-overdue)",
        }}
      >
        {stat.change}
      </span>
    </div>
    <p
      className="mt-3 text-2xl font-black leading-none"
      style={{ color: "var(--theme-text-primary)" }}
    >
      {stat.value}
    </p>
    <p
      className="mt-1 text-sm font-semibold"
      style={{ color: "var(--theme-text-secondary)" }}
    >
      {stat.label}
    </p>
    <p className="mt-0.5 text-xs" style={{ color: "var(--theme-text-muted)" }}>
      {stat.sub}
    </p>
  </Card>
);

const ReportsStatsGrid = () => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
    {stats.map((stat) => (
      <StatCard key={stat.id} stat={stat} />
    ))}
  </div>
);

export default ReportsStatsGrid;

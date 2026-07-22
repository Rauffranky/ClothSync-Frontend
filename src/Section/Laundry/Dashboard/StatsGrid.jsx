import { Box, Clock, LogIn, ScanLine, Truck } from "lucide-react";
import Card from "../../../Components/UI/Card";

const stats = [
  {
    id: "incoming-batches",
    label: "Incoming Batches",
    value: "6",
    trend: "+2 today",
    trendColor: "var(--color-seafoam)",
    Icon: Truck,
    color: "var(--color-sky-blue)",
    bgColor: "rgba(96,165,250,0.1)",
  },
  {
    id: "awaiting-checkin",
    label: "Awaiting Check-In",
    value: "386",
    trend: "+44 today",
    trendColor: "var(--color-seafoam)",
    Icon: LogIn,
    color: "var(--color-super-admin-light)",
    bgColor: "rgba(167,139,250,0.1)",
  },
  {
    id: "items-in-laundry",
    label: "Items In Laundry",
    value: "1,003",
    trend: "-18 today",
    trendColor: "var(--color-pending)",
    Icon: Box,
    color: "var(--color-super-admin-light)",
    bgColor: "rgba(167,139,250,0.1)",
  },
  {
    id: "sent-to-business",
    label: "Sent to Business",
    value: "388",
    trend: "+61 today",
    trendColor: "var(--color-seafoam)",
    Icon: Box,
    color: "var(--color-seafoam)",
    bgColor: "rgba(52,211,153,0.1)",
  },
  {
    id: "delayed-items",
    label: "Delayed Items",
    value: "36",
    trend: "+6 today",
    trendColor: "var(--color-pending)",
    Icon: Clock,
    color: "var(--color-pending)",
    bgColor: "rgba(245,158,11,0.1)",
  },
  {
    id: "active-scanners",
    label: "Active Scanners",
    value: "3",
    trend: "5 total today",
    trendColor: "var(--color-seafoam)",
    Icon: ScanLine,
    color: "var(--theme-text-primary)",
    bgColor: "rgba(100,116,139,0.1)",
  },
];

const StatCard = ({ stat }) => {
  const { Icon, label, value, trend, trendColor, color, bgColor } = stat;
  return (
    <Card padding="18px 20px">
      <div className="flex flex-col gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: bgColor }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        <div>
          <p
            className="text-3xl font-black leading-none tracking-tight"
            style={{ color: color }}
          >
            {value}
          </p>
          <p
            className="mt-2 text-sm font-bold"
            style={{ color: "var(--theme-text-primary)" }}
          >
            {label}
          </p>
          <p
            className="mt-0.5 text-xs font-semibold"
            style={{ color: trendColor }}
          >
            {trend}
          </p>
        </div>
      </div>
    </Card>
  );
};

const StatsGrid = () => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
    {stats.map((stat) => (
      <StatCard key={stat.id} stat={stat} />
    ))}
  </div>
);

export default StatsGrid;

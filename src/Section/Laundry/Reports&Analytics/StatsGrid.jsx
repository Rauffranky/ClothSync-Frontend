import {
  AlertCircle,
  Box,
  CheckCircle,
  Clock,
  LogIn,
  LogOut,
  Timer,
} from "lucide-react";
import Card from "../../../Components/UI/Card";

const stats = [
  {
    id: "checked-in",
    label: "Checked In",
    value: "1,199",
    trend: "+89 today",
    icon: LogIn,
    iconColor: "text-(--color-sky-blue)",
    iconBg: "bg-[color-mix(in_srgb,var(--color-sky-blue)_15%,transparent)]",
  },
  {
    id: "checked-out",
    label: "Checked Out",
    value: "888",
    trend: "+68 today",
    icon: LogOut,
    iconColor: "text-[var(--color-aurora-purple)]",
    iconBg: "bg-[color-mix(in_srgb,var(--color-aurora-purple)_15%,transparent)]",
  },
  {
    id: "in-laundry",
    label: "In Laundry",
    value: "1,003",
    trend: "Currently",
    icon: Box,
    iconColor: "text-[var(--color-aurora-purple)]",
    iconBg: "bg-[color-mix(in_srgb,var(--color-aurora-purple)_15%,transparent)]",
  },
  {
    id: "processed",
    label: "Processed",
    value: "561",
    trend: "+93 today",
    icon: CheckCircle,
    iconColor: "text-(--color-aurora-teal)",
    iconBg: "bg-[color-mix(in_srgb,var(--color-aurora-teal)_15%,transparent)]",
  },
  {
    id: "ready",
    label: "Ready for Return",
    value: "388",
    trend: "Pending",
    icon: Box,
    iconColor: "text-(--color-aurora-teal)",
    iconBg: "bg-[color-mix(in_srgb,var(--color-aurora-teal)_15%,transparent)]",
  },
  {
    id: "delayed",
    label: "Delayed Items",
    value: "36",
    trend: "+6 today",
    icon: Clock,
    iconColor: "text-[var(--color-sunset-orange)]",
    iconBg: "bg-[color-mix(in_srgb,var(--color-sunset-orange)_15%,transparent)]",
  },
  {
    id: "exceptions",
    label: "Open Exceptions",
    value: "12",
    trend: "Unresolved",
    icon: AlertCircle,
    iconColor: "text-[var(--color-sunset-orange)]",
    iconBg: "bg-[color-mix(in_srgb,var(--color-sunset-orange)_15%,transparent)]",
  },
  {
    id: "turnaround",
    label: "Avg Turnaround",
    value: "31 hrs",
    trend: "All biz",
    icon: Timer,
    iconColor: "text-(--theme-text-secondary)",
    iconBg: "bg-[color-mix(in_srgb,var(--theme-text-muted)_15%,transparent)]",
  },
];

const StatsGrid = () => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.id} padding="20px" className="flex flex-col gap-4">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconBg}`}
            >
              <Icon size={20} className={stat.iconColor} />
            </div>

            <div>
              <div className="text-2xl font-black text-(--theme-text-primary)">
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-(--theme-text-secondary)">
                {stat.label}
              </div>
              <div className="mt-1 text-xs text-(--theme-text-muted)">
                {stat.trend}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsGrid;

import {
  Building2,
  Clock,
  Cuboid,
  Hourglass,
  RefreshCw,
  Star,
} from "lucide-react";
import Card from "../../../Components/UI/Card";

const stats = [
  {
    value: "6",
    label: "Total Linked",
    helper: "laundry partners",
    icon: Building2,
    color: "var(--color-sky-blue)",
  },
  {
    value: "1",
    label: "Default Laundry",
    helper: "PureWash Industrial",
    icon: Star,
    color: "var(--color-pending)",
  },
  {
    value: "2",
    label: "Pending Requests",
    helper: "awaiting confirmation",
    icon: Hourglass,
    color: "var(--color-maintenance)",
  },
  {
    value: "6",
    label: "Active Dispatches",
    helper: "across all laundries",
    icon: RefreshCw,
    color: "var(--color-super-admin-light)",
  },
  {
    value: "382",
    label: "Items Currently Sent",
    helper: "in transit or processing",
    icon: Cuboid,
    color: "var(--color-ready)",
  },
  {
    value: "9",
    label: "Delayed Items",
    helper: "past expected return",
    icon: Clock,
    color: "var(--color-overdue)",
  },
];

const Stats = () => {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <Card
            key={item.label}
          >
            <span
              className="grid h-9 w-9 place-items-center rounded-lg"
              style={{
                color: item.color,
                background: `color-mix(in srgb, ${item.color} 14%, transparent)`,
              }}
            >
              <Icon size={18} strokeWidth={2.2} />
            </span>

            <p className="m-0 mt-4 text-3xl font-black leading-none text-(--theme-text-primary)">
              {item.value}
            </p>
            <p className="m-0 mt-2 text-sm font-medium leading-5 text-(--theme-text-primary)">
              {item.label}
            </p>
            <p className="m-0 mt-1 text-xs font-semibold leading-5 text-(--theme-text-muted)">
              {item.helper}
            </p>
          </Card>
        );
      })}
    </section>
  );
};

export default Stats;

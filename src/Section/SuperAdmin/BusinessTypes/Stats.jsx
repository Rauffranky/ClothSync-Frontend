import {
  Tag,
  CircleCheck,
  CircleX,
  Layers,
} from "lucide-react";
import Card from "../../../Components/UI/Card";
import CardSkeleton from "../../../Components/UI/CardSkeleton";

const summaryStats = [
  {
    key: "total",
    label: "Total Types",
    helper: "all defined business categories",
    icon: Tag,
    color: "var(--color-aurora-teal)",
  },
  {
    key: "active",
    label: "Active Types",
    helper: "available in registration dropdowns",
    icon: CircleCheck,
    color: "var(--color-ready)",
  },
  {
    key: "inactive",
    label: "Inactive Types",
    helper: "hidden from registration",
    icon: CircleX,
    color: "var(--color-overdue)",
  },
  {
    key: "pageCount",
    label: "Current View",
    helper: "loaded on this page",
    icon: Layers,
    color: "var(--color-sky-blue)",
  },
];

const Stats = ({ loading = false, summary = null, pageCount = 0 }) => {
  if (loading) {
    return (
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((item) => (
          <CardSkeleton key={item.key} lines={3} />
        ))}
      </section>
    );
  }

  const values = {
    ...summary,
    pageCount,
  };

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {summaryStats.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.key}>
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
              {values[item.key] ?? "—"}
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

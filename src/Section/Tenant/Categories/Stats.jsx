import {
  ChartBarStacked,
  Cuboid,
  CircleX,
  CircleCheck,
} from "lucide-react";
import Card from "../../../Components/UI/Card";
import CardSkeleton from "../../../Components/UI/CardSkeleton";

const summaryStats = [
  {
    key: "totalCategories",
    label: "Total Categories",
    helper: "all defined categories",
    icon: ChartBarStacked,
    color: "var(--color-sky-blue)",
  },
  {
    key: "activeCategories",
    label: "Active Categories",
    helper: "currently in use",
    icon: CircleCheck,
    color: "var(--color-ready)",
  },
  {
    key: "inactiveCategories",
    label: "Inactive Categories",
    helper: "disabled",
    icon: CircleX,
    color: "var(--color-overdue)",
  },
  {
    key: "categoriesInUse",
    label: "Categories in Use",
    helper: "across all laundries",
    icon: Cuboid,
    color: "var(--color-super-admin-light)",
  },
];

const Stats = ({ loading = false, summary = null }) => {
  if (loading) {
    return (
      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((item) => (
          <CardSkeleton key={item.key} lines={3} />
        ))}
      </section>
    );
  }

  return (
    <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
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
              {summary?.[item.key] ?? "—"}
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

import {
  ChartBarStacked,
  Cuboid,
  CircleX,
  CircleCheck,
} from "lucide-react";
import Card from "../../../Components/UI/Card";

const stats = [
  {
    value: "6",
    label: "Total Categories",
    helper: "all defined categories",
    icon: ChartBarStacked,
    color: "var(--color-sky-blue)",
  },
  {
    value: "1",
    label: "Active Categories",
    helper: "currently in use",
    icon: CircleCheck,
    color: "var(--color-ready)",
  },
  {
    value: "2",
    label: "Inactive Categories",
    helper: "disabled",
    icon: CircleX,
    color: "var(--color-overdue)",
  },
  {
    value: "6",
    label: "Categories in Use",
    helper: "across all laundries",
    icon: Cuboid,
    color: "var(--color-super-admin-light)",
  },
];

const Stats = () => {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

import {
  Building2,
  Clock,
  Cuboid,
  Hourglass,
  RefreshCw,
  } from "lucide-react";
import Card from "../../../Components/UI/Card";
import IconWrapper from "../../../Components/UI/IconWrapper";

const stats = [
  {
    value: "6",
    label: "Total Linked",
    helper: "laundry partners",
    icon: Building2,
    variant: "info",
  },
  {
    value: "2",
    label: "Pending Requests",
    helper: "awaiting confirmation",
    icon: Hourglass,
    variant: "warning",
  },
  {
    value: "6",
    label: "Active Dispatches",
    helper: "across all laundries",
    icon: RefreshCw,
    variant: "purple",
  },
  {
    value: "382",
    label: "Items Currently Sent",
    helper: "in transit or processing",
    icon: Cuboid,
    variant: "success",
  },
  {
    value: "9",
    label: "Delayed Items",
    helper: "past expected return",
    icon: Clock,
    variant: "danger",
  },
];

const Stats = ({ linkedTotal, pendingTotal }) => {
  const displayStats = stats.map((item) => {
    if (item.label === "Total Linked") {
      return { ...item, value: linkedTotal ?? "-" };
    }
    if (item.label === "Pending Requests") {
      return { ...item, value: pendingTotal ?? "-" };
    }
    return item;
  });

  return (
    <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      {displayStats.map((item) => {
        const Icon = item.icon;

        return (
          <Card
            key={item.label}
          >
            <IconWrapper icon={Icon} variant={item.variant} />

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

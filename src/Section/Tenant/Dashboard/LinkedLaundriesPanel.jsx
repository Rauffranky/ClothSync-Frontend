import { ArrowRight, Star, WashingMachine } from "lucide-react";
import Badge from "../../../Components/UI/Badge";
import Card from "../../../Components/UI/Card";

const laundries = [
  {
    id: 1,
    name: "PureWash Industrial",
    itemsSent: 229,
    status: "Linked",
    isDefault: true,
  },
  {
    id: 2,
    name: "CleanFlow Solutions",
    itemsSent: 88,
    status: "Linked",
    isDefault: false,
  },
  {
    id: 3,
    name: "Metro Linen Services",
    itemsSent: 65,
    status: "Linked",
    isDefault: false,
  },
  {
    id: 4,
    name: "FreshStart Laundry",
    itemsSent: 0,
    status: "Unlinked",
    isDefault: false,
  },
];

const LaundryItem = ({ item }) => (
  <div
    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[color-mix(in_srgb,var(--color-aurora-teal)_6%,transparent)]"
  >
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
      style={{
        background:
          item.status === "Linked"
            ? "rgba(20,184,166,0.1)"
            : "rgba(148,163,184,0.1)",
      }}
    >
      <WashingMachine
        size={17}
        style={{
          color:
            item.status === "Linked"
              ? "var(--color-aurora-teal)"
              : "var(--color-blue-gray)",
        }}
      />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        <span
          className="truncate text-sm font-bold"
          style={{ color: "var(--theme-text-primary)" }}
        >
          {item.name}
        </span>
        {item.isDefault && (
          <Badge variant="warning" size="sm">
            <Star size={9} className="mr-0.5 inline" />
            Default
          </Badge>
        )}
      </div>
      <p
        className="mt-0.5 text-xs"
        style={{ color: "var(--theme-text-muted)" }}
      >
        {item.itemsSent > 0 ? `${item.itemsSent} items sent` : "No items sent"}
      </p>
    </div>
    <Badge
      variant={item.status === "Linked" ? "success" : "overdue"}
      size="sm"
    >
      {item.status}
    </Badge>
  </div>
);

const LinkedLaundriesPanel = () => (
  <Card padding="20px 24px">
    <div className="mb-3 flex items-start justify-between gap-3">
      <div>
        <h2
          className="text-base font-black"
          style={{ color: "var(--theme-text-primary)" }}
        >
          Linked Laundries
        </h2>
        <p
          className="mt-0.5 text-xs"
          style={{ color: "var(--theme-text-muted)" }}
        >
          {laundries.filter((l) => l.status === "Linked").length} connected
          partners
        </p>
      </div>
      <button
        type="button"
        className="flex items-center gap-1 text-xs font-bold"
        style={{ color: "var(--color-sky-blue)" }}
      >
        View All <ArrowRight size={13} />
      </button>
    </div>
    <div className="flex flex-col gap-0.5">
      {laundries.map((item) => (
        <LaundryItem key={item.id} item={item} />
      ))}
    </div>
  </Card>
);

export default LinkedLaundriesPanel;

import { ArrowRight, MoreHorizontal } from "lucide-react";
import Badge from "../../../Components/UI/Badge";
import Card from "../../../Components/UI/Card";
import Table from "../../../Components/UI/Table";
import Button from "../../../Components/UI/Button";

const dispatches = [
  {
    id: "BTH-20240611-001",
    laundry: "PureWash Industrial",
    date: "Jun 11, 2025",
    total: 142,
    status: "In Laundry",
    missing: null,
  },
  {
    id: "BTH-20240609-017",
    laundry: "CleanFlow Solutions",
    date: "Jun 9, 2025",
    total: 87,
    status: "Sent To Business",
    missing: 1,
  },
  {
    id: "BTH-20240607-009",
    laundry: "PureWash Industrial",
    date: "Jun 7, 2025",
    total: 210,
    status: "Sent To Laundry",
    missing: 2,
  },
  {
    id: "BTH-20240603-022",
    laundry: "Metro Linen Services",
    date: "Jun 3, 2025",
    total: 65,
    status: "Returned",
    missing: null,
  },
];

const statusVariant = {
  "In Laundry": "purple",
  "Sent To Business": "progress",
  "Sent To Laundry": "pending",
  Returned: "completed",
};

const columns = [
  {
    key: "id",
    label: "Batch ID",
    render: (value) => (
      <span
        className="cursor-pointer text-xs font-bold"
        style={{ color: "var(--color-sky-blue)" }}
      >
        {value}
      </span>
    ),
  },
  {
    key: "laundry",
    label: "Laundry Company",
    render: (value) => (
      <span className="text-sm font-semibold">{value}</span>
    ),
  },
  { key: "date", label: "Dispatch Date" },
  {
    key: "total",
    label: "Total Items",
    render: (value) => (
      <span className="font-black">{value}</span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (value) => (
      <Badge variant={statusVariant[value] || "neutral"} size="sm">
        {value}
      </Badge>
    ),
  },
  {
    key: "missing",
    label: "Missing",
    render: (value) =>
      value ? (
        <span className="font-bold" style={{ color: "var(--color-overdue)" }}>
          {value}
        </span>
      ) : (
        <span style={{ color: "var(--theme-text-muted)" }}>—</span>
      ),
  },
];

const ActiveDispatchTable = () => (
  <Card padding="20px 24px">
    {/* Header */}
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2
          className="font-bold"
          style={{ color: "var(--theme-text-primary)" }}
        >
          Active Dispatch Items
        </h2>
        <p
          className="mt-0.5 text-xs"
          style={{ color: "var(--theme-text-muted)" }}
        >
          15 batches in the last 14 days
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-[30px]! px-3! text-xs!"
        rightIcon={<ArrowRight size={14} />}
      >
        View All
      </Button>
    </div>

    <Table
      columns={columns}
      data={dispatches}
      rowKey="id"
      compact
      actions={(row) => (
        <button
          type="button"
          aria-label={`Actions for ${row.id}`}
          className="rounded-lg border p-1.5 transition-colors hover:bg-[color-mix(in_srgb,var(--color-aurora-teal)_10%,transparent)]"
          style={{ borderColor: "var(--theme-border-soft)" }}
        >
          <MoreHorizontal size={15} style={{ color: "var(--theme-text-muted)" }} />
        </button>
      )}
    />
  </Card>
);

export default ActiveDispatchTable;

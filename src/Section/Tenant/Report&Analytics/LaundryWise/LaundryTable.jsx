import { Building2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../../../Components/UI/Button";
import ProgressBar from "../../../../Components/UI/ProgressBar";
import Table from "../../../../Components/UI/Table";
import { laundryRows } from "./data";

const metric = (color, empty = false) => (value) => (
  <span className="font-bold" style={{ color: value ? color : undefined }}>
    {empty && !value ? "—" : value}
  </span>
);

const columns = [
  {
    key: "laundry",
    label: "Laundry Partner",
    render: (value) => (
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-(--button-ghost-bg) text-(--color-sky-blue)">
          <Building2 aria-hidden="true" size={14} />
        </span>
        <span className="font-black text-(--theme-text-primary)">{value}</span>
      </div>
    ),
  },
  {
    key: "sent",
    label: "Total Sent",
    render: metric("var(--color-sky-blue)"),
  },
  {
    key: "returned",
    label: "Total Returned",
    render: metric("var(--color-seafoam)"),
  },
  {
    key: "delayed",
    label: "Delayed",
    render: metric("var(--color-pending)", true),
  },
  {
    key: "missing",
    label: "Missing/Lost",
    render: metric("var(--color-overdue)", true),
  },
  {
    key: "returnRate",
    label: "Return Rate",
    render: (value) => {
      const color = value >= 80 ? "var(--color-seafoam)" : "var(--color-overdue)";

      return (
        <div className="flex min-w-28 items-center gap-2">
          <span className="w-8 text-right font-black" style={{ color }}>
            {value}%
          </span>
          <ProgressBar
            className="max-w-20"
            color={color}
            heightClass="h-1.5"
            value={value}
          />
        </div>
      );
    },
  },
  {
    align: "right",
    key: "action",
    label: "Actions",
    sortable: false,
    render: (_, row) => (
      <Button
        aria-label={`View ${row.laundry} in linked laundries`}
        as={Link}
        leftIcon={<Eye aria-hidden="true" size={13} />}
        size={{ minHeight: 32, padding: "0 10px", fontSize: "0.75rem" }}
        to="/business/linked-laundries"
        variant="outline"
      >
        View
      </Button>
    ),
  },
];

const LaundryTable = () => (
  <Table
    columns={columns}
    compact
    data={laundryRows}
    emptyText="No laundry partner data found"
    rowKey="id"
  />
);

export default LaundryTable;

import Badge from "../../../../Components/UI/Badge";
import ProgressBar from "../../../../Components/UI/ProgressBar";
import Table from "../../../../Components/UI/Table";
import { categoryRows } from "./data";

const count = (color, empty = false) => (value) => (
  <span className="font-bold" style={{ color: value ? color : undefined }}>
    {empty && !value ? "—" : value}
  </span>
);

const columns = [
  {
    key: "category",
    label: "Category",
    render: (value) => (
      <Badge size="sm" variant="info">
        {value}
      </Badge>
    ),
  },
  { key: "totalAssets", label: "Total Assets" },
  {
    key: "sent",
    label: "Sent",
    render: count("var(--color-sky-blue)"),
  },
  {
    key: "returned",
    label: "Returned",
    render: count("var(--color-seafoam)"),
  },
  {
    key: "delayed",
    label: "Delayed",
    render: count("var(--color-pending)", true),
  },
  {
    key: "missing",
    label: "Missing",
    render: count("var(--color-overdue)", true),
  },
  {
    key: "returnRate",
    label: "Return Rate",
    render: (value) => (
      <div className="flex min-w-28 items-center gap-2">
        <span className="w-8 text-right font-black text-(--theme-text-primary)">
          {value}%
        </span>
        <ProgressBar
          className="max-w-20"
          color="var(--color-seafoam)"
          heightClass="h-1.5"
          value={value}
        />
      </div>
    ),
  },
  { key: "averageWashes", label: "Avg Washes" },
];

const CategoryTable = () => (
  <Table
    columns={columns}
    compact
    data={categoryRows}
    emptyText="No category performance data found"
    rowKey="id"
  />
);

export default CategoryTable;

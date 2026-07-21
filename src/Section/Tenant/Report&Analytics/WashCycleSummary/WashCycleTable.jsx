import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "../../../../Components/UI/Badge";
import Button from "../../../../Components/UI/Button";
import ProgressBar from "../../../../Components/UI/ProgressBar";
import Table from "../../../../Components/UI/Table";
import { washCycleRows } from "./data";

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
  {
    key: "totalAssets",
    label: "Total Assets",
    render: (value) => (
      <span className="font-black text-(--theme-text-primary)">{value}</span>
    ),
  },
  {
    key: "totalWashes",
    label: "Total Washes",
    render: (value) => (
      <span className="font-black text-(--color-sky-blue)">{value}</span>
    ),
  },
  { key: "averageWashes", label: "Avg Washes / Asset" },
  {
    key: "maxWashLimit",
    label: "Max Wash Limit",
    render: (value) => (
      <span className="font-mono text-xs font-semibold text-(--theme-text-muted)">
        {value}
      </span>
    ),
  },
  {
    key: "nearRetirement",
    label: "Near Retirement",
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
  {
    align: "right",
    key: "action",
    label: "Actions",
    sortable: false,
    render: (_, row) => (
      <Button
        aria-label={`View ${row.category} categories`}
        as={Link}
        leftIcon={<Eye aria-hidden="true" size={13} />}
        size={{ minHeight: 32, padding: "0 10px", fontSize: "0.75rem" }}
        to="/business/categories"
        variant="outline"
      >
        View
      </Button>
    ),
  },
];

const WashCycleTable = () => (
  <Table
    columns={columns}
    compact
    data={washCycleRows}
    emptyText="No wash-cycle data found"
    rowKey="id"
  />
);

export default WashCycleTable;

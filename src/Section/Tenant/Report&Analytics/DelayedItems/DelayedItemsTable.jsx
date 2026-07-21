import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "../../../../Components/UI/Badge";
import Button from "../../../../Components/UI/Button";
import Table from "../../../../Components/UI/Table";
import { delayedAssets } from "./data";

const columns = [
  {
    key: "id",
    label: "Asset ID",
    render: (value) => (
      <span className="font-mono text-xs font-black text-(--color-sky-blue)">
        {value}
      </span>
    ),
  },
  {
    key: "name",
    label: "Asset Name",
    render: (value) => (
      <span className="font-bold text-(--theme-text-primary)">{value}</span>
    ),
  },
  {
    key: "category",
    label: "Category",
    render: (value, row) => (
      <Badge size="sm" variant={row.categoryVariant}>
        {value}
      </Badge>
    ),
  },
  { key: "laundry", label: "Laundry" },
  {
    key: "batchId",
    label: "Batch ID",
    render: (value) => (
      <span className="font-mono text-xs font-bold text-(--badge-purple-text)">
        {value}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: false,
    render: () => (
      <Badge size="sm" variant="warning">
        Delayed
      </Badge>
    ),
  },
  {
    key: "daysDelayed",
    label: "Days Delayed",
    render: (value, row) => (
      <div className="flex items-center gap-2">
        <span className="font-black text-(--color-overdue)">{value}d</span>
        {row.critical && (
          <span className="text-[10px] font-black uppercase tracking-wide text-(--color-overdue)">
            Critical
          </span>
        )}
      </div>
    ),
  },
  {
    key: "lastScannedDate",
    label: "Last Scanned",
    render: (_, row) => (
      <span className="font-mono text-xs font-semibold text-(--theme-text-secondary)">
        {row.lastScannedDate}, {row.lastScannedTime}
      </span>
    ),
  },
  {
    key: "action",
    label: "Action",
    align: "right",
    sortable: false,
    render: (_, row) => (
      <Button
        as={Link}
        leftIcon={<Eye aria-hidden="true" size={13} />}
        size={{ minHeight: 32, padding: "0 10px", fontSize: "0.75rem" }}
        to={`/business/assets/${row.id}`}
        variant="outline"
      >
        View Asset
      </Button>
    ),
  },
];

const DelayedItemsTable = () => (
  <section aria-labelledby="delayed-assets-title">
    <h2 className="sr-only" id="delayed-assets-title">
      Delayed assets
    </h2>
    <Table
      columns={columns}
      compact
      data={delayedAssets}
      emptyText="No delayed assets found"
      rowKey="id"
    />
  </section>
);

export default DelayedItemsTable;

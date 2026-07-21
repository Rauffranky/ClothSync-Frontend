import { ScanEye } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "../../../../Components/UI/Badge";
import Button from "../../../../Components/UI/Button";
import Table from "../../../../Components/UI/Table";
import { missingAssets } from "./data";

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
    key: "tagEpc",
    label: "Tag EPC",
    render: (value) => (
      <span className="font-mono text-[11px] font-semibold text-(--theme-text-muted)">
        {value}
      </span>
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
  { key: "lastLocation", label: "Last Known Location" },
  {
    key: "lastScanDate",
    label: "Last Scan",
    render: (_, row) => (
      <span className="font-mono text-xs font-semibold text-(--theme-text-secondary)">
        {row.lastScanDate}, {row.lastScanTime}
      </span>
    ),
  },
  {
    key: "batchId",
    label: "Related Batch",
    render: (value) => (
      <span className="font-mono text-xs font-bold text-(--badge-purple-text)">
        {value}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (value, row) => (
      <Badge size="sm" variant={row.statusVariant}>
        {value}
      </Badge>
    ),
  },
  {
    align: "right",
    key: "action",
    label: "Action",
    sortable: false,
    render: (_, row) => (
      <Button
        as={Link}
        leftIcon={<ScanEye aria-hidden="true" size={13} />}
        size={{ minHeight: 32, padding: "0 10px", fontSize: "0.75rem" }}
        to={`/business/assets/${row.id}`}
        variant="outline"
      >
        Review
      </Button>
    ),
  },
];

const MissingLostTable = () => (
  <section aria-labelledby="missing-assets-title">
    <h2 className="sr-only" id="missing-assets-title">
      Missing and lost assets
    </h2>
    <Table
      columns={columns}
      compact
      data={missingAssets}
      emptyText="No missing or lost assets found"
      rowKey="id"
    />
  </section>
);

export default MissingLostTable;

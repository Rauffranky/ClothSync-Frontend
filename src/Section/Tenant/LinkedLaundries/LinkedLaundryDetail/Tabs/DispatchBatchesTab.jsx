import { Eye } from "lucide-react";
import Table from "../../../../../Components/UI/Table";
import Badge from "../../../../../Components/UI/Badge";
import Button from "../../../../../Components/UI/Button";
import { dispatchBatches } from "../data";

const columns = [
  {
    key: "id",
    label: "BATCH ID",
    render: (value) => (
      <span className="font-bold text-blue-500">{value}</span>
    )
  },
  {
    key: "date",
    label: "DISPATCH DATE",
    render: (value) => (
      <span className="font-semibold text-(--theme-text-primary)">{value}</span>
    )
  },
  {
    key: "items",
    label: "TOTAL ITEMS",
    render: (value) => (
      <span className="font-black text-(--theme-text-primary)">{value}</span>
    )
  },
  {
    key: "status",
    label: "STATUS",
    render: (_, row) => (
      <Badge variant={row.statusVariant} size="sm">
        {row.status}
      </Badge>
    )
  },
  {
    key: "actions",
    label: "ACTIONS",
    align: "right",
    render: () => (
      <Button variant="secondary" size="sm" leftIcon={<Eye size={14} />}>
        View Batch
      </Button>
    )
  }
];

const DispatchBatchesTab = () => {
  return (
    <div className="rounded-xl border border-(--theme-border) bg-(--theme-surface) overflow-hidden">
      <Table
        columns={columns}
        data={dispatchBatches}
        rowKey="id"
      />
    </div>
  );
};

export default DispatchBatchesTab;

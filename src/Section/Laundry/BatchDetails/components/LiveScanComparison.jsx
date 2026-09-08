import Badge from "../../../../Components/UI/Badge";
import Card from "../../../../Components/UI/Card";
import Table from "../../../../Components/UI/Table";

const summaryColumns = [
  {
    key: "epc",
    label: "EPC",
    render: (value) => (
      <span className="font-mono text-xs font-bold text-(--theme-text-primary)">
        {value}
      </span>
    ),
  },
  { key: "assetName", label: "Asset Name" },
  { key: "category", label: "Category" },
  {
    key: "status",
    label: "Status",
    render: (value, row) => (
      <Badge size="sm" variant={row.statusVariant || "neutral"}>
        {value}
      </Badge>
    ),
  },
];

const LiveScanComparison = ({ remainingItems = [], receivedItems = [] }) => {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Remaining Expected Tags */}
      <Card padding="20px 24px" rounded="20px">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-(--color-pending, #f59e0b)" />
            <h3 className="text-base font-black text-(--theme-text-primary)">
              Remaining Expected Tags ({remainingItems.length})
            </h3>
          </div>
          <span className="text-xs text-(--theme-text-muted)">
            Awaiting scanner read
          </span>
        </div>

        <Table
          columns={summaryColumns}
          compact
          data={remainingItems}
          emptyText="No remaining tags pending."
          rowKey="id"
        />
      </Card>

      {/* Received Tags */}
      <Card padding="20px 24px" rounded="20px">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-(--theme-accent, #10b981)" />
            <h3 className="text-base font-black text-(--theme-text-primary)">
              Received Tags ({receivedItems.length})
            </h3>
          </div>
          <span className="text-xs text-(--theme-text-muted)">
            Successfully identified
          </span>
        </div>

        <Table
          columns={summaryColumns}
          compact
          data={receivedItems}
          emptyText="No tags received yet."
          rowKey="id"
        />
      </Card>
    </div>
  );
};

export default LiveScanComparison;

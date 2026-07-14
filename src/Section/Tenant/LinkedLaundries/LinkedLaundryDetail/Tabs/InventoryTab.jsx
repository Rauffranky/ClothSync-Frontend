import { Eye, Shirt } from "lucide-react";
import Table from "../../../../../Components/UI/Table";
import Badge from "../../../../../Components/UI/Badge";
import Button from "../../../../../Components/UI/Button";
import IconWrapper from "../../../../../Components/UI/IconWrapper";
import { inventoryData } from "../data";

const columns = [
  {
    key: "assetInfo",
    label: "ASSET ID / NAME",
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <div className="min-w-0">
          <p className="m-0 font-bold text-blue-500">{row.id}</p>
        </div>
      </div>
    )
  },
  {
    key: "name",
    label: "ASSET NAME",
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <IconWrapper icon={Shirt} variant={row.categoryVariant} sizeClassName="h-8 w-8" iconSize={14} roundedClassName="rounded-lg" />
        <span className="font-bold text-(--theme-text-primary)">{row.name}</span>
      </div>
    )
  },
  {
    key: "epc",
    label: "TAG EPC",
    render: (value) => (
      <span className="font-semibold text-blue-400">{value}</span>
    )
  },
  {
    key: "category",
    label: "CATEGORY",
    render: (_, row) => (
      <Badge variant={row.categoryVariant} size="sm">
        {row.category}
      </Badge>
    )
  },
  {
    key: "batch",
    label: "BATCH ID",
    render: (value) => (
      <span className="font-bold text-purple-500">{value}</span>
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
    key: "scan",
    label: "LAST SCAN",
    render: (value) => (
      <span className="text-xs font-semibold text-(--theme-text-muted)">{value}</span>
    )
  },
  {
    key: "days",
    label: "DAYS",
    render: (_, row) => (
      <div className="flex items-center gap-2">
        <span className="font-black text-(--theme-text-primary)">{row.days}</span>
        {row.delayedText && (
          <span className="text-[10px] font-black text-orange-500">{row.delayedText}</span>
        )}
      </div>
    )
  },
  {
    key: "actions",
    label: "ACTIONS",
    align: "right",
    render: () => (
      <Button variant="secondary" size="sm" leftIcon={<Eye size={14} />}>
        Asset
      </Button>
    )
  }
];

const InventoryTab = () => {
  return (
    <div className="rounded-xl border border-(--theme-border) bg-(--theme-surface) overflow-hidden">
      <Table
        columns={columns}
        data={inventoryData}
        rowKey="id"
      />
    </div>
  );
};

export default InventoryTab;

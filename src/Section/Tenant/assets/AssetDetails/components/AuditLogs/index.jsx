import { CircleUserRound } from "lucide-react";
import Badge from "../../../../../../Components/UI/Badge";
import Table from "../../../../../../Components/UI/Table";
import { useSortableTableData } from "../../../../../../Hooks/useSortableTableData";

const StatusChip = ({ value, variant }) => (
  <Badge variant={variant} size="sm" rounded="rounded-lg">
    {value}
  </Badge>
);

const AuditLogsTab = ({ data }) => {
  const { handleSort, sortedData, sortBy, sortDirection } = useSortableTableData(data.auditLogs);
  const columns = [
    {
      key: "action",
      label: "Action",
      sortable: true,
      render: (value) => (
        <span className="font-black text-(--theme-text-primary)">
          {value}
        </span>
      ),
    },
    {
      key: "performedBy",
      label: "Performed By",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-(--button-secondary-bg) text-(--color-sky-blue)">
            <CircleUserRound size={15} />
          </span>
          <span className="font-semibold text-(--theme-text-primary)">
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      sortable: true,
      render: (value) => (
        <span className="max-w-60 whitespace-normal font-semibold leading-relaxed text-(--theme-text-primary)">
          {value}
        </span>
      ),
    },
    {
      key: "dateTime",
      label: "Date & Time",
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-(--theme-text-primary)">
          {value}
        </span>
      ),
    },
    {
      key: "previousValue",
      label: "Previous Value",
      sortable: true,
      render: (_, row) => (
        <StatusChip value={row.previousValue} variant={row.previousValueVariant} />
      ),
    },
    {
      key: "updatedValue",
      label: "Updated Value",
      sortable: true,
      render: (_, row) => (
        <StatusChip value={row.updatedValue} variant={row.updatedValueVariant} />
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      compact
      data={sortedData}
      onSort={handleSort}
      rowKey="id"
      sortBy={sortBy}
      sortDirection={sortDirection}
    />
  );
};

export default AuditLogsTab;

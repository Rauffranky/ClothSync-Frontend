import { AlertTriangle, Eye } from "lucide-react";
import Badge from "../../../../../../Components/UI/Badge";
import Button from "../../../../../../Components/UI/Button";
import Table from "../../../../../../Components/UI/Table";
import { useSortableTableData } from "../../../../../../Hooks/useSortableTableData";

const ExceptionsTab = ({ data }) => {
  const { handleSort, sortedData, sortBy, sortDirection } = useSortableTableData(data.exceptions);
  const columns = [
    {
      key: "type",
      label: "Exception Type",
      sortable: true,
      render: (value) => (
        <div className="flex min-w-0 items-center gap-2">
          <AlertTriangle
            className="shrink-0 text-(--color-overdue)"
            size={16}
            strokeWidth={2.2}
          />
          <span className="font-black text-(--theme-text-primary)">
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "severity",
      label: "Severity",
      sortable: true,
      render: (_, row) => (
        <Badge variant={row.severityVariant} size="sm" rounded="rounded-lg">
          {row.severity}
        </Badge>
      ),
    },
    {
      key: "createdDate",
      label: "Created Date",
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-(--theme-text-primary)">
          {value}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (_, row) => (
        <Badge variant={row.statusVariant} size="sm" rounded="rounded-lg">
          {row.status}
        </Badge>
      ),
    },
    {
      key: "action",
      label: "Action",
      align: "right",
      render: () => (
        <Button variant="outline" size="sm" leftIcon={<Eye size={14} />}>
          Review
        </Button>
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

export default ExceptionsTab;

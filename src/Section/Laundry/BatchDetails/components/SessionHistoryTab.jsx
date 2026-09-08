import { History } from "lucide-react";
import Badge from "../../../../Components/UI/Badge";
import Card from "../../../../Components/UI/Card";
import Pagination from "../../../../Components/UI/Pagination";
import Table from "../../../../Components/UI/Table";
import { formatDateTime } from "../../../../Utils/date";

const historyColumns = [
  {
    key: "status",
    label: "Status",
    render: (value) => (
      <Badge
        dot
        size="sm"
        variant={
          value === "finished"
            ? "success"
            : value === "active"
            ? "primary"
            : "neutral"
        }
      >
        {value || "unknown"}
      </Badge>
    ),
  },
  {
    key: "scannerName",
    label: "Scanner",
    render: (value, row) => (
      <div>
        <div className="font-bold text-(--theme-text-primary)">
          {value || row.scannerId || "—"}
        </div>
        {row.scannerType && (
          <div className="text-xs capitalize text-(--theme-text-muted)">
            {row.scannerType}
          </div>
        )}
      </div>
    ),
  },
  {
    key: "startedAt",
    label: "Started At",
    render: (value) => (
      <span className="text-xs font-semibold text-(--theme-text-secondary)">
        {value ? formatDateTime(value, true) : "—"}
      </span>
    ),
  },
  {
    key: "finishedAt",
    label: "Finished At",
    render: (value) => (
      <span className="text-xs font-semibold text-(--theme-text-secondary)">
        {value ? formatDateTime(value, true) : "—"}
      </span>
    ),
  },
  {
    key: "processedCount",
    label: "Tags Processed",
    render: (value) => (
      <span className="font-bold text-(--theme-text-primary)">{value ?? 0}</span>
    ),
  },
];

const SessionHistoryTab = ({ history, historyPage, onPageChange }) => {
  const items = history?.items || [];
  const pagination = history?.pagination || {};
  const totalPages = pagination.totalPages || 1;

  return (
    <Card padding="20px 24px" rounded="20px">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="text-(--color-aurora-teal)" size={18} />
          <h3 className="text-base font-black text-(--theme-text-primary)">
            Previous Scan Sessions
          </h3>
        </div>
        <span className="text-xs text-(--theme-text-muted)">
          Total Sessions: {pagination.totalItems || items.length}
        </span>
      </div>

      <Table
        columns={historyColumns}
        data={items}
        emptyText="No previous scan sessions found for this batch."
        rowKey="id"
      />

      {(pagination.totalPages > 1 || pagination.totalItems > 10) && (
        <div className="mt-4 flex justify-end">
          <Pagination
            forcePage={historyPage - 1}
            itemsPerPage={pagination.perPage || 10}
            onPageChange={({ selected }) => onPageChange(selected + 1)}
            pageCount={totalPages}
            totalItems={pagination.totalItems || items.length}
          />
        </div>
      )}
    </Card>
  );
};

export default SessionHistoryTab;

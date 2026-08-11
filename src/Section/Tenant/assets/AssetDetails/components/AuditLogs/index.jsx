import { useEffect, useState } from "react";
import { CircleUserRound } from "lucide-react";
import Alert from "../../../../../../Components/UI/Alert";
import Badge from "../../../../../../Components/UI/Badge";
import Button from "../../../../../../Components/UI/Button";
import Pagination from "../../../../../../Components/UI/Pagination";
import Table from "../../../../../../Components/UI/Table";
import { useSortableTableData } from "../../../../../../Hooks/useSortableTableData";
import { getApiErrorMessage } from "../../../../../../axios/api";
import { getTenantAssetAuditLogs } from "../../../../../../axios/assets/tenantAssets";
import { formatDateTime } from "../../../../../../Utils/date";
import { formatStatusLabel } from "../../../../../../Utils/status";

const ITEMS_PER_PAGE = 20;

const statusVariants = {
  in_business: "success",
  sent_to_laundry: "warning",
  at_laundry: "purple",
  washed: "info",
  sent_to_business: "info",
  returned: "success",
  delayed: "danger",
  missing: "danger",
};

const getPerformerName = (performedBy) => {
  if (typeof performedBy === "string") return performedBy;
  return performedBy?.fullName || performedBy?.name || performedBy?.email || "System";
};

const getAuditValue = (value) => {
  if (value === null || value === undefined) return { label: "—", variant: "neutral" };
  if (typeof value !== "object") {
    return { label: formatStatusLabel(value, String(value)), variant: statusVariants[value] || "neutral" };
  }

  if (value.status) {
    return {
      label: formatStatusLabel(value.status),
      variant: statusVariants[value.status] || "neutral",
    };
  }

  const label = Object.entries(value)
    .map(([key, item]) => `${formatStatusLabel(key)}: ${formatStatusLabel(item, String(item ?? "—"))}`)
    .join(", ");
  return { label: label || "—", variant: "neutral" };
};

const normalizeAuditLog = (record = {}, index = 0) => {
  const previousValue = getAuditValue(record.previousValue);
  const updatedValue = getAuditValue(record.updatedValue);
  return {
    id: record.id || record._id || `${record.dateTime || record.createdAt || "audit"}-${index}`,
    action: record.actionLabel || formatStatusLabel(record.action),
    performedBy: getPerformerName(record.performedBy),
    actorRole: record.actorRole || record.performedBy?.role || "—",
    reason: record.reason || "—",
    dateTime: formatDateTime(record.dateTime || record.createdAt),
    previousValue: previousValue.label,
    previousValueVariant: previousValue.variant,
    updatedValue: updatedValue.label,
    updatedValueVariant: updatedValue.variant,
  };
};

const normalizeAuditLogsResponse = (response = {}) => {
  const payload = response?.data ?? response ?? {};
  const items = payload.items || payload.auditLogs || payload.logs || payload.docs || payload.results || [];
  const pagination = payload.pagination || payload.meta || {};
  const totalItems = Number(pagination.totalItems ?? pagination.total ?? payload.totalItems ?? items.length) || 0;
  return {
    rows: Array.isArray(items) ? items.map(normalizeAuditLog) : [],
    totalItems,
    totalPages: Number(pagination.totalPages ?? pagination.pages ?? Math.ceil(totalItems / ITEMS_PER_PAGE)) || 0,
  };
};

const StatusChip = ({ value, variant }) => (
  <Badge variant={variant} size="sm" rounded="rounded-lg">
    {value}
  </Badge>
);

const AuditLogsTab = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const { handleSort, sortedData, sortBy, sortDirection } = useSortableTableData(rows);
  const activePage = pageCount > 0 ? Math.min(currentPage, pageCount - 1) : 0;

  useEffect(() => {
    let isActive = true;
    // Loading synchronizes the selected server-side audit page.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setLoadError("");
    getTenantAssetAuditLogs(data.apiId || data.id, {
      page: currentPage + 1,
      limit: ITEMS_PER_PAGE,
    })
      .then((response) => {
        if (!isActive) return;
        const history = normalizeAuditLogsResponse(response);
        setRows(history.rows);
        setTotalItems(history.totalItems);
        setPageCount(history.totalPages);
      })
      .catch((error) => {
        if (!isActive) return;
        setRows([]);
        setTotalItems(0);
        setPageCount(0);
        setLoadError(getApiErrorMessage(error, "Unable to load audit logs"));
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [currentPage, data.apiId, data.id, retryKey]);

  const columns = [
    {
      key: "action",
      label: "Action",
      sortable: true,
      render: (value) => <span className="font-black text-(--theme-text-primary)">{value}</span>,
    },
    {
      key: "performedBy",
      label: "Performed By",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-(--button-secondary-bg) text-(--color-sky-blue)">
            <CircleUserRound size={15} />
          </span>
          <div className="min-w-0">
            <div className="font-semibold text-(--theme-text-primary)">{value}</div>
            <div className="text-xs font-semibold text-(--theme-text-muted)">{row.actorRole}</div>
          </div>
        </div>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      sortable: true,
      render: (value) => <span className="max-w-60 whitespace-normal font-semibold leading-relaxed text-(--theme-text-primary)">{value}</span>,
    },
    {
      key: "dateTime",
      label: "Date & Time",
      sortable: true,
      render: (value) => <span className="whitespace-nowrap font-semibold text-(--theme-text-primary)">{value}</span>,
    },
    {
      key: "previousValue",
      label: "Previous Value",
      sortable: true,
      render: (_, row) => <StatusChip value={row.previousValue} variant={row.previousValueVariant} />,
    },
    {
      key: "updatedValue",
      label: "Updated Value",
      sortable: true,
      render: (_, row) => <StatusChip value={row.updatedValue} variant={row.updatedValueVariant} />,
    },
  ];

  return (
    <>
      {loadError && (
        <Alert className="mb-4" variant="danger">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{loadError}</span>
            <Button onClick={() => setRetryKey((current) => current + 1)} size="sm" variant="outline">
              Try Again
            </Button>
          </div>
        </Alert>
      )}
      <Table
        columns={columns}
        compact
        data={sortedData}
        emptyText="No audit logs found"
        loading={isLoading}
        onSort={handleSort}
        rowKey="id"
        sortBy={sortBy}
        sortDirection={sortDirection}
      />
      <Pagination
        forcePage={activePage}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={({ selected }) => setCurrentPage(selected)}
        pageCount={pageCount}
        totalItems={totalItems}
      />
    </>
  );
};

export default AuditLogsTab;

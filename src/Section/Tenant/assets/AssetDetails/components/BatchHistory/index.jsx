import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import Alert from "../../../../../../Components/UI/Alert";
import Badge from "../../../../../../Components/UI/Badge";
import Button from "../../../../../../Components/UI/Button";
import Pagination from "../../../../../../Components/UI/Pagination";
import Table from "../../../../../../Components/UI/Table";
import { useSortableTableData } from "../../../../../../Hooks/useSortableTableData";
import { getApiErrorMessage } from "../../../../../../axios/api";
import { getTenantAssetBatchHistory } from "../../../../../../axios/assets/tenantAssets";
import { formatDateTime } from "../../../../../../Utils/date";
import { formatStatusLabel } from "../../../../../../Utils/status";

const ITEMS_PER_PAGE = 20;

const statusVariants = {
  dispatched: "info",
  partially_checked_in: "warning",
  checked_in: "success",
  received: "success",
  at_laundry: "purple",
  washed: "info",
  returned: "success",
  delayed: "danger",
  missing: "danger",
};

const normalizeBatchHistoryItem = (record = {}) => {
  const batch = record.batch || record.dispatchBatch || record.laundryBatch || record;
  const laundry = record.laundry || batch.laundry || batch.assignedLaundry || {};
  const batchStatusValue = batch.status || record.batchStatus || "—";
  const itemStatusValue = record.itemStatus || record.status || record.currentStatus || "—";
  const exceptionList = record.exceptions || record.issues || [];
  return {
    apiId: batch.id || batch._id || record.batchId,
    id: batch.batchCode || batch.code || record.batchCode || record.batchId || batch.id || "—",
    laundry: laundry.companyName || laundry.businessName || laundry.name || record.laundryName || "—",
    dispatchDate: formatDateTime(batch.dispatchedAt || batch.dispatchDate || record.dispatchedAt || record.createdAt),
    batchStatus: batch.statusLabel || formatStatusLabel(batchStatusValue),
    batchStatusVariant: statusVariants[batchStatusValue] || "neutral",
    itemStatus: record.itemStatusLabel || formatStatusLabel(itemStatusValue),
    itemStatusVariant: statusVariants[itemStatusValue] || "neutral",
    returnedDate: record.returnedAt || batch.returnedAt
      ? formatDateTime(record.returnedAt || batch.returnedAt)
      : "—",
    exceptions: Array.isArray(exceptionList)
      ? exceptionList.length
      : Number(record.exceptionsCount ?? record.exceptionCount) || 0,
  };
};

const normalizeBatchHistoryResponse = (response = {}) => {
  const payload = response?.data ?? response ?? {};
  const items = payload.items || payload.history || payload.batches || payload.docs || payload.results || [];
  const pagination = payload.pagination || payload.meta || {};
  const totalItems = Number(pagination.totalItems ?? pagination.total ?? payload.totalItems ?? items.length) || 0;
  return {
    rows: Array.isArray(items) ? items.map(normalizeBatchHistoryItem) : [],
    totalItems,
    totalPages: Number(pagination.totalPages ?? pagination.pages ?? Math.ceil(totalItems / ITEMS_PER_PAGE)) || 0,
  };
};

const StatusChip = ({ status, variant }) => (
  <Badge variant={variant} size="sm" rounded="rounded-lg">
    {status}
  </Badge>
);

const BatchHistoryTab = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const navigate = useNavigate();
  const { handleSort, sortedData, sortBy, sortDirection } = useSortableTableData(rows);
  const activePage = pageCount > 0 ? Math.min(currentPage, pageCount - 1) : 0;

  useEffect(() => {
    let isActive = true;
    // Loading synchronizes this tab with the selected server-side history page.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setLoadError("");
    getTenantAssetBatchHistory(data.apiId || data.id, {
      page: currentPage + 1,
      limit: ITEMS_PER_PAGE,
    })
      .then((response) => {
        if (!isActive) return;
        const history = normalizeBatchHistoryResponse(response);
        setRows(history.rows);
        setTotalItems(history.totalItems);
        setPageCount(history.totalPages);
      })
      .catch((error) => {
        if (!isActive) return;
        setRows([]);
        setTotalItems(0);
        setPageCount(0);
        setLoadError(getApiErrorMessage(error, "Unable to load batch history"));
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [currentPage, data.apiId, data.id, retryKey]);

  const handleTableSort = (nextSortBy, nextSortDirection) => {
    handleSort(nextSortBy, nextSortDirection);
    setCurrentPage(0);
  };

  const columns = [
    {
      key: "id",
      label: "Batch ID",
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm font-black text-(--color-aurora-teal)">
          {value}
        </span>
      ),
    },
    {
      key: "laundry",
      label: "Laundry",
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-(--theme-text-primary)">
          {value}
        </span>
      ),
    },
    {
      key: "dispatchDate",
      label: "Dispatch Date",
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-(--theme-text-primary)">
          {value}
        </span>
      ),
    },
    {
      key: "batchStatus",
      label: "Batch Status",
      sortable: true,
      render: (_, row) => (
        <StatusChip status={row.batchStatus} variant={row.batchStatusVariant} />
      ),
    },
    {
      key: "itemStatus",
      label: "Item Status",
      sortable: true,
      render: (_, row) => (
        <StatusChip status={row.itemStatus} variant={row.itemStatusVariant} />
      ),
    },
    {
      key: "returnedDate",
      label: "Returned",
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-(--theme-text-primary)">
          {value || "-"}
        </span>
      ),
    },
    {
      key: "exceptions",
      label: "Exceptions",
      align: "center",
      sortable: true,
      render: (value) => (
        <span
          className={
            value
              ? "font-black text-(--color-overdue)"
              : "font-semibold text-(--theme-text-muted)"
          }
        >
          {value || "-"}
        </span>
      ),
    },
    {
      key: "action",
      label: "Action",
      align: "right",
      render: (_, row) => (
        <Button disabled={!row.apiId} onClick={() => navigate(`/business/dispatch-batches/${row.apiId}`)} variant="outline" size="sm" leftIcon={<Eye size={14} />}>
          View
        </Button>
      ),
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
        emptyText="No batch history found"
        loading={isLoading}
        onSort={handleTableSort}
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

export default BatchHistoryTab;

import { useEffect, useRef, useState } from "react";
import { Eye, Folder, MapPin, RefreshCw, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Alert from "../../../../../Components/UI/Alert";
import Badge from "../../../../../Components/UI/Badge";
import Button from "../../../../../Components/UI/Button";
import Card from "../../../../../Components/UI/Card";
import Pagination from "../../../../../Components/UI/Pagination";
import Table from "../../../../../Components/UI/Table";
import { getApiErrorMessage } from "../../../../../axios/api";
import { getTenantDispatchBatchItems } from "../../../../../axios/dispatchBatches/tenantDispatchBatches";
import { formatDateTime } from "../../../../../Utils/date";
import { formatStatusLabel } from "../../../../../Utils/status";

const LIMIT = 20;
const STATUS_VARIANTS = {
  sent_to_laundry: "warning",
  at_laundry: "purple",
  in_laundry: "purple",
  washed: "info",
  sent_to_business: "info",
  returned: "success",
  delayed: "danger",
};

const normalizeItem = (record = {}, index = 0) => {
  const asset = record.asset || {};
  const tag = record.tag || asset.tag || {};
  const category = record.category || asset.category || {};
  const rawStatus = record.currentStatus || record.status || asset.status || "";
  return {
    id: record.id || record._id || tag.id || `${tag.epc || "item"}-${index}`,
    assetApiId: asset.id || asset._id || record.assetId,
    tagApiId: tag.id || tag._id || record.tagId,
    epc: record.epc || tag.epc || "—",
    assetName: record.assetName || asset.assetName || asset.name || "—",
    assetId: record.assetCode || asset.assetCode || asset.code || "—",
    category: record.categoryName || category.title || category.name || "—",
    currentStatus: record.statusLabel || formatStatusLabel(rawStatus),
    statusVariant: STATUS_VARIANTS[rawStatus] || "neutral",
    lastScan: formatDateTime(record.lastScannedAt || record.lastScan || asset.lastScannedAt),
    lastLocation: record.lastScanLocation || record.lastLocation || asset.lastScanLocation || "—",
  };
};

const BatchItemsTab = ({ batchId }) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const requestIdRef = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError("");
    getTenantDispatchBatchItems(batchId, { page: page + 1, limit: LIMIT })
      .then((response) => {
        if (requestId !== requestIdRef.current) return;
        const payload = response?.data ?? response ?? {};
        const records = [payload.items, payload.batchItems, payload.docs, payload.results].find(Array.isArray) || [];
        const meta = payload.pagination || payload.meta || {};
        const total = Number(meta.totalItems ?? meta.total ?? payload.totalItems ?? records.length) || 0;
        setItems(records.map(normalizeItem));
        setPagination({
          total,
          pages: Number(meta.totalPages ?? meta.pages ?? Math.ceil(total / LIMIT)) || 0,
        });
      })
      .catch((requestError) => {
        if (requestId !== requestIdRef.current) return;
        setItems([]);
        setPagination({ total: 0, pages: 0 });
        setError(getApiErrorMessage(requestError, "Unable to load batch items"));
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setLoading(false);
      });
    return () => {
      requestIdRef.current += 1;
    };
  }, [batchId, page, retryKey]);

  const columns = [
    { label: "TAG EPC", accessor: "epc", render: (value) => <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{value}</span> },
    { label: "ASSET NAME", accessor: "assetName", render: (value) => <span className="font-bold text-(--theme-text-primary)">{value}</span> },
    { label: "ASSET ID", accessor: "assetId", render: (value) => <span className="text-xs font-semibold text-(--theme-text-secondary)">{value}</span> },
    { label: "CATEGORY", accessor: "category", render: (value) => <span className="inline-flex items-center gap-1.5 rounded-lg border border-(--theme-border) bg-(--theme-surface-strong) px-2.5 py-1 text-xs font-semibold text-(--theme-text-secondary)"><Folder size={13} />{value}</span> },
    { label: "CURRENT STATUS", accessor: "currentStatus", render: (value, row) => <Badge variant={row.statusVariant} size="md">{value}</Badge> },
    { label: "LAST SCAN", accessor: "lastScan", render: (value) => <span className="whitespace-nowrap text-xs font-medium text-(--theme-text-secondary)">{value}</span> },
    { label: "LAST LOCATION", accessor: "lastLocation", render: (value) => <span className="flex items-center gap-1 text-xs font-medium text-(--theme-text-secondary)"><MapPin size={13} />{value}</span> },
    {
      label: "ACTIONS",
      key: "actions",
      sortable: false,
      align: "center",
      render: (_, row) => (
        <div className="flex justify-center gap-1.5">
          <Button disabled={!row.assetApiId} variant="outline" leftIcon={<Eye size={13} />} size={{ minHeight: 30, padding: "0 10px" }} onClick={() => navigate(`/business/assets/${row.assetApiId}`)}>Asset</Button>
          <Button disabled={!row.tagApiId} variant="outline" leftIcon={<Tag size={13} />} size={{ minHeight: 30, padding: "0 10px" }} onClick={() => navigate(`/business/tags/${row.tagApiId}`)}>Tag</Button>
        </div>
      ),
    },
  ];

  return (
    <Card className="mt-4 space-y-4 p-4" rounded="20px">
      {error && (
        <Alert variant="danger">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{error}</span>
            <Button variant="outline" leftIcon={<RefreshCw size={14} />} onClick={() => setRetryKey((value) => value + 1)}>Try Again</Button>
          </div>
        </Alert>
      )}
      <Table columns={columns} data={items} loading={loading} emptyText="No items in this batch" rowKey="id" />
      <Pagination pageCount={pagination.pages} forcePage={page} onPageChange={({ selected }) => setPage(selected)} totalItems={pagination.total} itemsPerPage={LIMIT} />
    </Card>
  );
};

export default BatchItemsTab;

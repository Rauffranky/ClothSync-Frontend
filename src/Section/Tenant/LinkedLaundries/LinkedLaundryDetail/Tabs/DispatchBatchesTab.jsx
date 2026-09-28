import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, PackageOpen, RefreshCw, UserRound } from "lucide-react";
import Table from "../../../../../Components/UI/Table";
import Badge from "../../../../../Components/UI/Badge";
import Button from "../../../../../Components/UI/Button";
import Card from "../../../../../Components/UI/Card";
import Pagination from "../../../../../Components/UI/Pagination";
import { getApiErrorMessage } from "../../../../../axios/api";
import { getTenantDispatchBatches } from "../../../../../axios/dispatchBatches/tenantDispatchBatches";
import { getTenantDispatchBatchCollection, STATUS_BADGE_VARIANTS } from "../../../DispatchBadges/data";

const LIMIT = 10;

const DispatchBatchesTab = ({ laundryId, laundryDetails }) => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!laundryId) return;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError("");

    getTenantDispatchBatches({
      laundryLinkId: laundryId,
      page: page + 1,
      limit: LIMIT,
    })
      .then((response) => {
        if (requestId !== requestIdRef.current) return;
        const collection = getTenantDispatchBatchCollection(response, LIMIT);
        setBatches(collection.rows || []);
        setTotalItems(collection.pagination.totalItems);
        setPageCount(collection.pagination.totalPages);
      })
      .catch((err) => {
        if (requestId !== requestIdRef.current) return;
        setBatches([]);
        setError(getApiErrorMessage(err, "Unable to load dispatch batches"));
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setLoading(false);
      });

    return () => {
      requestIdRef.current += 1;
    };
  }, [laundryId, page, refreshKey]);

  const columns = [
    {
      key: "id",
      label: "BATCH ID",
      render: (value, row) => (
        <button
          type="button"
          onClick={() => navigate(`/business/dispatch-batches/${row.apiId || value}`)}
          className="cursor-pointer border-none bg-transparent p-0 font-black text-blue-500 hover:underline"
        >
          {value}
        </button>
      ),
    },
    {
      key: "createdBy",
      label: "OPERATOR",
      render: (value) => (
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-(--button-ghost-bg) text-(--color-aurora-teal)">
            <UserRound size={14} />
          </span>
          <span className="font-bold text-(--theme-text-primary)">
            {value || "Operator"}
          </span>
        </div>
      ),
    },
    {
      key: "created",
      label: "DISPATCH DATE",
      render: (value) => (
        <span className="text-xs font-semibold text-(--theme-text-muted)">
          {value}
        </span>
      ),
    },
    {
      key: "items",
      label: "TOTAL ITEMS",
      render: (value) => (
        <span className="font-black text-(--theme-text-primary)">
          {value}
        </span>
      ),
    },
    {
      key: "returnProgress",
      label: "RETURN STATUS",
      render: (_, row) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-(--theme-text-primary)">
              {row.returned} / {row.items}
            </span>
            <span className="text-xs font-semibold text-(--theme-text-muted)">
              ({row.returnProgressPercentage}%)
            </span>
          </div>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-(--button-ghost-bg)">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${row.returnProgressPercentage}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (value) => (
        <Badge variant={STATUS_BADGE_VARIANTS[value] || "info"} size="sm">
          {value}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "ACTIONS",
      align: "right",
      render: (_, row) => (
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Eye size={14} />}
          onClick={() => navigate(`/business/dispatch-batches/${row.apiId || row.id}`)}
        >
          View Batch
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-semibold text-red-500">
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={13} />}
            onClick={() => setRefreshKey((k) => k + 1)}
          >
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <Card padding="24px" rounded="16px">
          <div className="space-y-4" aria-label="Loading dispatch batches">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-14 animate-pulse rounded-xl bg-(--theme-surface-strong)"
              />
            ))}
          </div>
        </Card>
      ) : batches.length > 0 ? (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-(--theme-border) bg-(--theme-surface)">
            <Table
              columns={columns}
              data={batches}
              rowKey="id"
            />
          </div>

          <Pagination
            forcePage={page}
            itemsPerPage={LIMIT}
            onPageChange={({ selected }) => setPage(selected)}
            pageCount={pageCount}
            totalItems={totalItems}
          />
        </div>
      ) : (
        <Card padding="32px" rounded="16px">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-(--button-ghost-bg) text-(--theme-text-muted)">
              <PackageOpen size={24} />
            </div>
            <h4 className="m-0 mt-3 text-sm font-bold text-(--theme-text-primary)">
              No Dispatch Batches Found
            </h4>
            <p className="m-0 mt-1 max-w-sm text-xs font-semibold text-(--theme-text-muted)">
              No batches have been dispatched to {laundryDetails?.name || "this laundry"} yet.
            </p>
            <Button
              className="mt-4"
              variant="outline"
              size="sm"
              onClick={() => navigate("/business/bulk-scanning")}
            >
              Start New Dispatch
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DispatchBatchesTab;

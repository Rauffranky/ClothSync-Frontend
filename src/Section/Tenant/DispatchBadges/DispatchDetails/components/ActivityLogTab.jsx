import { AlertTriangle, CheckCircle2, RefreshCw, User, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Alert from "../../../../../Components/UI/Alert";
import Badge from "../../../../../Components/UI/Badge";
import Button from "../../../../../Components/UI/Button";
import Card from "../../../../../Components/UI/Card";
import Pagination from "../../../../../Components/UI/Pagination";
import { getApiErrorMessage } from "../../../../../axios/api";
import { getTenantDispatchBatchActivityLogs } from "../../../../../axios/dispatchBatches/tenantDispatchBatches";
import { formatDateTime } from "../../../../../Utils/date";

const LIMIT = 20;

const ActivityLogTab = ({ batchId }) => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError("");

    getTenantDispatchBatchActivityLogs(batchId, { page: page + 1, limit: LIMIT })
      .then((response) => {
        if (requestId !== requestIdRef.current) return;
        const payload = response?.data ?? response ?? {};
        const items = [payload.items, payload.logs, payload.activityLogs].find(Array.isArray) ?? [];
        const meta = payload.pagination ?? payload.meta ?? {};
        const total = Number(meta.totalItems ?? meta.total ?? payload.total ?? items.length);
        setLogs(items);
        setPagination({
          total,
          pages: Number(meta.totalPages ?? meta.pages ?? Math.ceil(total / LIMIT)),
        });
      })
      .catch((requestError) => {
        if (requestId !== requestIdRef.current) return;
        setLogs([]);
        setPagination({ total: 0, pages: 0 });
        setError(getApiErrorMessage(requestError, "Unable to load batch activity logs"));
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setLoading(false);
      });

    return () => {
      requestIdRef.current += 1;
    };
  }, [batchId, page, retryKey]);

  const iconFor = (log) => {
    const type = log.iconType ?? log.type;
    if (type === "warning") return AlertTriangle;
    if (type === "user") return User;
    if (type === "success") return CheckCircle2;
    return Zap;
  };

  return (
    <Card className="p-6 mt-4 space-y-6" rounded="20px">
      <div>
        <h3 className="text-lg font-bold text-(--theme-text-primary)">Activity Log</h3>
        <p className="mt-0.5 text-xs font-semibold text-(--theme-text-secondary)">
          Full audit trail for {batchId}
        </p>
      </div>

      {error && (
        <Alert variant="danger">
          <div className="flex items-center justify-between gap-3">
            <span>{error}</span>
            <Button variant="outline" leftIcon={<RefreshCw size={14} />} onClick={() => setRetryKey((value) => value + 1)}>
              Try again
            </Button>
          </div>
        </Alert>
      )}

      {loading ? (
        <div className="space-y-4" aria-label="Loading activity logs">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-xl bg-(--theme-surface-strong)" />
          ))}
        </div>
      ) : logs.length ? (
        <div className="space-y-4">
          {logs.map((log, index) => {
            const LogIcon = iconFor(log);
            const actor = log.user?.fullName ?? log.performedBy?.fullName ?? log.actorName ?? "System";
            return (
              <div key={log.id ?? `${log.createdAt}-${index}`} className="flex gap-3 rounded-xl border border-(--theme-border) p-4">
                <LogIcon size={18} className="mt-0.5 shrink-0 text-(--color-aurora-teal)" />
                <div className="min-w-0 space-y-1">
                  <p className="font-bold text-(--theme-text-primary)">
                    {log.event ?? log.action ?? log.title ?? log.message ?? "Batch activity"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-(--theme-text-secondary)">
                    <Badge variant={actor === "System" ? "neutral" : "info"} size="sm">{actor}</Badge>
                    <span>{formatDateTime(log.timestamp ?? log.createdAt ?? log.updatedAt)}</span>
                  </div>
                  {(log.details ?? log.description) && <p className="text-sm text-(--theme-text-secondary)">{log.details ?? log.description}</p>}
                </div>
              </div>
            );
          })}
        </div>
      ) : !error ? (
        <div className="py-10 text-center text-sm font-semibold text-(--theme-text-secondary)">No activity logs found.</div>
      ) : null}

      <Pagination
        pageCount={pagination.pages}
        forcePage={page}
        onPageChange={({ selected }) => setPage(selected)}
        totalItems={pagination.total}
        itemsPerPage={LIMIT}
      />
    </Card>
  );
};

export default ActivityLogTab;

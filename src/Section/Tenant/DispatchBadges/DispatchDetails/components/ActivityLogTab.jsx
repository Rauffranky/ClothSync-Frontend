import { AlertTriangle, CheckCircle2, RefreshCw, UserRound, Zap } from "lucide-react";
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

  const getLogVisual = (log, actor) => {
    const type = String(log.iconType ?? log.type ?? log.level ?? "").toLowerCase();
    const eventName = String(log.event ?? log.action ?? log.title ?? "").toLowerCase();
    if (type === "warning" || type === "danger" || eventName.includes("exception")) {
      return {
        icon: AlertTriangle,
        nodeClass: "border-amber-400 bg-amber-500 text-white shadow-amber-500/25",
        badgeVariant: "warning",
      };
    }
    if (type === "success") {
      return {
        icon: CheckCircle2,
        nodeClass: "border-emerald-400 bg-emerald-500 text-white shadow-emerald-500/25",
        badgeVariant: "success",
      };
    }
    if (actor !== "System" || type === "user") {
      return {
        icon: UserRound,
        nodeClass: "border-teal-300 bg-(--color-aurora-teal) text-white shadow-teal-500/25",
        badgeVariant: "success",
      };
    }
    return {
      icon: Zap,
      nodeClass: "border-slate-300 bg-slate-400 text-white shadow-slate-500/20 dark:border-slate-500 dark:bg-slate-600",
      badgeVariant: "neutral",
    };
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
        <div className="pt-1">
          {logs.map((log, index) => {
            const actor =
              log.user?.fullName ??
              log.performedBy?.fullName ??
              log.performedBy?.name ??
              (typeof log.performedBy === "string" ? log.performedBy : null) ??
              log.actorName ??
              "System";
            const visual = getLogVisual(log, actor);
            const LogIcon = visual.icon;
            const isLast = index === logs.length - 1;
            const details = log.details ?? log.description ?? log.reason ?? log.message;
            return (
              <div
                key={log.id ?? `${log.createdAt ?? log.dateTime}-${index}`}
                className="grid grid-cols-[30px_minmax(0,1fr)] gap-3 sm:grid-cols-[34px_minmax(0,1fr)] sm:gap-4"
              >
                <div className="relative flex justify-center">
                  {!isLast && (
                    <span className="absolute top-7 -bottom-1 w-px bg-(--theme-border)" />
                  )}
                  <span
                    className={`relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full border shadow-lg ${visual.nodeClass}`}
                  >
                    <LogIcon size={13} strokeWidth={2.5} />
                  </span>
                </div>

                <div className={`min-w-0 ${isLast ? "pb-0" : "pb-7"}`}>
                  <h4 className="m-0 text-sm font-black leading-6 text-(--theme-text-primary) sm:text-base">
                    {log.event ?? log.actionLabel ?? log.action ?? log.title ?? log.message ?? "Batch activity"}
                  </h4>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-(--theme-text-secondary)">
                    <Badge
                      variant={visual.badgeVariant}
                      size="sm"
                      rounded="rounded-md"
                      leftIcon={actor === "System" ? <Zap size={11} /> : <UserRound size={11} />}
                    >
                      {actor}
                    </Badge>
                    <time dateTime={log.timestamp ?? log.dateTime ?? log.createdAt ?? log.updatedAt}>
                      {formatDateTime(log.timestamp ?? log.dateTime ?? log.occurredAt ?? log.createdAt ?? log.updatedAt)}
                    </time>
                  </div>

                  {details && (
                    <div className="mt-2 rounded-lg border border-(--theme-border-soft) bg-(--theme-surface-strong) px-3 py-2.5 text-sm font-medium leading-relaxed text-(--theme-text-secondary)">
                      {details}
                    </div>
                  )}
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

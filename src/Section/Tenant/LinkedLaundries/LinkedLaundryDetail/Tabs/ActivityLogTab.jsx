import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  Clock,
  Globe,
  Layers,
  RefreshCw,
  Shield,
  Star,
  Truck,
  Zap,
} from "lucide-react";
import Card from "../../../../../Components/UI/Card";
import Badge from "../../../../../Components/UI/Badge";
import Button from "../../../../../Components/UI/Button";
import Pagination from "../../../../../Components/UI/Pagination";
import { getApiErrorMessage } from "../../../../../axios/api";
import { getTenantLaundryActivityLogs } from "../../../../../axios/laundries/tenantLaundries";
import { formatDateTime } from "../../../../../Utils/date";

const LIMIT = 15;

const getActivityVisual = (log) => {
  const type = String(log.eventType || log.action || "").toLowerCase();
  const title = String(log.title || "").toLowerCase();

  if (
    type.includes("exception") ||
    type.includes("delayed") ||
    type.includes("missing")
  ) {
    return {
      icon: AlertTriangle,
      circleClass: "border-red-500 bg-red-500/10 text-red-500",
      badgeVariant: "danger",
    };
  }
  if (
    type.includes("return") ||
    type.includes("wash") ||
    type.includes("complete") ||
    type === "accept_invite" ||
    type === "connected"
  ) {
    return {
      icon: CheckCircle2,
      circleClass: "border-emerald-500 bg-emerald-500/10 text-emerald-500",
      badgeVariant: "success",
    };
  }
  if (type.includes("dispatch") || type.includes("send")) {
    return {
      icon: Truck,
      circleClass: "border-amber-500 bg-amber-500/10 text-amber-500",
      badgeVariant: "warning",
    };
  }
  if (type.includes("default") || title.includes("default")) {
    return {
      icon: Star,
      circleClass: "border-amber-400 bg-amber-400/10 text-amber-400",
      badgeVariant: "warning",
    };
  }
  if (type.includes("checkin") || type.includes("at_laundry")) {
    return {
      icon: Layers,
      circleClass: "border-purple-500 bg-purple-500/10 text-purple-500",
      badgeVariant: "purple",
    };
  }
  if (type.includes("view") || title.includes("accessed")) {
    return {
      icon: Shield,
      circleClass: "border-sky-500 bg-sky-500/10 text-sky-400",
      badgeVariant: "info",
    };
  }
  return {
    icon: Zap,
    circleClass:
      "border-(--color-aurora-teal) bg-(--color-aurora-teal)/10 text-(--color-aurora-teal)",
    badgeVariant: "primary",
  };
};

const getInitials = (name = "") => {
  if (!name || typeof name !== "string") return "OP";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const ActivityLogTab = ({ laundryId, laundryDetails }) => {
  const [logs, setLogs] = useState([]);
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

    getTenantLaundryActivityLogs(laundryId, {
      page: page + 1,
      limit: LIMIT,
    })
      .then((response) => {
        if (requestId !== requestIdRef.current) return;
        const payload =
          response?.data?.data ?? response?.data ?? response ?? {};
        const items = payload.items || [];
        const pagination = payload.pagination || {};
        const total = Number(pagination.total ?? items.length);

        setLogs(items);
        setTotalItems(total);
        setPageCount(Number(pagination.totalPages ?? Math.ceil(total / LIMIT)));
      })
      .catch((err) => {
        if (requestId !== requestIdRef.current) return;
        setLogs([]);
        setError(
          getApiErrorMessage(err, "Unable to load laundry activity logs"),
        );
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setLoading(false);
      });

    return () => {
      requestIdRef.current += 1;
    };
  }, [laundryId, page, refreshKey]);

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="m-0 text-base font-black text-(--theme-text-primary)">
            Operational Activity & Audit Trail
          </h3>
          <p className="m-0 mt-0.5 text-xs font-semibold text-(--theme-text-muted)">
            Complete log of dispatches, batch updates, and operator actions for{" "}
            <span className="font-bold text-(--theme-text-primary)">
              {laundryDetails?.name || "this laundry"}
            </span>
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          }
          onClick={() => setRefreshKey((k) => k + 1)}
        >
          Refresh Logs
        </Button>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-semibold text-red-500">
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshKey((k) => k + 1)}
          >
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <Card padding="24px" rounded="16px">
          <div className="space-y-6" aria-label="Loading activity logs">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex gap-4">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-(--theme-surface-strong)" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-(--theme-surface-strong)" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-(--theme-surface-strong)" />
                  <div className="h-12 w-full animate-pulse rounded-xl bg-(--theme-surface-strong)" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : logs.length > 0 ? (
        <Card padding="24px" rounded="16px">
          <div className="relative border-l-2 border-(--theme-border) ml-4 space-y-8 py-2">
            {logs.map((log, index) => {
              const visual = getActivityVisual(log);
              const LogIcon = visual.icon;
              const operator = log.operator || {};
              const operatorName = operator.fullName || "Operator";
              const operatorRole = operator.role || "Staff Operator";
              const operatorEmail = operator.email;
              const operatorAvatar = operator.avatar;

              return (
                <div key={log.id || index} className="relative pl-7 sm:pl-8">
                  {/* Timeline Node */}
                  <div className="absolute -left-4.25 top-0 rounded-full bg-(--theme-surface) p-1">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-sm ${visual.circleClass}`}
                    >
                      <LogIcon size={14} strokeWidth={2.5} />
                    </span>
                  </div>

                  {/* Log Content Card */}
                  <div className="rounded-xl border border-(--theme-border-soft) bg-(--theme-surface-strong) p-4 transition-all duration-200 hover:border-(--theme-border)">
                    {/* Top Row: Title, Badge, and Timestamp */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="m-0 text-sm font-black text-(--theme-text-primary) sm:text-base">
                          {log.title}
                        </h4>
                        {log.badge && (
                          <Badge
                            variant={log.badgeVariant || visual.badgeVariant}
                            size="sm"
                          >
                            {log.badge}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-semibold text-(--theme-text-muted)">
                        <Clock
                          size={12}
                          className="text-(--color-aurora-teal)"
                        />
                        <time dateTime={log.occurredAt}>
                          {formatDateTime(log.occurredAt)}
                        </time>
                      </div>
                    </div>

                    {/* Operator Information Row (Highlighted) */}
                    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-(--theme-border-soft)/60 bg-(--theme-surface) px-3 py-2">
                      <div className="flex items-center gap-2.5">
                        {operatorAvatar ? (
                          <img
                            alt={operatorName}
                            className="h-7 w-7 rounded-full object-cover ring-1 ring-(--theme-border)"
                            src={operatorAvatar}
                          />
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-(--button-ghost-bg) text-[11px] font-black text-(--color-aurora-teal)">
                            {getInitials(operatorName)}
                          </div>
                        )}
                        <div>
                          <p className="m-0 text-xs font-black text-(--theme-text-primary)">
                            <span className="text-(--theme-text-muted) font-semibold mr-1">
                              Operator:
                            </span>
                            {operatorName}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] font-semibold text-(--theme-text-muted)">
                            <span className="text-(--color-aurora-teal)">
                              {operatorRole}
                            </span>
                            {operatorEmail && (
                              <>
                                <span>•</span>
                                <span>{operatorEmail}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description Details */}
                    {log.description && (
                      <p className="m-0 mt-2.5 text-xs font-medium leading-relaxed text-(--theme-text-secondary) sm:text-sm">
                        {log.description}
                      </p>
                    )}

                    {/* Metadata & Batch Links */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {log.batchCode && (
                        <Link
                          to={`/business/dispatch-batches/${log.batchId || log.batchCode}`}
                          className="inline-flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-black text-blue-500 transition-colors hover:bg-blue-500/20"
                        >
                          <Boxes size={12} />
                          Batch: {log.batchCode}
                          <ArrowUpRight size={12} />
                        </Link>
                      )}

                      {log.totalItems > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-(--theme-border) bg-(--button-ghost-bg) px-2.5 py-1 text-xs font-bold text-(--theme-text-primary)">
                          <Layers
                            size={12}
                            className="text-(--color-aurora-teal)"
                          />
                          {log.totalItems} items
                        </span>
                      )}

                      {log.metadata?.ipAddress && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-(--theme-border) bg-(--button-ghost-bg) px-2 py-0.5 text-[11px] font-semibold text-(--theme-text-muted)">
                          <Globe size={11} />
                          IP: {log.metadata.ipAddress}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 border-t border-(--theme-border) pt-4">
            <Pagination
              forcePage={page}
              itemsPerPage={LIMIT}
              onPageChange={({ selected }) => setPage(selected)}
              pageCount={pageCount}
              totalItems={totalItems}
            />
          </div>
        </Card>
      ) : (
        <Card padding="32px" rounded="16px">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-(--button-ghost-bg) text-(--theme-text-muted)">
              <Clock size={24} />
            </div>
            <h4 className="m-0 mt-3 text-sm font-bold text-(--theme-text-primary)">
              No Activity Logs Found
            </h4>
            <p className="m-0 mt-1 max-w-sm text-xs font-semibold text-(--theme-text-muted)">
              No operational activities or audit events have been logged for
              this laundry yet.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ActivityLogTab;

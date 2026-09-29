import {
  AlertCircle,
  AlertTriangle,
  ArrowRightLeft,
  Boxes,
  Building2,
  CheckCheck,
  Clock,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Shirt,
  Sparkles,
  Tag,
  Truck,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Alert from "../../../../../Components/UI/Alert";
import Badge from "../../../../../Components/UI/Badge";
import Button from "../../../../../Components/UI/Button";
import Card from "../../../../../Components/UI/Card";
import InitialsAvatar from "../../../../../Components/UI/InitialsAvatar";
import Pagination from "../../../../../Components/UI/Pagination";
import { getApiErrorMessage } from "../../../../../axios/api";
import { getTenantDispatchBatchActivityLogs } from "../../../../../axios/dispatchBatches/tenantDispatchBatches";
import { formatDateTime } from "../../../../../Utils/date";

const LIMIT = 20;

const getInitials = (name = "") => {
  if (!name || typeof name !== "string") return "SY";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getEventVisual = (log) => {
  const eventType = String(
    log.eventType ?? log.event ?? log.action ?? log.type ?? log.title ?? "",
  ).toLowerCase();

  if (
    eventType.includes("exception_resolved") ||
    eventType.includes("resolved")
  ) {
    return {
      icon: ShieldCheck,
      nodeClass:
        "border-emerald-400 bg-emerald-600 text-white shadow-emerald-500/25",
      badgeVariant: "success",
      category: "Resolved",
      borderAccent: "border-l-emerald-500",
    };
  }

  if (
    eventType.includes("exception") ||
    eventType.includes("danger") ||
    eventType.includes("failed")
  ) {
    return {
      icon: AlertTriangle,
      nodeClass: "border-rose-400 bg-rose-500 text-white shadow-rose-500/25",
      badgeVariant: "danger",
      category: "Exception",
      borderAccent: "border-l-rose-500",
    };
  }

  if (eventType.includes("unlinked")) {
    return {
      icon: AlertCircle,
      nodeClass:
        "border-orange-400 bg-orange-500 text-white shadow-orange-500/25",
      badgeVariant: "warning",
      category: "Unlinked Tags",
      borderAccent: "border-l-orange-500",
    };
  }

  if (
    eventType.includes("batch_dispatched") ||
    eventType.includes("dispatched") ||
    eventType.includes("sent_to_laundry")
  ) {
    return {
      icon: Truck,
      nodeClass: "border-amber-400 bg-amber-500 text-white shadow-amber-500/25",
      badgeVariant: "warning",
      category: "Dispatched",
      borderAccent: "border-l-amber-500",
    };
  }

  if (eventType.includes("batch_created") || eventType.includes("created")) {
    return {
      icon: Boxes,
      nodeClass:
        "border-teal-400 bg-(--color-aurora-teal) text-white shadow-teal-500/25",
      badgeVariant: "info",
      category: "Batch Created",
      borderAccent: "border-l-teal-500",
    };
  }

  if (
    eventType.includes("scan") ||
    eventType.includes("rfid") ||
    eventType.includes("tag")
  ) {
    return {
      icon: ScanLine,
      nodeClass:
        "border-emerald-400 bg-emerald-500 text-white shadow-emerald-500/25",
      badgeVariant: "success",
      category: "RFID Scan",
      borderAccent: "border-l-emerald-500",
    };
  }

  if (eventType.includes("in_laundry") || eventType.includes("checked_in")) {
    return {
      icon: Shirt,
      nodeClass:
        "border-purple-400 bg-purple-500 text-white shadow-purple-500/25",
      badgeVariant: "purple",
      category: "In Laundry",
      borderAccent: "border-l-purple-500",
    };
  }

  if (eventType.includes("sent_to_business")) {
    return {
      icon: ArrowRightLeft,
      nodeClass: "border-sky-400 bg-sky-500 text-white shadow-sky-500/25",
      badgeVariant: "info",
      category: "In Transit",
      borderAccent: "border-l-sky-500",
    };
  }

  if (eventType.includes("completed")) {
    return {
      icon: CheckCheck,
      nodeClass:
        "border-emerald-400 bg-emerald-600 text-white shadow-emerald-500/25",
      badgeVariant: "success",
      category: "Completed",
      borderAccent: "border-l-emerald-600",
    };
  }

  return {
    icon: Sparkles,
    nodeClass: "border-slate-400 bg-slate-600 text-white shadow-slate-500/20",
    badgeVariant: "neutral",
    category: "Activity",
    borderAccent: "border-l-slate-500",
  };
};

const ActivityLogTab = ({ batchId, batchDetails = null }) => {
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

    getTenantDispatchBatchActivityLogs(batchId, {
      page: page + 1,
      limit: LIMIT,
    })
      .then((response) => {
        if (requestId !== requestIdRef.current) return;
        const payload = response?.data ?? response ?? {};
        const items =
          [
            payload.items,
            payload.logs,
            payload.activityLogs,
            payload.rows,
          ].find(Array.isArray) ?? [];
        const meta = payload.pagination ?? payload.meta ?? {};
        const total = Number(
          meta.totalItems ??
            meta.total ??
            payload.totalItems ??
            payload.total ??
            items.length,
        );
        const pages = Number(
          meta.totalPages ??
            meta.pages ??
            payload.totalPages ??
            (Math.ceil(total / LIMIT) || 1),
        );

        setLogs(items);
        setPagination({
          total,
          pages,
        });
      })
      .catch((requestError) => {
        if (requestId !== requestIdRef.current) return;
        setLogs([]);
        setPagination({ total: 0, pages: 0 });
        setError(
          getApiErrorMessage(
            requestError,
            "Unable to load batch activity logs",
          ),
        );
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setLoading(false);
      });

    return () => {
      requestIdRef.current += 1;
    };
  }, [batchId, page, retryKey]);

  // Fallbacks from batchDetails
  const displayBatchCode =
    batchDetails?.id && batchDetails.id !== "—" ? batchDetails.id : batchId;
  const displayLaundry =
    batchDetails?.selectedLaundry && batchDetails.selectedLaundry !== "—"
      ? batchDetails.selectedLaundry
      : batchDetails?.laundryPartner?.name !== "—"
        ? batchDetails?.laundryPartner?.name
        : null;
  const displayStation =
    batchDetails?.dispatchLocation && batchDetails.dispatchLocation !== "—"
      ? batchDetails.dispatchLocation
      : null;
  const displayDispatcher =
    batchDetails?.createdBy && batchDetails.createdBy !== "—"
      ? batchDetails.createdBy
      : (logs[0]?.actor?.fullName ?? null);

  return (
    <Card className="p-6 mt-4 space-y-6" rounded="20px">
      <div>
        <h3 className="text-lg font-bold text-(--theme-text-primary)">
          Activity Log
        </h3>
        <p className="mt-0.5 text-xs font-semibold text-(--theme-text-secondary)">
          Full audit trail for {displayBatchCode}
        </p>
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="danger">
          <div className="flex items-center justify-between gap-3">
            <span>{error}</span>
            <Button
              variant="outline"
              leftIcon={<RefreshCw size={14} />}
              onClick={() => setRetryKey((value) => value + 1)}
            >
              Try again
            </Button>
          </div>
        </Alert>
      )}

      {/* Loading state skeleton */}
      {loading ? (
        <div className="space-y-6 pt-1" aria-label="Loading activity logs">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[32px_minmax(0,1fr)] gap-3.5 sm:grid-cols-[38px_minmax(0,1fr)] sm:gap-4.5 animate-pulse"
            >
              <div className="flex justify-center">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-(--theme-surface-strong) border border-(--theme-border-soft)" />
              </div>
              <div className="rounded-xl border border-(--theme-border-soft) bg-(--theme-surface-strong) p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-36 rounded bg-(--theme-border-soft)" />
                    <div className="h-5 w-20 rounded-md bg-(--theme-border-soft)" />
                  </div>
                  <div className="h-3 w-28 rounded bg-(--theme-border-soft)" />
                </div>
                <div className="h-3.5 w-44 rounded bg-(--theme-border-soft)" />
                <div className="h-3.5 w-3/4 rounded bg-(--theme-border-soft)" />
                <div className="flex flex-wrap gap-2 pt-2 border-t border-(--theme-border-soft)">
                  <div className="h-6 w-28 rounded-lg bg-(--theme-border-soft)" />
                  <div className="h-6 w-24 rounded-lg bg-(--theme-border-soft)" />
                  <div className="h-6 w-20 rounded-lg bg-(--theme-border-soft)" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : logs.length ? (
        /* Timeline List */
        <div className="relative pt-1">
          {logs.map((log, index) => {
            // Resolve actor accurately
            const actorName =
              log.actor?.fullName ??
              log.actor?.name ??
              log.user?.fullName ??
              log.user?.name ??
              log.performedBy?.fullName ??
              log.performedBy?.name ??
              (typeof log.performedBy === "string" ? log.performedBy : null) ??
              (typeof log.actor === "string" ? log.actor : null) ??
              log.actorName ??
              (log.actorType === "user" ? displayDispatcher : null) ??
              "System";

            const isSystemActor =
              actorName === "System" || log.actorType === "system";
            const visual = getEventVisual(log);
            const LogIcon = visual.icon;
            const isLast = index === logs.length - 1;
            const details =
              log.description ?? log.details ?? log.reason ?? log.message ?? "";

            // Extract metadata fields
            const meta = log.metadata || {};
            const destinationLaundry =
              meta.destinationLaundry ||
              meta.laundryName ||
              (visual.category === "Dispatched" ? displayLaundry : null);
            const laundryLoc = meta.laundryLocation || null;
            const station =
              meta.scannerLocation ||
              meta.station ||
              (visual.category.includes("Scan") ||
              visual.category === "Dispatched"
                ? displayStation
                : null);
            const itemCount =
              meta.dispatchedItems ??
              meta.scannedCount ??
              meta.totalItems ??
              meta.itemCount ??
              null;
            const batchCode = meta.batchCode || displayBatchCode;
            const scanSessionId = meta.scanSessionId || null;
            const actionType = meta.action || null;
            const exceptionSeverity = meta.severity || null;
            const exceptionType = meta.type || null;

            return (
              <div
                key={log.id ?? `${log.occurredAt ?? log.createdAt}-${index}`}
                className="grid grid-cols-[32px_minmax(0,1fr)] gap-3.5 sm:grid-cols-[38px_minmax(0,1fr)] sm:gap-4.5"
              >
                {/* Timeline connector and node icon */}
                <div className="relative flex justify-center">
                  {!isLast && (
                    <span className="absolute top-9 -bottom-2 w-0.5 bg-(--theme-border-soft)" />
                  )}
                  <span
                    className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border shadow-md sm:h-9 sm:w-9 ${visual.nodeClass}`}
                  >
                    <LogIcon size={16} strokeWidth={2.2} />
                  </span>
                </div>

                {/* Activity Detail Card */}
                <div className={`min-w-0 ${isLast ? "pb-2" : "pb-8"}`}>
                  <div
                    className={`rounded-xl border border-(--theme-border-soft) border-l-4 ${visual.borderAccent} bg-(--theme-surface-strong) p-4 transition-all duration-200 hover:border-(--theme-border)`}
                  >
                    {/* Header Row: Title & Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="m-0 text-sm font-black leading-snug text-(--theme-text-primary) sm:text-base">
                          {log.title ??
                            log.event ??
                            log.actionLabel ??
                            log.action ??
                            "Batch Event"}
                        </h4>
                        <Badge
                          variant={visual.badgeVariant}
                          size="sm"
                          rounded="rounded-md"
                        >
                          {visual.category}
                        </Badge>
                      </div>

                      {/* Occurred Timestamp */}
                      <time
                        dateTime={
                          log.occurredAt ??
                          log.timestamp ??
                          log.createdAt ??
                          log.updatedAt
                        }
                        className="flex items-center gap-1.5 text-xs font-semibold text-(--theme-text-secondary)"
                      >
                        <Clock
                          size={12}
                          className="text-(--theme-text-muted)"
                        />
                        {formatDateTime(
                          log.occurredAt ??
                            log.timestamp ??
                            log.dateTime ??
                            log.createdAt ??
                            log.updatedAt,
                        )}
                      </time>
                    </div>

                    {/* Actor Identification Row */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs font-medium text-(--theme-text-secondary)">
                      <span className="text-(--theme-text-muted)">
                        Executed by:
                      </span>
                      {isSystemActor ? (
                        <div className="inline-flex items-center gap-1.5 rounded-md border border-(--theme-border-soft) bg-(--theme-surface) px-2 py-0.5 font-bold text-(--theme-text-secondary)">
                          <Zap size={11} className="text-amber-400" />
                          <span>System Automated</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 rounded-md border border-teal-500/20 bg-teal-500/10 px-2 py-0.5 font-bold text-teal-300">
                          <InitialsAvatar
                            initials={getInitials(actorName)}
                            size="sm"
                            variant="info"
                            className="h-4.5 w-4.5 text-[9px]"
                          />
                          <span>{actorName}</span>
                          <span className="text-[10px] text-teal-400/80 font-normal">
                            (Staff)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description Paragraph */}
                    {details && (
                      <p className="mt-2.5 text-sm font-medium leading-relaxed text-(--theme-text-secondary)">
                        {details}
                      </p>
                    )}

                    {/* Comprehensive Metadata Chips Container */}
                    <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-(--theme-border-soft) pt-3">
                      {/* Destination Laundry */}
                      {destinationLaundry && (
                        <div className="flex items-center gap-1.5 rounded-lg border border-(--theme-border-soft) bg-(--theme-surface) px-2.5 py-1 text-xs">
                          <Building2
                            size={12}
                            className="shrink-0 text-blue-400"
                          />
                          <span className="text-(--theme-text-muted)">
                            Partner:
                          </span>
                          <span className="font-bold text-(--theme-text-primary)">
                            {destinationLaundry}
                          </span>
                          {laundryLoc && (
                            <span className="text-[11px] text-(--theme-text-muted)">
                              ({laundryLoc})
                            </span>
                          )}
                        </div>
                      )}

                      {/* Scanner Location / Station */}
                      {station && (
                        <div className="flex items-center gap-1.5 rounded-lg border border-(--theme-border-soft) bg-(--theme-surface) px-2.5 py-1 text-xs">
                          <ScanLine
                            size={12}
                            className="shrink-0 text-emerald-400"
                          />
                          <span className="text-(--theme-text-muted)">
                            Station:
                          </span>
                          <span className="font-bold text-(--theme-text-primary)">
                            {station}
                          </span>
                        </div>
                      )}

                      {/* Items Count */}
                      {itemCount !== null && (
                        <div className="flex items-center gap-1.5 rounded-lg border border-(--theme-border-soft) bg-(--theme-surface) px-2.5 py-1 text-xs">
                          <Shirt
                            size={12}
                            className="shrink-0 text-amber-400"
                          />
                          <span className="text-(--theme-text-muted)">
                            Items:
                          </span>
                          <span className="font-extrabold text-(--theme-text-primary)">
                            {itemCount} Verified
                          </span>
                        </div>
                      )}

                      {/* Batch Reference Code */}
                      {batchCode && (
                        <div className="flex items-center gap-1.5 rounded-lg border border-(--theme-border-soft) bg-(--theme-surface) px-2.5 py-1 text-xs">
                          <Boxes size={12} className="shrink-0 text-teal-400" />
                          <span className="text-(--theme-text-muted)">
                            Batch:
                          </span>
                          <span className="font-mono font-bold text-(--theme-text-primary)">
                            {batchCode}
                          </span>
                        </div>
                      )}

                      {/* Action tag */}
                      {actionType && (
                        <div className="flex items-center gap-1.5 rounded-lg border border-(--theme-border-soft) bg-(--theme-surface) px-2.5 py-1 text-xs">
                          <Tag size={12} className="shrink-0 text-purple-400" />
                          <span className="text-(--theme-text-muted)">
                            Action:
                          </span>
                          <span className="font-bold uppercase tracking-wider text-(--theme-text-primary)">
                            {actionType.replace("_", " ")}
                          </span>
                        </div>
                      )}

                      {/* Scan Session ID */}
                      {scanSessionId && (
                        <div className="flex items-center gap-1.5 rounded-lg border border-(--theme-border-soft) bg-(--theme-surface) px-2.5 py-1 text-xs">
                          <ScanLine
                            size={12}
                            className="shrink-0 text-teal-400"
                          />
                          <span className="text-(--theme-text-muted)">
                            Session:
                          </span>
                          <span className="font-mono text-[11px] font-bold text-(--theme-text-secondary)">
                            #{scanSessionId.slice(0, 8)}
                          </span>
                        </div>
                      )}

                      {/* Exception details */}
                      {exceptionType && (
                        <div className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs text-rose-300">
                          <AlertTriangle size={12} />
                          <span className="font-bold">
                            Type: {exceptionType}
                          </span>
                          {exceptionSeverity && (
                            <span className="text-[11px]">
                              ({exceptionSeverity})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : !error ? (
        <div className="py-12 text-center text-sm font-semibold text-(--theme-text-secondary)">
          No activity logs found.
        </div>
      ) : null}

      {/* Pagination controls */}
      {pagination.pages > 1 && (
        <Pagination
          pageCount={pagination.pages}
          forcePage={page}
          onPageChange={({ selected }) => setPage(selected)}
          totalItems={pagination.total}
          itemsPerPage={LIMIT}
        />
      )}
    </Card>
  );
};

export default ActivityLogTab;

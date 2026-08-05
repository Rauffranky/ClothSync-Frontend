import { useEffect, useState, useRef } from "react";
import { Timer, X } from "lucide-react";
import Alert from "../../UI/Alert";
import Badge from "../../UI/Badge";
import Button from "../../UI/Button";
import { getApiErrorMessage } from "../../../axios/api";
import { testTenantBulkAddUndo, undoBulkScanAction } from "../../../axios/scanners/tenantBulkScan";
import useGlobalUndoNotices from "../../../Hooks/useGlobalUndoNotices";
import { getActiveBulkScanSessionId } from "../../../Utils/bulkScanSession";
import { toast } from "../../../Utils/toast";
import { getSocket } from "../../../socket/client";
import { SOCKET_EVENTS } from "../../../socket/events";
import { mergeUndoNotices } from "../../../Hooks/useGlobalUndoNotices";

const formatCountdown = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const getEventUndo = (payload) => payload?.data?.undo ?? payload?.undo ?? null;

const GlobalUndoBanners = ({ inline = false }) => {
  const [undoNotices, setUndoNotices] = useGlobalUndoNotices();
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [undoNow, setUndoNow] = useState(Date.now);
  const [undoingId, setUndoingId] = useState(null);
  const actionRequestControllerRef = useRef(null);

  useEffect(() => {
    if (undoNotices.length === 0) return undefined;
    const timer = window.setInterval(() => setUndoNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [undoNotices.length]);

  useEffect(() => {
    const socket = getSocket();

    const handleBulkAdded = (data) => {
      const undo = getEventUndo(data);
      if (undo?.id && undo?.expiresAt) {
        setUndoNotices((current) => mergeUndoNotices(current, [{ ...undo, kind: "bulk_add" }]));
      }
    };

    const handleBulkAddUndone = () => {
      setUndoNotices((current) => current.filter((item) => item.kind !== "bulk_add"));
    };

    const handleBulkAddExpired = () => {
      setUndoNotices((current) => current.filter((item) => item.kind !== "bulk_add"));
    };

    const handleSessionCleared = () => {
      setUndoNotices([]);
    };

    socket.on(SOCKET_EVENTS.SCAN_BULK_ADDED, handleBulkAdded);
    socket.on(SOCKET_EVENTS.SCAN_BULK_ADD_UNDONE, handleBulkAddUndone);
    socket.on(SOCKET_EVENTS.SCAN_BULK_ADD_EXPIRED, handleBulkAddExpired);
    socket.on(SOCKET_EVENTS.SCAN_SESSION_CLEARED, handleSessionCleared);

    return () => {
      socket.off(SOCKET_EVENTS.SCAN_BULK_ADDED, handleBulkAdded);
      socket.off(SOCKET_EVENTS.SCAN_BULK_ADD_UNDONE, handleBulkAddUndone);
      socket.off(SOCKET_EVENTS.SCAN_BULK_ADD_EXPIRED, handleBulkAddExpired);
      socket.off(SOCKET_EVENTS.SCAN_SESSION_CLEARED, handleSessionCleared);
    };
  }, [setUndoNotices]);

  const handleUndo = async (undoNotice) => {
    const sessionId = getActiveBulkScanSessionId();
    if (!sessionId || !undoNotice?.id || undoingId) return;

    const controller = new AbortController();
    actionRequestControllerRef.current = controller;
    setUndoingId(undoNotice.id);
    try {
      const response = undoNotice.kind === "action"
        ? await undoBulkScanAction(sessionId, undoNotice.id, { signal: controller.signal })
        : await testTenantBulkAddUndo(sessionId, undoNotice.id);

      setUndoNotices((current) => current.filter((item) => item.id !== undoNotice.id));
      toast.success(response?.message || "Undo completed successfully");
    } catch (error) {
      const status = error?.response?.status;
      if (undoNotice.kind === "action" && [404, 409, 410, 422].includes(status)) {
        setUndoNotices((current) => current.filter((item) => item.id !== undoNotice.id));
      }
      toast.error(getApiErrorMessage(error, "Unable to undo this action"));
    } finally {
      if (actionRequestControllerRef.current === controller) {
        actionRequestControllerRef.current = null;
      }
      setUndoingId(null);
    }
  };

  if (undoNotices.length === 0) return null;

  return (
    <div
      className={
        inline
          ? "w-full"
          : "fixed bottom-6 right-6 z-999 flex max-w-[90vw] flex-col gap-3 md:max-w-md"
      }
    >
      {undoNotices.map((notice) => {
        const expiry = Date.parse(notice.expiresAt);
        const remainingSeconds = Number.isNaN(expiry)
          ? 0
          : Math.max(0, Math.ceil((expiry - undoNow) / 1_000));
        
        if (remainingSeconds <= 0 || dismissedIds.has(notice.id)) {
           return null;
        }

        const actionLabel = notice.action === "check_in"
          ? "Check In"
          : notice.action === "check_out"
            ? "Check Out"
            : null;

        return (
          <div key={notice.id} className={inline ? "px-4 pt-4" : "card-glass-inner rounded-2xl overflow-hidden"}>
            <Alert size="sm" variant="danger" leftIcon={!inline ? <Timer aria-hidden="true" size={18} /> : undefined}>
              {inline ? (
                <div className="flex w-full flex-wrap items-center justify-between gap-3">
                  <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                    <Timer aria-hidden="true" size={18} className="shrink-0 text-(--color-overdue)" />
                    {notice.message && <span>{notice.message}</span>}
                    {notice.laundryName && <Badge variant="info">{notice.laundryName}</Badge>}
                    {notice.batchCode && <Badge variant="info">Batch {notice.batchCode}</Badge>}
                    <span>Undo available for</span>
                    <Badge className="font-mono text-sm" size="md" variant="danger">
                      {formatCountdown(remainingSeconds)}
                    </Badge>
                  </span>
                  <div className="flex shrink-0 items-center gap-3">
                    <Button
                      disabled={remainingSeconds <= 0 || Boolean(undoingId)}
                      loading={undoingId === notice.id}
                      onClick={() => handleUndo(notice)}
                      size="sm"
                      variant="danger"
                    >
                      {notice.kind === "bulk_add"
                        ? "Undo Bulk Add"
                        : `Undo${actionLabel ? ` ${actionLabel}` : ""}`}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex w-full flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-2">
                      {notice.message && <span className="text-sm font-medium leading-relaxed">{notice.message}</span>}
                      {(notice.laundryName || notice.batchCode) && (
                        <div className="flex flex-wrap items-center gap-2">
                          {notice.laundryName && <Badge variant="info">{notice.laundryName}</Badge>}
                          {notice.batchCode && <Badge variant="info">Batch {notice.batchCode}</Badge>}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="cursor-pointer shrink-0 text-(--color-overdue) opacity-70 hover:opacity-100 transition-opacity"
                      onClick={() => setDismissedIds((prev) => new Set(prev).add(notice.id))}
                      aria-label="Dismiss undo notice"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <span className="flex items-center text-sm font-medium">
                      Undo available for
                      <Badge className="ml-2 font-mono text-sm" size="md" variant="danger">
                        {formatCountdown(remainingSeconds)}
                      </Badge>
                    </span>
                    <Button
                      className="shrink-0"
                      disabled={remainingSeconds <= 0 || Boolean(undoingId)}
                      loading={undoingId === notice.id}
                      onClick={() => handleUndo(notice)}
                      size="sm"
                      variant="danger"
                    >
                      {notice.kind === "bulk_add"
                        ? "Undo Bulk Add"
                        : `Undo${actionLabel ? ` ${actionLabel}` : ""}`}
                    </Button>
                  </div>
                </div>
              )}
            </Alert>
          </div>
        );
      })}
    </div>
  );
};

export default GlobalUndoBanners;

import { useEffect, useState, useRef } from "react";

import { getApiErrorMessage } from "../../../axios/api";
import { testTenantBulkAddUndo, undoBulkScanAction } from "../../../axios/scanners/tenantBulkScan";
import useGlobalUndoNotices from "../../../Hooks/useGlobalUndoNotices";
import { getActiveBulkScanSessionId } from "../../../Utils/bulkScanSession";
import { toast } from "../../../Utils/toast";
import { getSocket } from "../../../socket/client";
import { SOCKET_EVENTS } from "../../../socket/events";
import { mergeUndoNotices } from "../../../Hooks/useGlobalUndoNotices";
import BulkScanUndoNotification from "./BulkScanUndoNotification";

const getEventUndoNotice = (data) => {
  const payload = data?.data ?? data ?? {};
  const notif = payload.notification ?? {};
  const undo = notif.undo ?? payload.undo ?? null;
  if (!undo?.id || !undo?.expiresAt) return null;
  
  return {
    ...undo,
    kind: "bulk_add",
    tagCount: notif.tagCount ?? payload.processedCount ?? 0,
    assetName: notif.assetName ?? payload.asset?.assetName ?? null,
  };
};

const GlobalUndoBanners = ({ inline = false }) => {
  const [undoNotices, setUndoNotices] = useGlobalUndoNotices();
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [undoingId, setUndoingId] = useState(null);
  const actionRequestControllerRef = useRef(null);



  useEffect(() => {
    const socket = getSocket();

    const handleBulkAdded = (data) => {
      const notice = getEventUndoNotice(data);
      if (notice) {
        setUndoNotices((current) => mergeUndoNotices(current, [notice]));
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
      
      // Dispatch an event so BulkScanningIndex can trigger a manual fetch
      // if it's currently mounted and needs to refresh its entries.
      window.dispatchEvent(new CustomEvent("bulk-scan-undo-success", { detail: { undoId: undoNotice.id } }));
    } catch (error) {
      const status = error?.response?.status;
      if (undoNotice.kind === "action" && [404, 409, 410].includes(status)) {
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

  const handleDismiss = (id) => {
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  return (
    <div
      className={
        inline
          ? "w-full"
          : "fixed bottom-6 right-6 z-999 flex max-w-[90vw] flex-col gap-3 md:max-w-md"
      }
    >
      {undoNotices.map((notice) => {
        if (dismissedIds.has(notice.id)) return null;

        return (
          <BulkScanUndoNotification
            key={notice.id}
            notice={notice}
            inline={inline}
            onDismiss={handleDismiss}
            onUndo={handleUndo}
            isUndoing={undoingId === notice.id}
          />
        );
      })}
    </div>
  );
};

export default GlobalUndoBanners;

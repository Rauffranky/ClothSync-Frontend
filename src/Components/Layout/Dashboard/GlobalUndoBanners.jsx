import { useEffect, useState, useRef } from "react";

import { getApiErrorMessage } from "../../../axios/api";
import { testTenantBulkAddUndo, undoBulkScanAction } from "../../../axios/scanners/tenantBulkScan";
import { undoLaundryScanAction } from "../../../axios/scanners/laundryScanners";
import useGlobalUndoNotices from "../../../Hooks/useGlobalUndoNotices";
import { getActiveBulkScanSessionId } from "../../../Utils/bulkScanSession";
import {
  captureLaundryScanEvent,
  getActiveLaundryScan,
} from "../../../Utils/laundryScanSession";
import { normalizeAutomaticScanUndoNotices } from "../../../Utils/scanUndo";
import { toast } from "../../../Utils/toast";
import { getSocket } from "../../../socket/client";
import { SOCKET_EVENTS } from "../../../socket/events";
import { mergeUndoNotices } from "../../../Hooks/useGlobalUndoNotices";
import BulkScanUndoNotification from "./BulkScanUndoNotification";

const getEventUndoNotice = (data) => {
  const payload = data?.data ?? data ?? {};
  const notif = payload.notification ?? {};
  const undo = notif.undo ?? payload.undo ?? null;
  if (!undo?.id || !undo?.expiresAt || Number(notif.tagCount ?? payload.processedTagCount ?? payload.processedCount ?? 0) <= 0) return null;
  
  return {
    ...undo,
    kind: "bulk_add",
    tagCount: notif.tagCount ?? payload.processedCount ?? 0,
    assetName: notif.assetName ?? payload.asset?.assetName ?? null,
  };
};

const GlobalUndoBanners = ({ inline = false, portal = null }) => {
  const [undoNotices, setUndoNotices] = useGlobalUndoNotices();
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [undoingId, setUndoingId] = useState(null);
  const [activeLaundryId, setActiveLaundryId] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const actionRequestControllerRef = useRef(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);


  useEffect(() => {
    const socket = getSocket();

    const applySocketState = (state) => {
      if (portal === "laundry") setActiveLaundryId(state?.laundryId || null);
    };

    const handleBulkAdded = (data) => {
      const notice = getEventUndoNotice(data);
      if (notice) {
        setUndoNotices((current) => mergeUndoNotices(current, [notice]));
      }
    };

    const handleAutomaticAction = (data) => {
      const notices = normalizeAutomaticScanUndoNotices(data, portal);
      if (notices.length > 0) {
        if (portal === "laundry") captureLaundryScanEvent(data);
        setUndoNotices((current) => mergeUndoNotices(current, notices));
      }
    };

    const handleAnyScanEvent = (_eventName, ...args) => {
      args.forEach((data) => handleAutomaticAction(data));
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
    socket.on(SOCKET_EVENTS.SCANNER_SCAN_BULK, handleAutomaticAction);
    socket.on(SOCKET_EVENTS.SCAN_SESSION_UPDATED, handleAutomaticAction);
    socket.on(SOCKET_EVENTS.SCAN_BULK_ADD_UNDONE, handleBulkAddUndone);
    socket.on(SOCKET_EVENTS.SCAN_BULK_ADD_EXPIRED, handleBulkAddExpired);
    socket.on(SOCKET_EVENTS.SCAN_SESSION_CLEARED, handleSessionCleared);
    socket.onAny(handleAnyScanEvent);
    socket.on(SOCKET_EVENTS.CONNECTED, applySocketState);
    if (portal === "laundry") socket.emit("socket.state", applySocketState);

    return () => {
      socket.off(SOCKET_EVENTS.SCAN_BULK_ADDED, handleBulkAdded);
      socket.off(SOCKET_EVENTS.SCANNER_SCAN_BULK, handleAutomaticAction);
      socket.off(SOCKET_EVENTS.SCAN_SESSION_UPDATED, handleAutomaticAction);
      socket.off(SOCKET_EVENTS.SCAN_BULK_ADD_UNDONE, handleBulkAddUndone);
      socket.off(SOCKET_EVENTS.SCAN_BULK_ADD_EXPIRED, handleBulkAddExpired);
      socket.off(SOCKET_EVENTS.SCAN_SESSION_CLEARED, handleSessionCleared);
      socket.offAny(handleAnyScanEvent);
      socket.off(SOCKET_EVENTS.CONNECTED, applySocketState);
    };
  }, [portal, setUndoNotices]);

  const handleUndo = async (undoNotice) => {
    const sessionId =
      undoNotice.sessionId ||
      (undoNotice.portal === "laundry"
        ? getActiveLaundryScan()?.sessionId
        : getActiveBulkScanSessionId());
    if (!undoNotice?.id || undoingId) return;
    if (!sessionId) {
      toast.error(
        `Unable to undo because the ${undoNotice.portal === "laundry" ? "Laundry " : ""}scan session was not provided`,
      );
      return;
    }

    const controller = new AbortController();
    actionRequestControllerRef.current = controller;
    setUndoingId(undoNotice.id);
    try {
      const response = undoNotice.kind === "action"
        ? undoNotice.portal === "laundry"
          ? await undoLaundryScanAction(sessionId, undoNotice.id, { signal: controller.signal })
          : await undoBulkScanAction(sessionId, undoNotice.id, { signal: controller.signal })
        : await testTenantBulkAddUndo(sessionId, undoNotice.id);

      setUndoNotices((current) => current.filter((item) => item.id !== undoNotice.id));
      toast.success(response?.message || "Undo completed successfully");
      
      // Dispatch an event so BulkScanningIndex can trigger a manual fetch
      // if it's currently mounted and needs to refresh its entries.
      window.dispatchEvent(new CustomEvent("bulk-scan-undo-success", {
        detail: { undoId: undoNotice.id, portal: undoNotice.portal || "business" },
      }));
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

  const visibleNotices = undoNotices.filter((notice) => {
    const noticePortal = notice.portal || "business";
    return noticePortal === (portal || "business") &&
      (portal !== "laundry" || (activeLaundryId && notice.laundryId === activeLaundryId));
  });
  const hasExpiredNotices = visibleNotices.some(
    (notice) => notice.expiresAt && new Date(notice.expiresAt).getTime() <= now,
  );
  const clearExpired = () => {
    setUndoNotices((current) =>
      current.filter(
        (notice) =>
          !notice.expiresAt || new Date(notice.expiresAt).getTime() > Date.now(),
      ),
    );
    setDismissedIds(new Set());
  };

  return (
    <div
      className={
        inline
          ? "w-full"
          : "fixed bottom-6 right-6 z-999 flex max-w-[90vw] flex-col gap-3 md:max-w-md"
      }
    >
      {portal === "laundry" && hasExpiredNotices && (
        <button
          className="self-end rounded-lg border border-(--color-overdue)/40 bg-(--theme-surface) px-3 py-2 text-xs font-bold text-(--color-overdue) shadow-sm"
          onClick={clearExpired}
          type="button"
        >
          Clear expired notices
        </button>
      )}
      {undoNotices.map((notice) => {
        const noticePortal = notice.portal || "business";
        const activePortal = portal || "business";
        if (noticePortal !== activePortal) return null;
        if (
          activePortal === "laundry" &&
          (!activeLaundryId || notice.laundryId !== activeLaundryId)
        ) return null;
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

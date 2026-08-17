import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useSocketEvent from "../../../Hooks/useSocketEvent";
import { SOCKET_EVENTS } from "../../../socket/events";
import {
  getActiveBulkScanUndoNotices,
  setActiveBulkScanSessionId,
  setActiveBulkScanUndoNotices,
} from "../../../Utils/bulkScanSession";
import { captureLaundryScanEvent } from "../../../Utils/laundryScanSession";
import { normalizeAutomaticScanUndoNotices } from "../../../Utils/scanUndo";

const getSessionId = (payload) =>
  payload?.data?.data?.session?.id ??
  payload?.data?.session?.id ??
  payload?.session?.id ??
  payload?.data?.data?.sessionId ??
  payload?.data?.sessionId ??
  payload?.sessionId ??
  null;

const LiveScanRedirect = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const openLiveScan = useCallback(
    (payload) => {
      const portal = pathname.startsWith("/laundry") ? "laundry" : "business";
      const notices = normalizeAutomaticScanUndoNotices(payload, portal);
      if (notices.length > 0) {
        const byId = new Map(
          getActiveBulkScanUndoNotices().map((notice) => [notice.id, notice]),
        );
        notices.forEach((notice) => byId.set(notice.id, notice));
        setActiveBulkScanUndoNotices([...byId.values()]);
      }

      const sessionId = getSessionId(payload);
      if (!sessionId) return;

      if (pathname.startsWith("/business")) {
        setActiveBulkScanSessionId(sessionId);
        navigate("/business/bulk-scanning");
        return;
      }

      if (pathname.startsWith("/laundry")) {
        captureLaundryScanEvent(payload);
        navigate("/laundry/incoming-batches");
      }
    },
    [navigate, pathname],
  );

  useSocketEvent(SOCKET_EVENTS.SCAN_SESSION_STARTED, openLiveScan);
  useSocketEvent(SOCKET_EVENTS.SCANNER_SCAN_BULK, openLiveScan);

  return null;
};

export default LiveScanRedirect;

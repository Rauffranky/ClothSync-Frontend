import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useSocketEvent from "../../../Hooks/useSocketEvent";
import { SOCKET_EVENTS } from "../../../socket/events";
import { setActiveBulkScanSessionId } from "../../../Utils/bulkScanSession";

const getSessionId = (payload) =>
  payload?.data?.session?.id ??
  payload?.session?.id ??
  payload?.data?.sessionId ??
  payload?.sessionId ??
  null;

const LiveBulkScanRedirect = () => {
  const navigate = useNavigate();

  const openLiveSession = useCallback(
    (payload) => {
      const sessionId = getSessionId(payload);
      if (!sessionId) return;

      setActiveBulkScanSessionId(sessionId);
      navigate("/business/bulk-scanning");
    },
    [navigate],
  );

  useSocketEvent(SOCKET_EVENTS.SCAN_SESSION_STARTED, openLiveSession);
  useSocketEvent(SOCKET_EVENTS.SCANNER_SCAN_BULK, openLiveSession);

  return null;
};

export default LiveBulkScanRedirect;

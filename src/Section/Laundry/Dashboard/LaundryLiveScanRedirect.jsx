import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useSocketEvent from "../../../Hooks/useSocketEvent";
import { SOCKET_EVENTS } from "../../../socket/events";

const getSessionId = (payload) =>
  payload?.data?.session?.id ??
  payload?.session?.id ??
  payload?.data?.sessionId ??
  payload?.sessionId ??
  null;

const LaundryLiveScanRedirect = () => {
  const navigate = useNavigate();

  const openBatches = useCallback(
    (payload) => {
      if (!getSessionId(payload)) return;
      navigate("/laundry/incoming-batches");
    },
    [navigate],
  );

  useSocketEvent(SOCKET_EVENTS.SCAN_SESSION_STARTED, openBatches);
  useSocketEvent(SOCKET_EVENTS.SCANNER_SCAN_BULK, openBatches);

  return null;
};

export default LaundryLiveScanRedirect;

import { useCallback, useEffect, useState } from "react";
import { Eraser, Plus, Radio, Undo2 } from "lucide-react";
import Button from "../../../Components/UI/Button";
import useSocketEvent from "../../../Hooks/useSocketEvent";
import { getApiErrorMessage } from "../../../axios/api";
import {
  clearTenantBulkScanSession,
  testTenantBulkAdd,
  testTenantBulkAddUndo,
  testTenantScannerScan,
} from "../../../axios/scanners/tenantBulkScan";
import { SOCKET_EVENTS } from "../../../socket/events";
import { getSocket } from "../../../socket/client";
import { toast } from "../../../Utils/toast";

const TEST_SCAN_PAYLOAD = Object.freeze({
  scannerId: "7cd8b2d0-1299-4717-8ef3-242581519715",
  epcs: Object.freeze(["TEST-EPC-008"]),
});

const TEST_BULK_ADD_PAYLOAD = Object.freeze({
  assetName: "Test Towels",
  categoryId: "c4a46dde-04fd-4858-b827-82456a756361",
  zoneName: "Test Zone",
  washLimit: 100,
  description: "Socket testing asset",
});

const UNDO_WINDOW_SECONDS = 120;

const TestScannerScanButton = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [undoSecondsRemaining, setUndoSecondsRemaining] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [undoId, setUndoId] = useState(null);

  useEffect(() => {
    if (undoSecondsRemaining <= 0) return undefined;

    const timer = window.setTimeout(() => {
      setUndoSecondsRemaining((seconds) => Math.max(0, seconds - 1));
    }, 1_000);

    return () => window.clearTimeout(timer);
  }, [undoSecondsRemaining]);

  const handleBulkScanEvent = useCallback((data) => {
    console.log("SCANNER BULK EVENT:", data);
    console.log("TOTAL:", data?.session?.totalTagsCount);
    console.log("SCAN COUNT:", data?.results?.[0]?.scannedTag?.scanCount);
  }, []);

  const handleSessionUpdatedEvent = useCallback((data) => {
    console.log("SESSION UPDATED EVENT:", data);
  }, []);

  const handleBulkAddedEvent = useCallback((data) => {
    console.log("BULK ADDED EVENT:", data);
  }, []);

  const handleBulkAddUndoneEvent = useCallback((data) => {
    console.log("BULK ADD UNDONE EVENT:", data);
  }, []);

  const handleSessionClearedEvent = useCallback((data) => {
    console.log("CLEAR EVENT:", data);
  }, []);

  useSocketEvent(SOCKET_EVENTS.SCANNER_SCAN_BULK, handleBulkScanEvent);
  useSocketEvent(
    SOCKET_EVENTS.SCAN_SESSION_UPDATED,
    handleSessionUpdatedEvent,
  );
  useSocketEvent(SOCKET_EVENTS.SCAN_BULK_ADDED, handleBulkAddedEvent);
  useSocketEvent(
    SOCKET_EVENTS.SCAN_BULK_ADD_UNDONE,
    handleBulkAddUndoneEvent,
  );
  useSocketEvent(
    SOCKET_EVENTS.SCAN_SESSION_CLEARED,
    handleSessionClearedEvent,
  );

  const handleTestScan = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await testTenantScannerScan(TEST_SCAN_PAYLOAD);
      const sessionId = response?.data?.session?.id;

      if (!sessionId) {
        throw new Error(
          "Test scan succeeded, but the response did not include data.session.id",
        );
      }

      setSessionId(sessionId);
      getSocket().emit(SOCKET_EVENTS.SCAN_SESSION_JOIN, { sessionId });
      toast.success(response?.message || "Test scanner scan sent successfully");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to send the test scanner scan"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestBulkAdd = async () => {
    if (isBulkAdding || !sessionId) return;

    setIsBulkAdding(true);
    try {
      const response = await testTenantBulkAdd(
        sessionId,
        TEST_BULK_ADD_PAYLOAD,
      );
      const undo = response?.data?.undo;
      if (undo?.canUndo && undo?.id) {
        const expiresAtTime = Date.parse(undo.expiresAt);
        const expirySeconds = Number.isNaN(expiresAtTime)
          ? undo.windowSeconds || UNDO_WINDOW_SECONDS
          : Math.max(0, Math.ceil((expiresAtTime - Date.now()) / 1_000));

        setUndoId(undo.id);
        setUndoSecondsRemaining(expirySeconds);
      } else {
        console.warn("BULK ADD RESPONSE DID NOT INCLUDE AN UNDO ID:", response);
      }
      toast.success(response?.message || "Test bulk add completed successfully");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to run the test bulk add"));
    } finally {
      setIsBulkAdding(false);
    }
  };

  const handleTestBulkAddUndo = async () => {
    if (isUndoing || undoSecondsRemaining <= 0 || !sessionId || !undoId) return;

    setIsUndoing(true);
    try {
      const response = await testTenantBulkAddUndo(
        sessionId,
        undoId,
      );
      setUndoSecondsRemaining(0);
      setUndoId(null);
      toast.success(response?.message || "Test bulk add undone successfully");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to undo the test bulk add"));
    } finally {
      setIsUndoing(false);
    }
  };

  const handleClearSession = async () => {
    if (isClearing || !sessionId) return;

    setIsClearing(true);
    try {
      const response = await clearTenantBulkScanSession(sessionId);
      setSessionId(null);
      setUndoId(null);
      setUndoSecondsRemaining(0);
      toast.success(response?.message || "Test scan session cleared successfully");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to clear the test scan session"));
    } finally {
      setIsClearing(false);
    }
  };

  const undoMinutes = Math.floor(undoSecondsRemaining / 60);
  const undoSeconds = String(undoSecondsRemaining % 60).padStart(2, "0");

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        leftIcon={<Radio size={16} />}
        loading={isSubmitting}
        onClick={handleTestScan}
        size="sm"
        variant="warning"
      >
        Test Scanner Scan
      </Button>
      <Button
        disabled={!sessionId}
        leftIcon={<Plus size={16} />}
        loading={isBulkAdding}
        onClick={handleTestBulkAdd}
        size="sm"
        variant="secondary"
      >
        {sessionId ? "Test Bulk Add" : "Run Test Scan First"}
      </Button>
      <Button
        disabled={undoSecondsRemaining <= 0 || !sessionId || !undoId}
        leftIcon={<Undo2 size={16} />}
        loading={isUndoing}
        onClick={handleTestBulkAddUndo}
        size="sm"
        variant="danger"
      >
        {undoSecondsRemaining > 0
          ? `Undo Bulk Add (${undoMinutes}:${undoSeconds})`
          : "Undo Window Expired"}
      </Button>
      <Button
        disabled={!sessionId}
        leftIcon={<Eraser size={16} />}
        loading={isClearing}
        onClick={handleClearSession}
        size="sm"
        variant="outline"
      >
        Clear Session
      </Button>
    </div>
  );
};

export default TestScannerScanButton;

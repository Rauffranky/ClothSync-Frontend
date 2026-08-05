import { useCallback, useState } from "react";
import { Eraser, Plus, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../../Components/UI/Button";
import useSocketEvent from "../../../Hooks/useSocketEvent";
import { getApiErrorMessage } from "../../../axios/api";
import {
  clearTenantBulkScanSession,
  testTenantBulkAdd,
} from "../../../axios/scanners/tenantBulkScan";
import { SOCKET_EVENTS } from "../../../socket/events";
import { toast } from "../../../Utils/toast";
import { setActiveBulkScanSessionId } from "../../../Utils/bulkScanSession";
import useGlobalUndoNotices, { mergeUndoNotices } from "../../../Hooks/useGlobalUndoNotices";

const TEST_SCAN_PAYLOAD = Object.freeze({
  scannerId: "ad27d052-f553-4ecf-ab4c-54a878ae2cc9",
  epcs: Object.freeze([
  "TEST-EPC-1",
  "TEST-EPC-2",
  "TEST-EPC-3",
  "TEST-EPC-4",
  "TEST-EPC-5",
  ]),
});

const TEST_BULK_ADD_PAYLOAD = Object.freeze({
  assetName: "Test Towels",
  categoryId: "c4a46dde-04fd-4858-b827-82456a756361",
  zoneName: "Test Zone",
  washLimit: 100,
  description: "Socket testing asset",
});


const TestScannerScanButton = () => {
  const navigate = useNavigate();
  const [, setUndoNotices] = useGlobalUndoNotices();
  const [isResolvingScannerMode, setIsResolvingScannerMode] = useState(false);
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [sessionId, setSessionId] = useState(null);

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
    if (isResolvingScannerMode) return;

    setIsResolvingScannerMode(true);
    try {
      const scanPayload = {
        ...TEST_SCAN_PAYLOAD,
        epcs: [...TEST_SCAN_PAYLOAD.epcs],
      };

      navigate("/business/bulk-scanning", {
        state: { automaticTestScan: { payload: scanPayload } },
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to determine scanner mode"));
    } finally {
      setIsResolvingScannerMode(false);
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
        setUndoNotices((current) => mergeUndoNotices(current, [{ ...undo, kind: "bulk_add" }]));
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


  const handleClearSession = async () => {
    if (isClearing || !sessionId) return;

    setIsClearing(true);
    try {
      const response = await clearTenantBulkScanSession(sessionId);
      setSessionId(null);
      setActiveBulkScanSessionId(null);
      toast.success(response?.message || "Test scan session cleared successfully");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to clear the test scan session"));
    } finally {
      setIsClearing(false);
    }
  };


  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        leftIcon={<Radio size={16} />}
        loading={isResolvingScannerMode}
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

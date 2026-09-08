import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import CardSkeleton from "../../../Components/UI/CardSkeleton";
import Tabs from "../../../Components/UI/Tabs";
import { toast } from "../../../Utils/toast";
import {
  getIncomingBatchDetails as fetchIncomingBatchDetails,
  receiveLaundryDispatchBatch,
} from "../../../axios/batches/laundryBatches";
import {
  clearLaundryScannerSession,
  finishLaundryScannerSession,
  getLaundryScannerSessionHistory,
  getLaundryScanners,
  issueLaundryFixedScannerCommand,
  startLaundryScannerSession,
} from "../../../axios/scanners/laundryScanners";
import { useSocketEvents } from "../../../Hooks/useSocketEvent";
import { SOCKET_EVENTS } from "../../../socket/events";
import {
  captureLaundryScanEvent,
  clearActiveLaundryScan,
  getActiveLaundryScan,
} from "../../../Utils/laundryScanSession";
import {
  getIncomingBatchDetails,
  getLaundryBatchErrorMessage,
  normalizeReceiptResponse,
} from "../IncomingBatches/data";
import BatchActionsPanel from "./components/BatchActionsPanel";
import BatchHeader from "./components/BatchHeader";
import BatchItemsTab from "./components/BatchItemsTab";
import BatchMetrics from "./components/BatchMetrics";
import LiveScanComparison from "./components/LiveScanComparison";
import SessionHistoryTab from "./components/SessionHistoryTab";

const LIVE_SCAN_EVENTS = [
  SOCKET_EVENTS.SCANNER_SCAN_BULK,
  SOCKET_EVENTS.SCAN_SESSION_UPDATED,
  SOCKET_EVENTS.SCAN_ENTRIES_UPDATED,
  SOCKET_EVENTS.SCAN_SESSION_FINISHED,
];

const LaundryBatchDetails = ({ checkoutMode = false }) => {
  const { id } = useParams();
  const [batch, setBatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState("items");
  const [liveScan, setLiveScan] = useState(getActiveLaundryScan);

  // Operational states
  const [remainingChoice, setRemainingChoice] = useState("wait");
  const [isReceiving, setIsReceiving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [receipt, setReceipt] = useState(null);

  // Scanners
  const [scanners, setScanners] = useState([]);
  const [selectedScannerId, setSelectedScannerId] = useState(null);

  // Session History
  const [history, setHistory] = useState({ items: [], pagination: {} });
  const [historyPage, setHistoryPage] = useState(1);

  // Load Batch Details
  const loadBatch = useCallback(
    async (showLoading = true) => {
      if (!id) return;
      if (showLoading) setIsLoading(true);
      setLoadError("");
      try {
        const response = await fetchIncomingBatchDetails(id);
        setBatch(getIncomingBatchDetails(response));
      } catch (error) {
        if (error?.status === 404 || error?.response?.status === 404) {
          clearActiveLaundryScan();
          setLiveScan(null);
        }
        setLoadError(
          getLaundryBatchErrorMessage(error, "Unable to load batch details"),
        );
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    loadBatch(true);
  }, [loadBatch]);

  // Load Scanners
  useEffect(() => {
    let cancelled = false;
    getLaundryScanners({ status: "active", limit: 100 })
      .then((response) => {
        if (!cancelled) {
          setScanners((response?.data?.data ?? response?.data)?.items || []);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Load Session History
  const loadHistory = useCallback(async () => {
    if (!id) return;
    try {
      const response = await getLaundryScannerSessionHistory(id, {
        page: historyPage,
        limit: 10,
      });
      setHistory(
        response?.data?.data ?? response?.data ?? { items: [], pagination: {} },
      );
    } catch {
      setHistory({ items: [], pagination: {} });
    }
  }, [id, historyPage]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Real-time Socket Event Handling
  const handleLiveScanEvent = useCallback(
    (payload) => {
      const nextScan = captureLaundryScanEvent(payload);
      setLiveScan(nextScan);
      loadBatch(false);
      loadHistory();
    },
    [loadBatch, loadHistory],
  );

  useSocketEvents(LIVE_SCAN_EVENTS, handleLiveScanEvent);

  // Scanners compatibility
  const sessionPurpose = checkoutMode ? "outbound" : "receipt";
  const compatibleScanners = useMemo(
    () =>
      scanners.filter((scanner) =>
        checkoutMode
          ? scanner.scannerMode !== "entry"
          : scanner.scannerMode !== "exit",
      ),
    [scanners, checkoutMode],
  );

  const compatibleScannerIds = useMemo(
    () => new Set(compatibleScanners.map((s) => s.id)),
    [compatibleScanners],
  );

  const scannerId =
    selectedScannerId ||
    (compatibleScannerIds.has(liveScan?.scannerId) ? liveScan.scannerId : null) ||
    (compatibleScanners[0]?.id ?? null);

  const selectedScanner = compatibleScanners.find((s) => s.id === scannerId);
  const fixedScanner =
    selectedScanner?.scannerType === "fixed" ? selectedScanner : null;

  const canStartSession = checkoutMode
    ? ["at_laundry", "washed"].includes(batch?.statusValue)
    : Number(batch?.pendingCount || 0) > 0;

  const liveScanMatchesBatch = Boolean(
    liveScan?.sessionId && (!liveScan.batchId || liveScan.batchId === id),
  );

  const receivedTagIds = useMemo(
    () =>
      liveScanMatchesBatch ? [...new Set(liveScan?.tagIds || [])] : [],
    [liveScanMatchesBatch, liveScan?.tagIds],
  );
  const receivedTagIdSet = useMemo(
    () => new Set(receivedTagIds),
    [receivedTagIds],
  );

  const remainingItems = useMemo(
    () =>
      (batch?.items || []).filter(
        (item) =>
          item.tagId &&
          !receivedTagIdSet.has(item.tagId) &&
          item.statusValue === "sent",
      ),
    [batch?.items, receivedTagIdSet],
  );

  const receivedItems = useMemo(
    () =>
      (batch?.items || []).filter(
        (item) =>
          item.tagId &&
          (receivedTagIdSet.has(item.tagId) ||
            ["at_laundry", "washed", "sent_to_business", "returned"].includes(
              item.statusValue,
            )),
      ),
    [batch?.items, receivedTagIdSet],
  );

  const missingTagIds = useMemo(
    () =>
      remainingChoice === "missing"
        ? remainingItems.map((item) => item.tagId)
        : [],
    [remainingChoice, remainingItems],
  );

  const counters = receipt || batch;
  const hasPendingItems =
    Number(counters?.pendingCount ?? batch?.pendingCount ?? 0) > 0;

  // Actions Handlers
  const handleFixedCommand = async (command) => {
    if (!fixedScanner) return;
    try {
      await issueLaundryFixedScannerCommand(fixedScanner.id, command);
      toast.success(`Fixed scanner ${command} command sent`);
    } catch (error) {
      toast.error(
        getLaundryBatchErrorMessage(error, "Unable to send scanner command"),
      );
    }
  };

  const handleContinueScanning = async () => {
    if (!id || !scannerId || isContinuing) return;
    setIsContinuing(true);
    try {
      const response = await startLaundryScannerSession(
        scannerId,
        id,
        sessionPurpose,
      );
      captureLaundryScanEvent(response);
      setLiveScan(getActiveLaundryScan());
      if (fixedScanner) {
        await issueLaundryFixedScannerCommand(fixedScanner.id, "start");
      }
      toast.success(
        checkoutMode
          ? "Checkout scan is ready. Scan tags through the scanner."
          : "Receipt scan session is ready. Scan incoming tags.",
      );
      loadBatch(false);
      loadHistory();
    } catch (error) {
      toast.error(
        getLaundryBatchErrorMessage(error, "Unable to start scan session"),
      );
    } finally {
      setIsContinuing(false);
    }
  };

  const handleClearScanData = async () => {
    if (!liveScan?.sessionId || isClearing) return;
    setIsClearing(true);
    try {
      await clearLaundryScannerSession(liveScan.sessionId);
      clearActiveLaundryScan();
      setLiveScan(null);
      toast.success("Active scan data cleared successfully.");
      loadBatch(false);
      loadHistory();
    } catch (error) {
      toast.error(
        getLaundryBatchErrorMessage(error, "Unable to clear scan data"),
      );
    } finally {
      setIsClearing(false);
    }
  };

  const handleFinishSession = async () => {
    if (!liveScan?.sessionId || isFinishing) return;
    setIsFinishing(true);
    try {
      await finishLaundryScannerSession(liveScan.sessionId);
      clearActiveLaundryScan();
      setLiveScan(null);
      toast.success(
        checkoutMode
          ? "Checkout scan session finished."
          : "Receipt scan session finished.",
      );
      loadBatch(false);
      loadHistory();
    } catch (error) {
      toast.error(
        getLaundryBatchErrorMessage(error, "Unable to finish scan session"),
      );
    } finally {
      setIsFinishing(false);
    }
  };

  const handleReceive = async () => {
    if (!id || !liveScan?.sessionId || isReceiving) return;
    setIsReceiving(true);
    try {
      const response = await receiveLaundryDispatchBatch(id, {
        scanSessionId: liveScan.sessionId,
        tagIds: receivedTagIds,
        missingTagIds,
      });
      const normalized = normalizeReceiptResponse(response);
      setReceipt(normalized);
      toast.success("Batch receipt confirmed successfully.");
      loadBatch(false);
      loadHistory();
    } catch (error) {
      toast.error(
        getLaundryBatchErrorMessage(error, "Unable to confirm batch receipt"),
      );
    } finally {
      setIsReceiving(false);
    }
  };

  const backPath = checkoutMode ? "/laundry/check-out" : "/laundry/incoming-batches";
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <Button
          className="w-fit"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate(backPath)}
          size="sm"
          variant="outline"
        >
          {checkoutMode ? "Back to Check-Out" : "Back to Batches"}
        </Button>
        <CardSkeleton lines={3} />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} lines={2} />
          ))}
        </div>
        <CardSkeleton lines={6} />
      </div>
    );
  }

  if (loadError || !batch) {
    return (
      <div className="space-y-6">
        <Button
          className="w-fit"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate(backPath)}
          size="sm"
          variant="outline"
        >
          {checkoutMode ? "Back to Check-Out" : "Back to Batches"}
        </Button>
        <Alert variant="danger">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{loadError || "Batch details are unavailable"}</span>
            <Button onClick={() => loadBatch(true)} variant="outline">
              Retry
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  const tabs = [
    {
      label: `All Items (${batch.items?.length || 0})`,
      value: "items",
    },
    {
      label: `Scan Breakdown (${receivedItems.length}/${batch.totalCount ?? batch.total ?? 0})`,
      value: "comparison",
    },
    {
      label: `Scan History (${history.pagination?.totalItems || history.items?.length || 0})`,
      value: "history",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header with Back Button, Info, and Fixed Commands */}
      <BatchHeader
        batch={batch}
        checkoutMode={checkoutMode}
        fixedScanner={fixedScanner}
        liveScanMatchesBatch={liveScanMatchesBatch}
        onFixedCommand={handleFixedCommand}
        selectedScanner={selectedScanner}
      />

      {/* 2. KPI Metrics Summary Cards */}
      <BatchMetrics
        batch={batch}
        checkoutMode={checkoutMode}
        counters={counters}
      />

      {/* 3. Operational Actions Panel (Start, Clear, Receive, Finish) */}
      <BatchActionsPanel
        batch={batch}
        canStartSession={canStartSession}
        checkoutMode={checkoutMode}
        compatibleScanners={compatibleScanners}
        counters={counters}
        hasPendingItems={hasPendingItems}
        isClearing={isClearing}
        isContinuing={isContinuing}
        isFinishing={isFinishing}
        isReceiving={isReceiving}
        liveScanMatchesBatch={liveScanMatchesBatch}
        missingTagIds={missingTagIds}
        onClearScanData={handleClearScanData}
        onContinueScanning={handleContinueScanning}
        onFinishSession={handleFinishSession}
        onReceive={handleReceive}
        onScannerChange={setSelectedScannerId}
        receivedTagIds={receivedTagIds}
        remainingChoice={remainingChoice}
        remainingItems={remainingItems}
        scannerId={scannerId}
        setRemainingChoice={setRemainingChoice}
      />

      {/* 4. Receipt Result Banner */}
      {receipt && (
        <Alert variant={receipt.batch.receiptComplete ? "success" : "info"}>
          <strong>Receipt Processed: </strong>
          {receipt.receivedNowCount} items confirmed received now;{" "}
          {receipt.missingCount} marked missing and {receipt.pendingCount} still pending.
        </Alert>
      )}

      {/* 5. Tabs Navigation */}
      <Tabs items={tabs} onChange={setActiveTab} value={activeTab} />

      {/* 6. Tab Content */}
      {activeTab === "items" && (
        <BatchItemsTab items={receipt?.batch.items || batch.items || []} />
      )}

      {activeTab === "comparison" && (
        <LiveScanComparison
          receivedItems={receivedItems}
          remainingItems={remainingItems}
        />
      )}

      {activeTab === "history" && (
        <SessionHistoryTab
          history={history}
          historyPage={historyPage}
          onPageChange={setHistoryPage}
        />
      )}
    </div>
  );
};

export default LaundryBatchDetails;

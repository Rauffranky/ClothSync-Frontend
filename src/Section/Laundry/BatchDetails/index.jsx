import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import CardSkeleton from "../../../Components/UI/CardSkeleton";
import Tabs from "../../../Components/UI/Tabs";
import { getIncomingBatchDetails as fetchIncomingBatchDetails } from "../../../axios/batches/laundryBatches";
import { getLaundryScannerSessionHistory } from "../../../axios/scanners/laundryScanners";
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
} from "../IncomingBatches/data";
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
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState("items");
  const [liveScan, setLiveScan] = useState(getActiveLaundryScan);

  // Session History
  const [history, setHistory] = useState({ items: [], pagination: {} });
  const [historyPage, setHistoryPage] = useState(1);

  // Load Batch Details
  const loadBatch = useCallback(
    async (showLoading = false) => {
      if (!id) return;
      if (showLoading) setIsLoading(true);
      try {
        const response = await fetchIncomingBatchDetails(id);
        setBatch(getIncomingBatchDetails(response));
        setLoadError("");
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
    let ignore = false;
    if (!id) return undefined;
    fetchIncomingBatchDetails(id)
      .then((response) => {
        if (!ignore) {
          setBatch(getIncomingBatchDetails(response));
          setLoadError("");
          setIsLoading(false);
        }
      })
      .catch((error) => {
        if (!ignore) {
          if (error?.status === 404 || error?.response?.status === 404) {
            clearActiveLaundryScan();
            setLiveScan(null);
          }
          setLoadError(
            getLaundryBatchErrorMessage(error, "Unable to load batch details"),
          );
          setIsLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [id]);

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
    let ignore = false;
    if (!id) return undefined;
    getLaundryScannerSessionHistory(id, {
      page: historyPage,
      limit: 10,
    })
      .then((response) => {
        if (!ignore) {
          setHistory(
            response?.data?.data ??
              response?.data ?? { items: [], pagination: {} },
          );
        }
      })
      .catch(() => {
        if (!ignore) setHistory({ items: [], pagination: {} });
      });
    return () => {
      ignore = true;
    };
  }, [id, historyPage]);

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

  const liveScanMatchesBatch = Boolean(
    liveScan?.sessionId && (!liveScan.batchId || liveScan.batchId === id),
  );

  const receivedTagIds = useMemo(
    () => (liveScanMatchesBatch ? [...new Set(liveScan?.tagIds || [])] : []),
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

  const counters = batch;

  const backPath = checkoutMode
    ? "/laundry/check-out"
    : "/laundry/incoming-batches";

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
      {/* 1. Header with Back Button and Meta info */}
      <BatchHeader batch={batch} checkoutMode={checkoutMode} />

      {/* 2. KPI Metrics Summary Cards */}
      <BatchMetrics
        batch={batch}
        checkoutMode={checkoutMode}
        counters={counters}
      />

      {/* 4. Tabs Navigation */}
      <Tabs items={tabs} onChange={setActiveTab} value={activeTab} />

      {/* 5. Tab Content */}
      {activeTab === "items" && <BatchItemsTab items={batch.items || []} />}

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

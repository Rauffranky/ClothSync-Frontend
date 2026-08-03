import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, RefreshCw, ScanLine, Timer, TriangleAlert } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import Card from "../../../Components/UI/Card";
import Tabs from "../../../Components/UI/Tabs";
import { getApiErrorMessage } from "../../../axios/api";
import {
  clearTenantBulkScanSession,
  getTenantBulkScanEntries,
  testTenantBulkAddUndo,
} from "../../../axios/scanners/tenantBulkScan";
import { getSocket } from "../../../socket/client";
import { SOCKET_EVENTS } from "../../../socket/events";
import {
  getActiveBulkScanGroup,
  getActiveBulkScanSessionId,
  setActiveBulkScanGroup,
  setActiveBulkScanSessionId,
} from "../../../Utils/bulkScanSession";
import { toast } from "../../../Utils/toast";
import BulkScanEntriesTable from "./BulkScanEntriesTable";
import BulkAddModal from "./BulkAddModal";
import ScannerStatusCard from "./ScannerStatusCard";
import SummaryCards from "./SummaryCards";
import {
  BULK_SCAN_GROUPS,
  BULK_SCAN_PAGE_LIMIT,
  BULK_SCAN_TABS,
  getLiveScanGroup,
  normalizeBulkScanCounts,
  normalizeBulkScanEntry,
  normalizeBulkScanEntriesResponse,
} from "./data";

const emptyCounts = {
  totalTags: 0,
  existingLinked: 0,
  newUnlinked: 0,
  detached: 0,
};

const emptyPagination = {
  page: 1,
  limit: BULK_SCAN_PAGE_LIMIT,
  totalItems: 0,
  totalPages: 0,
};

const getEventSession = (payload) =>
  payload?.data?.session ?? payload?.session ?? null;

const getEventUndo = (payload) => payload?.data?.undo ?? payload?.undo ?? null;

const getInitialActiveTab = () => {
  const savedGroup = getActiveBulkScanGroup();
  return BULK_SCAN_TABS.some((tab) => tab.value === savedGroup)
    ? savedGroup
    : BULK_SCAN_GROUPS.NEW_UNLINKED;
};

const formatCountdown = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const BulkScanningIndex = () => {
  const [activeTab, setActiveTab] = useState(getInitialActiveTab);
  const [currentPage, setCurrentPage] = useState(0);
  const [sessionId, setSessionId] = useState(getActiveBulkScanSessionId);
  const [session, setSession] = useState(null);
  const [scanner, setScanner] = useState(null);
  const [counts, setCounts] = useState(null);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(emptyPagination);
  const [lastEpc, setLastEpc] = useState(null);
  const [undoState, setUndoState] = useState(null);
  const [undoSecondsRemaining, setUndoSecondsRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(Boolean(sessionId));
  const [isClearing, setIsClearing] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [loadError, setLoadError] = useState("");
  const requestIdRef = useRef(0);

  const fetchEntries = useCallback(async () => {
    if (!sessionId) return;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    try {
      const response = await getTenantBulkScanEntries(sessionId, {
        scanGroup: activeTab,
        page: currentPage + 1,
        limit: BULK_SCAN_PAGE_LIMIT,
      });
      if (requestId !== requestIdRef.current) return;

      const collection = normalizeBulkScanEntriesResponse(response);
      setSession(collection.session);
      setScanner(collection.scanner);
      setCounts(collection.counts);
      setRows(collection.rows);
      setPagination(collection.pagination);
      setLastEpc(collection.rows[0]?.epc ?? null);
      setLoadError("");
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      const message = getApiErrorMessage(error, "Unable to load bulk scan entries");
      setRows([]);
      setPagination(emptyPagination);
      setLoadError(message);
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [activeTab, currentPage, sessionId]);

  useEffect(() => {
    if (!sessionId) return undefined;

    // Fetching the external session collection is the synchronization owned by this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEntries();
    return () => {
      requestIdRef.current += 1;
    };
  }, [fetchEntries, sessionId]);

  useEffect(() => {
    if (!undoState?.canUndo) return undefined;

    const parsedExpiry = Date.parse(undoState.expiresAt);
    const expiresAt = Number.isNaN(parsedExpiry)
      ? Date.now() + (undoState.windowSeconds ?? 120) * 1000
      : parsedExpiry;

    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setUndoSecondsRemaining(remaining);
      if (remaining === 0) setUndoState(null);
    };

    const initialCountdown = window.setTimeout(updateCountdown, 0);
    const countdownInterval = window.setInterval(updateCountdown, 1000);
    return () => {
      window.clearTimeout(initialCountdown);
      window.clearInterval(countdownInterval);
    };
  }, [undoState]);

  useEffect(() => {
    const socket = getSocket();

    const applySession = (nextSession) => {
      if (!nextSession) return;
      setSession(nextSession);
      setCounts(normalizeBulkScanCounts({ session: nextSession }));

      if (nextSession.id && nextSession.id !== sessionId) {
        setIsLoading(true);
        setActiveBulkScanSessionId(nextSession.id);
        setSessionId(nextSession.id);
        setCurrentPage(0);
      }
    };

    const rejoinAndRefresh = () => {
      if (!sessionId) return;
      socket.emit(SOCKET_EVENTS.SCAN_SESSION_JOIN, { sessionId });
      fetchEntries();
    };

    const handleSocketConnected = (data) => {
      const connectedSession = getEventSession(data);
      if (connectedSession) applySession(connectedSession);
      rejoinAndRefresh();
    };

    const handleBulkScan = (data) => {
      const nextSession = getEventSession(data);
      if (nextSession) applySession(nextSession);

      const results = data?.data?.results ?? data?.results ?? [];
      if (!Array.isArray(results) || currentPage !== 0) return;

      const matchingEntries = results
        .filter((result) => getLiveScanGroup(result) === activeTab)
        .map((result) => normalizeBulkScanEntry(result.scannedTag ?? result.entry ?? result));
      if (matchingEntries.length === 0) return;

      setLastEpc(matchingEntries[0].epc);
      setRows((currentRows) => {
        const nextRows = [...currentRows];
        matchingEntries.forEach((entry) => {
          const existingIndex = nextRows.findIndex((row) => row.id === entry.id);
          if (existingIndex >= 0) nextRows[existingIndex] = entry;
          else nextRows.unshift(entry);
        });
        return nextRows.slice(0, BULK_SCAN_PAGE_LIMIT);
      });
    };

    const handleSessionStarted = (data) => applySession(getEventSession(data));
    const handleSessionUpdated = (data) => applySession(getEventSession(data));
    const handleEntriesUpdated = () => fetchEntries();
    const handleBulkAdded = (data) => {
      setUndoState(getEventUndo(data));
      fetchEntries();
    };
    const handleBulkAddUndone = () => {
      setUndoState(null);
      fetchEntries();
    };
    const handleBulkAddExpired = () => {
      setUndoState(null);
      fetchEntries();
    };
    const handleSessionCleared = (data) => {
      const clearedSession = getEventSession(data);
      if (clearedSession) setSession(clearedSession);
      setCounts(emptyCounts);
      setRows([]);
      setPagination(emptyPagination);
      setLastEpc(null);
      setUndoState(null);
    };
    const handleSessionFinished = (data) => {
      const finishedSession = getEventSession(data);
      if (finishedSession) setSession(finishedSession);
    };

    socket.on("connect", rejoinAndRefresh);
    socket.on(SOCKET_EVENTS.CONNECTED, handleSocketConnected);
    socket.on(SOCKET_EVENTS.SCANNER_SCAN_BULK, handleBulkScan);
    socket.on(SOCKET_EVENTS.SCAN_SESSION_STARTED, handleSessionStarted);
    socket.on(SOCKET_EVENTS.SCAN_SESSION_UPDATED, handleSessionUpdated);
    socket.on(SOCKET_EVENTS.SCAN_ENTRIES_UPDATED, handleEntriesUpdated);
    socket.on(SOCKET_EVENTS.SCAN_BULK_ADDED, handleBulkAdded);
    socket.on(SOCKET_EVENTS.SCAN_BULK_ADD_UNDONE, handleBulkAddUndone);
    socket.on(SOCKET_EVENTS.SCAN_BULK_ADD_EXPIRED, handleBulkAddExpired);
    socket.on(SOCKET_EVENTS.SCAN_SESSION_CLEARED, handleSessionCleared);
    socket.on(SOCKET_EVENTS.SCAN_SESSION_FINISHED, handleSessionFinished);

    return () => {
      socket.off("connect", rejoinAndRefresh);
      socket.off(SOCKET_EVENTS.CONNECTED, handleSocketConnected);
      socket.off(SOCKET_EVENTS.SCANNER_SCAN_BULK, handleBulkScan);
      socket.off(SOCKET_EVENTS.SCAN_SESSION_STARTED, handleSessionStarted);
      socket.off(SOCKET_EVENTS.SCAN_SESSION_UPDATED, handleSessionUpdated);
      socket.off(SOCKET_EVENTS.SCAN_ENTRIES_UPDATED, handleEntriesUpdated);
      socket.off(SOCKET_EVENTS.SCAN_BULK_ADDED, handleBulkAdded);
      socket.off(SOCKET_EVENTS.SCAN_BULK_ADD_UNDONE, handleBulkAddUndone);
      socket.off(SOCKET_EVENTS.SCAN_BULK_ADD_EXPIRED, handleBulkAddExpired);
      socket.off(SOCKET_EVENTS.SCAN_SESSION_CLEARED, handleSessionCleared);
      socket.off(SOCKET_EVENTS.SCAN_SESSION_FINISHED, handleSessionFinished);
    };
  }, [activeTab, currentPage, fetchEntries, sessionId]);

  const tabs = BULK_SCAN_TABS.map((tab) => ({
    ...tab,
    count:
      tab.value === BULK_SCAN_GROUPS.NEW_UNLINKED
        ? counts?.newUnlinked ?? 0
        : tab.value === BULK_SCAN_GROUPS.EXISTING_LINKED
          ? counts?.existingLinked ?? 0
          : counts?.detached ?? 0,
  }));

  const handleTabChange = (nextTab) => {
    if (nextTab === activeTab) return;

    setActiveBulkScanGroup(nextTab);
    setIsLoading(Boolean(sessionId));
    setRows([]);
    setCurrentPage(0);
    setActiveTab(nextTab);
  };

  const handleClearSession = async () => {
    if (!sessionId || isClearing) return;
    setIsClearing(true);
    try {
      const response = await clearTenantBulkScanSession(sessionId);
      setRows([]);
      setCounts(emptyCounts);
      setPagination(emptyPagination);
      setLastEpc(null);
      setUndoState(null);
      toast.success(response?.message || "Scan session cleared successfully");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to clear the scan session"));
    } finally {
      setIsClearing(false);
    }
  };

  const handleUndo = async () => {
    if (!sessionId || !undoState?.id || isUndoing) return;
    setIsUndoing(true);
    try {
      const response = await testTenantBulkAddUndo(sessionId, undoState.id);
      setUndoState(null);
      await fetchEntries();
      toast.success(response?.message || "Bulk add undone successfully");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to undo the bulk add"));
    } finally {
      setIsUndoing(false);
    }
  };

  const handleBulkAddSuccess = async (response) => {
    setIsBulkAddOpen(false);
    setUndoState(response?.data?.undo ?? null);
    setCurrentPage(0);
    await fetchEntries();
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-(--theme-text-primary)">
            <ScanLine className="text-blue-600" size={24} />
            <h1 className="m-0 text-2xl font-black">Bulk Scan Tags</h1>
          </div>
        </div>
        <Button
          disabled={!sessionId}
          loading={isClearing}
          onClick={handleClearSession}
          variant="primary"
        >
          Clear All Entries
        </Button>
      </div>

      {!sessionId && (
        <Alert variant="info">
          No active bulk scan session yet. Start a scanner session to load live entries.
        </Alert>
      )}

      {loadError && (
        <Alert leftIcon={<TriangleAlert size={18} />} variant="danger">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{loadError}</span>
            <Button
              leftIcon={<RefreshCw size={15} />}
              onClick={() => {
                setIsLoading(true);
                fetchEntries();
              }}
              size="sm"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </Alert>
      )}

      <ScannerStatusCard lastEpc={lastEpc} scanner={scanner} session={session} />
      <SummaryCards counts={counts} loading={isLoading} />

      <Card className="overflow-hidden" padding="0" rounded="18px">
        <div className="border-b border-(--theme-border) bg-(--theme-surface) px-4 py-3">
          <Tabs
            className="w-fit max-w-full"
            equalWidth={false}
            items={tabs}
            onChange={handleTabChange}
            value={activeTab}
          />
        </div>
        {undoState?.canUndo && undoSecondsRemaining > 0 && (
          <div className="px-4 pt-4">
            <Alert size="sm" variant="danger">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="flex flex-wrap items-center gap-2">
                  <Timer aria-hidden="true" className="shrink-0" size={18} />
                  <span>Bulk add undo window closes in</span>
                  <Badge className="font-mono text-sm" size="md" variant="danger">
                    {formatCountdown(undoSecondsRemaining)}
                  </Badge>
                </span>
                <Button
                  className="cursor-pointer disabled:cursor-not-allowed"
                  loading={isUndoing}
                  onClick={handleUndo}
                  size="sm"
                  variant="danger"
                >
                  Undo Bulk Add
                </Button>
              </div>
            </Alert>
          </div>
        )}
        {activeTab === BULK_SCAN_GROUPS.NEW_UNLINKED &&
          (counts?.newUnlinked ?? 0) > 0 && (
            <div className="flex flex-col gap-3 px-4 pt-4 lg:flex-row lg:items-center">
              <Alert
                className="flex-1"
                leftIcon={<CheckCircle2 size={18} />}
                variant="success"
              >
                {counts.newUnlinked} new unlinked {counts.newUnlinked === 1 ? "tag is" : "tags are"} ready to add to the system.
              </Alert>
              <Button onClick={() => setIsBulkAddOpen(true)} variant="primary">
                Add Bulk to System
              </Button>
            </div>
          )}
        <BulkScanEntriesTable
          key={activeTab}
          group={activeTab}
          loading={isLoading}
          onPageChange={({ selected }) => {
            setIsLoading(true);
            setCurrentPage(selected);
          }}
          pagination={pagination}
          rows={rows}
          scannerMode={scanner?.scannerMode ?? scanner?.mode}
        />
      </Card>

      <BulkAddModal
        onClose={() => setIsBulkAddOpen(false)}
        onSuccess={handleBulkAddSuccess}
        open={isBulkAddOpen}
        sessionId={sessionId}
      />
    </div>
  );
};

export default BulkScanningIndex;

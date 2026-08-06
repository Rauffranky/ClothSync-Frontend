import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, LogIn, LogOut, RefreshCw, ScanLine, TriangleAlert } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Alert from "../../../Components/UI/Alert";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import Card from "../../../Components/UI/Card";
import Modal from "../../../Components/UI/Modal";
import Tabs from "../../../Components/UI/Tabs";
import { getApiErrorMessage } from "../../../axios/api";
import {
  clearTenantBulkScanSession,
  confirmBulkScanAction,
  getTenantBulkScanEntries,
  previewBulkScanAction,
  testTenantScannerScan,
} from "../../../axios/scanners/tenantBulkScan";
import { getSocket } from "../../../socket/client";
import { SOCKET_EVENTS } from "../../../socket/events";
import {
  getActiveBulkScanGroup,
  getActiveBulkScanSessionId,
  setActiveBulkScanGroup,
  setActiveBulkScanSessionId,
} from "../../../Utils/bulkScanSession";
import GlobalUndoBanners from "../../../Components/Layout/Dashboard/GlobalUndoBanners";
import useGlobalUndoNotices, { mergeUndoNotices } from "../../../Hooks/useGlobalUndoNotices";
import { toast } from "../../../Utils/toast";
import BulkScanEntriesTable from "./BulkScanEntriesTable";
import BulkAddModal from "./BulkAddModal";
import ExistingTagActionModal from "./ExistingTagActionModal";
import ScannerStatusCard from "./ScannerStatusCard";
import SummaryCards from "./SummaryCards";
import {
  BULK_SCAN_GROUPS,
  BULK_SCAN_PAGE_LIMIT,
  BULK_SCAN_TABS,
  getLiveScanGroup,
  getSkippedReasonMessage,
  normalizeActionUndoNotices,
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

const getInitialActiveTab = () => {
  const savedGroup = getActiveBulkScanGroup();
  return BULK_SCAN_TABS.some((tab) => tab.value === savedGroup)
    ? savedGroup
    : BULK_SCAN_GROUPS.NEW_UNLINKED;
};


const BulkScanningIndex = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingAutomaticScan, setPendingAutomaticScan] = useState(
    () => location.state?.automaticTestScan ?? location.state?.manualTestScan ?? null,
  );
  const [pendingManualScan, setPendingManualScan] = useState(null);
  const [isManualScanSubmitting, setIsManualScanSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(getInitialActiveTab);
  const [currentPage, setCurrentPage] = useState(0);
  const [sessionId, setSessionId] = useState(getActiveBulkScanSessionId);
  const [session, setSession] = useState(null);
  const [scanner, setScanner] = useState(null);
  const [counts, setCounts] = useState(null);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(emptyPagination);
  const [lastEpc, setLastEpc] = useState(null);
  const [, setUndoNotices] = useGlobalUndoNotices();
  const [automaticResult, setAutomaticResult] = useState(null);
  const [actionPreview, setActionPreview] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [actionRows, setActionRows] = useState([]);
  const [isPreviewingAction, setIsPreviewingAction] = useState(false);
  const [isConfirmingAction, setIsConfirmingAction] = useState(false);
  const [actionSelectionKey, setActionSelectionKey] = useState(0);
  const [isLoading, setIsLoading] = useState(Boolean(sessionId));
  const [isClearing, setIsClearing] = useState(false);
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [loadError, setLoadError] = useState("");
  const requestIdRef = useRef(0);
  const actionRequestControllerRef = useRef(null);

  const handleCountsUpdate = useCallback((newCounts, currentTab) => {
    setCounts(newCounts);
    const totalTags =
      (newCounts?.newUnlinked ?? 0) +
      (newCounts?.existingLinked ?? 0) +
      (newCounts?.detached ?? 0);
    
    if (totalTags === 0) return;

    const currentHasData =
      (currentTab === BULK_SCAN_GROUPS.NEW_UNLINKED && (newCounts.newUnlinked ?? 0) > 0) ||
      (currentTab === BULK_SCAN_GROUPS.EXISTING_LINKED && (newCounts.existingLinked ?? 0) > 0) ||
      (currentTab === BULK_SCAN_GROUPS.DETACHED && (newCounts.detached ?? 0) > 0);

    if (!currentHasData) {
      let nextTab = currentTab;
      if ((newCounts.newUnlinked ?? 0) > 0) nextTab = BULK_SCAN_GROUPS.NEW_UNLINKED;
      else if ((newCounts.existingLinked ?? 0) > 0) nextTab = BULK_SCAN_GROUPS.EXISTING_LINKED;
      else if ((newCounts.detached ?? 0) > 0) nextTab = BULK_SCAN_GROUPS.DETACHED;

      if (nextTab !== currentTab) {
        setActiveBulkScanGroup(nextTab);
        setCurrentPage(0);
        setActiveTab(nextTab);
      }
    }
  }, []);

  useEffect(() => () => actionRequestControllerRef.current?.abort(), []);

  useEffect(() => {
    if (!location.state?.manualTestScan && !location.state?.automaticTestScan) return;
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const applyScannerResponse = (response) => {
    const result = response?.data ?? {};
    const processedCount = Number(result.processedCount ?? 0);
    const skippedCount = Number(result.skippedCount ?? 0);
    const notices = normalizeActionUndoNotices(response, {
      actionSource: result.actionSource,
      kind: "action",
      scannerMode: result.scannerMode,
    });

    if (notices.length > 0) {
      setUndoNotices((current) => mergeUndoNotices(current, notices));
    }

    setAutomaticResult(skippedCount > 0 ? {
      action: result.action,
      actionSource: result.actionSource,
      message: response?.message,
      processedCount,
      skippedCount,
      skippedItems: result.skippedItems ?? [],
    } : null);

    const message = response?.message || "Scanner scan completed successfully";
    if (skippedCount > 0 && processedCount === 0) toast.warning(message);
    else if (processedCount > 0) toast.success(message);
    else toast.info(message);
  };

  const submitTestScan = async (scanPayload, scanAction) => {
    if (!scanPayload || isManualScanSubmitting) return;

    actionRequestControllerRef.current?.abort();
    const controller = new AbortController();
    actionRequestControllerRef.current = controller;
    setIsManualScanSubmitting(true);
    try {
      const response = await testTenantScannerScan({
        ...scanPayload,
        ...(scanAction ? { scanAction } : {}),
      }, { signal: controller.signal });
      applyScannerResponse(response);
      const nextSessionId = response?.data?.session?.id;
      if (!nextSessionId) {
        throw new Error("Test scan succeeded, but data.session.id was not returned");
      }

      setActiveBulkScanSessionId(nextSessionId);
      setSessionId(nextSessionId);
      setSession(response?.data?.session ?? null);
      setScanner(
        response?.data?.scanner ?? response?.data?.session?.scanner ?? null,
      );
      handleCountsUpdate(normalizeBulkScanCounts(response?.data ?? {}), activeTab);
      setCurrentPage(0);
      setIsLoading(true);
      getSocket().emit(SOCKET_EVENTS.SCAN_SESSION_JOIN, { sessionId: nextSessionId });
      setPendingAutomaticScan(null);
      setPendingManualScan(null);

      try {
        const entriesResponse = await getTenantBulkScanEntries(nextSessionId, {
          scanGroup: activeTab,
          page: 1,
          limit: BULK_SCAN_PAGE_LIMIT,
        });
        const collection = normalizeBulkScanEntriesResponse(entriesResponse);
        if (collection.session) setSession(collection.session);
        if (collection.scanner) setScanner(collection.scanner);
        handleCountsUpdate(collection.counts, activeTab);
        setRows(collection.rows);
        setPagination(collection.pagination);
        setLastEpc(collection.rows[0]?.epc ?? null);
        setLoadError("");
      } catch (entriesError) {
        setLoadError(
          getApiErrorMessage(entriesError, "Unable to load the scanned entries"),
        );
      } finally {
        setIsLoading(false);
      }

    } catch (error) {
      if (error?.code !== "ERR_CANCELED") {
        const message = getApiErrorMessage(error, "Unable to send the test scan");
        const requiresManualAction =
          !scanAction &&
          error?.response?.status === 400 &&
          /manual scanner|check in or check out/i.test(message);

        if (requiresManualAction) {
          setPendingAutomaticScan(null);
          setPendingManualScan(scanPayload);
        } else {
          toast.error(message);
        }
      }
    } finally {
      if (actionRequestControllerRef.current === controller) {
        actionRequestControllerRef.current = null;
        setIsManualScanSubmitting(false);
      }
    }
  };

  useEffect(() => {
    if (!pendingAutomaticScan) return;
    // Submitting the navigation-provided scan is the external synchronization owned here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    submitTestScan(
      pendingAutomaticScan.payload ?? pendingAutomaticScan,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAutomaticScan]);

  const handleManualScanAction = (scanAction) => {
    submitTestScan(pendingManualScan, scanAction);
  };

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
      if (collection.session) setSession(collection.session);
      if (collection.scanner) setScanner(collection.scanner);
      handleCountsUpdate(collection.counts, activeTab);
      setRows(collection.rows);
      setPagination(collection.pagination);
      setLastEpc(collection.rows[0]?.epc ?? null);
      setLoadError("");
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      const message = getApiErrorMessage(error, "Unable to load bulk scan entries");
      if (
        error?.response?.status === 404 &&
        /scan session/i.test(message)
      ) {
        setActiveBulkScanSessionId(null);
        setSessionId(null);
        setSession(null);
        setScanner(null);
        setCounts(emptyCounts);
        setRows([]);
        setPagination(emptyPagination);
        setLastEpc(null);
        setLoadError("");
        return;
      }
      setRows([]);
      setPagination(emptyPagination);
      setLoadError(message);
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [activeTab, currentPage, handleCountsUpdate, sessionId]);

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
    const handleGlobalUndoSuccess = () => fetchEntries();
    window.addEventListener("bulk-scan-undo-success", handleGlobalUndoSuccess);
    return () => window.removeEventListener("bulk-scan-undo-success", handleGlobalUndoSuccess);
  }, [fetchEntries]);

  useEffect(() => {
    const socket = getSocket();

    const applySession = (nextSession) => {
      if (!nextSession) return;
      setSession(nextSession);
      handleCountsUpdate(normalizeBulkScanCounts({ session: nextSession }), activeTab);

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

      const eventPayload = data?.data ?? data ?? {};
      if (
        Number(eventPayload.processedCount ?? 0) > 0 ||
        eventPayload.actionSource === "scanner_mode" ||
        eventPayload.actionSource === "automatic_resolution"
      ) {
        fetchEntries();
        return;
      }

      const results = data?.data?.results ?? data?.results ?? [];
      if (!Array.isArray(results) || currentPage !== 0) return;

      const matchingEntries = results
        .filter((result) => {
          const entry = result.scannedTag ?? result.entry ?? result;
          return !entry.scanStatus || entry.scanStatus === "pending";
        })
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
      const notice = getEventUndoNotice(data);
      if (notice) {
        setUndoNotices((current) => mergeUndoNotices(current, [notice]));
      }
      fetchEntries();
    };
    const handleBulkAddUndone = () => {
      setUndoNotices((current) => current.filter((item) => item.kind !== "bulk_add"));
      fetchEntries();
    };
    const handleBulkAddExpired = () => {
      setUndoNotices((current) => current.filter((item) => item.kind !== "bulk_add"));
      fetchEntries();
    };
    const handleSessionCleared = (data) => {
      const clearedSession = getEventSession(data);
      if (clearedSession) setSession(clearedSession);
      setCounts(emptyCounts);
      setRows([]);
      setPagination(emptyPagination);
      setLastEpc(null);
      setUndoNotices([]);
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
  }, [activeTab, currentPage, fetchEntries, handleCountsUpdate, sessionId, setUndoNotices]);

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
      setUndoNotices([]);
      toast.success(response?.message || "Scan session cleared successfully");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to clear the scan session"));
    } finally {
      setIsClearing(false);
    }
  };


  const handleBulkAddSuccess = async (response) => {
    setIsBulkAddOpen(false);
    const notice = getEventUndoNotice(response);
    if (notice) {
      setUndoNotices((current) => mergeUndoNotices(current, [notice]));
    }
    setCurrentPage(0);
    await fetchEntries();
  };

  const handleExistingAction = async (action, selectedRows) => {
    if (!sessionId || selectedRows.length === 0 || isPreviewingAction) return;

    actionRequestControllerRef.current?.abort();
    const controller = new AbortController();
    actionRequestControllerRef.current = controller;
    setIsPreviewingAction(true);
    try {
      const response = await previewBulkScanAction(
        sessionId,
        { tempTagIds: selectedRows.map((row) => row.id), action },
        { signal: controller.signal },
      );
      setActionType(action);
      setActionRows(selectedRows);
      setActionPreview(response?.data ?? {});
    } catch (error) {
      if (error?.code !== "ERR_CANCELED") {
        toast.error(getApiErrorMessage(error, "Unable to preview the selected action"));
      }
    } finally {
      if (actionRequestControllerRef.current === controller) {
        actionRequestControllerRef.current = null;
        setIsPreviewingAction(false);
      }
    }
  };

  const closeActionModal = () => {
    if (isConfirmingAction) return;
    setActionPreview(null);
    setActionType(null);
    setActionRows([]);
  };

  const handleConfirmAction = async (details) => {
    if (!sessionId || !actionType || actionRows.length === 0 || isConfirmingAction) return;

    const controller = new AbortController();
    actionRequestControllerRef.current = controller;
    setIsConfirmingAction(true);
    try {
      const payload = {
        tempTagIds: actionRows.map((row) => row.id),
        action: actionType,
        ...(actionType === "check_out" ? details : {}),
      };
      const response = await confirmBulkScanAction(sessionId, payload, {
        signal: controller.signal,
      });
      const notices = normalizeActionUndoNotices(response, {
        action: actionType,
        kind: "action",
      });
      if (notices.length > 0) {
        setUndoNotices((current) => mergeUndoNotices(current, notices));
      }
      setActionPreview(null);
      setActionType(null);
      setActionRows([]);
      setActionSelectionKey((current) => current + 1);
      await fetchEntries();
      toast.success(response?.message || "Scan action completed successfully");
    } catch (error) {
      if (error?.code !== "ERR_CANCELED") {
        toast.error(getApiErrorMessage(error, "Unable to confirm the selected action"));
      }
    } finally {
      if (actionRequestControllerRef.current === controller) {
        actionRequestControllerRef.current = null;
      }
      setIsConfirmingAction(false);
    }
  };

  const getManualScanSuggestion = () => {
    if (!pendingManualScan?.epcs || rows.length === 0) return null;
    const scannedEpcs = pendingManualScan.epcs;
    const matchedRows = rows.filter(r => scannedEpcs.includes(r.epc));
    if (matchedRows.length === 0) return null;

    const returnedCount = matchedRows.filter(r => r.status === "Returned" || r.status === "in_laundry").length;
    const dispatchedCount = matchedRows.filter(r => r.status === "Dispatched" || r.status === "in_business").length;

    if (returnedCount > 0 && returnedCount >= dispatchedCount) {
      return "💡 Suggestion: These tags appear to be already Checked In (Returned). You likely want to Check Out.";
    } else if (dispatchedCount > 0 && dispatchedCount > returnedCount) {
      return "💡 Suggestion: These tags appear to be already Checked Out (Dispatched). You likely want to Check In.";
    }
    return null;
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
        <GlobalUndoBanners inline />
        {automaticResult && (
          <div className="px-4 pt-4">
            <Alert size="sm" variant="warning">
              <div className="space-y-2">
                <div>{automaticResult.message}</div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="success">Processed {automaticResult.processedCount}</Badge>
                  <Badge variant="warning">Skipped {automaticResult.skippedCount}</Badge>
                </div>
                {automaticResult.skippedItems.length > 0 && (
                  <details>
                    <summary className="cursor-pointer">View skipped tag details</summary>
                    <ul className="mb-0 mt-2 space-y-1 pl-5">
                      {automaticResult.skippedItems.map((item) => (
                        <li key={item.tempTagId ?? item.epc}>
                          <span className="font-mono">{item.epc ?? "Unknown EPC"}</span>
                          {" — "}{getSkippedReasonMessage(item.reason)}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
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
          key={`${activeTab}-${actionSelectionKey}`}
          group={activeTab}
          loading={isLoading}
          onExistingAction={handleExistingAction}
          onPageChange={({ selected }) => {
            setIsLoading(true);
            setCurrentPage(selected);
          }}
          pagination={pagination}
          rows={rows}
          scannerMode={
            scanner?.scannerMode ??
            scanner?.mode ??
            session?.scannerMode ??
            session?.mode
          }
          previewLoading={isPreviewingAction}
        />
      </Card>

      <BulkAddModal
        onClose={() => setIsBulkAddOpen(false)}
        onSuccess={handleBulkAddSuccess}
        open={isBulkAddOpen}
        sessionId={sessionId}
      />

      {actionPreview && (
        <ExistingTagActionModal
          action={actionType}
          busy={isConfirmingAction}
          onClose={closeActionModal}
          onConfirm={handleConfirmAction}
          open
          preview={actionPreview}
          scannerLocation={
            scanner?.location ?? scanner?.scannerLocation ?? session?.location ?? ""
          }
          selectedRows={actionRows}
        />
      )}

      <Modal
        closeOnBackdrop={false}
        description="Please select the intended action for these tags. The selected action will be applied immediately to all valid scanned tags."
        footer={(
          <>
            <Button
              disabled={isManualScanSubmitting}
              leftIcon={<LogOut size={16} />}
              loading={isManualScanSubmitting}
              onClick={() => handleManualScanAction("check_out")}
              variant="secondary"
            >
              Check Out
            </Button>
            <Button
              disabled={isManualScanSubmitting}
              leftIcon={<LogIn size={16} />}
              loading={isManualScanSubmitting}
              onClick={() => handleManualScanAction("check_in")}
              variant="primary"
            >
              Check In
            </Button>
          </>
        )}
        onClose={() => {
          if (!isManualScanSubmitting) setPendingManualScan(null);
        }}
        open={Boolean(pendingManualScan)}
        title="Select Scan Action"
        width={520}
      >
        <div className="space-y-3">
          <Alert variant="info">
            Choose the intended direction for {pendingManualScan?.epcs?.length ?? 0} scanned tags.
          </Alert>
          {getManualScanSuggestion() && (
            <Alert variant="warning" className="text-sm">
              {getManualScanSuggestion()}
            </Alert>
          )}
        </div>
      </Modal>

    </div>
  );
};

export default BulkScanningIndex;

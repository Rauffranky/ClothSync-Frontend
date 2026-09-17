import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  LogIn,
  LogOut,
  RefreshCw,
  ScanLine,
  Search,
} from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Card from "../../../Components/UI/Card";
import Dropdown from "../../../Components/UI/Dropdown";
import Input from "../../../Components/UI/Input";
import Tabs from "../../../Components/UI/Tabs";
import GlobalUndoBanners from "../../../Components/Layout/Dashboard/GlobalUndoBanners";
import useGlobalUndoNotices, { mergeUndoNotices } from "../../../Hooks/useGlobalUndoNotices";
import { normalizeAutomaticScanUndoNotices } from "../../../Utils/scanUndo";
import ScannerStatusCard from "./ScannerStatusCard";
import SummaryCards from "./SummaryCards";
import BulkScanEntriesTable from "./BulkScanEntriesTable";
import useSocketEvent, { useSocketEvents } from "../../../Hooks/useSocketEvent";
import { SOCKET_EVENTS } from "../../../socket/events";
import {
  clearLaundryScannerSession,
  getLaundryScanners,
  issueLaundryFixedScannerCommand,
  testLaundryScannerScan,
} from "../../../axios/scanners/laundryScanners";
import { getLaundryTenants } from "../../../axios/laundryTenants/laundryTenants";
import {
  getIncomingBatches,
  getCompletedLaundryDispatchBatches,
} from "../../../axios/batches/laundryBatches";
import {
  clearActiveLaundryScan,
  getActiveLaundryScan,
} from "../../../Utils/laundryScanSession";
import { verifyLaundryComplaintEligibility } from "../../../axios/complaints";
import { toast } from "../../../Utils/toast";
import { formatTimeWithUserPreferences } from "../../../Utils/date";

const LAUNDRY_BULK_SCAN_GROUPS = Object.freeze({
  NEW_UNLINKED: "new_unlinked",
  EXISTING_LINKED: "existing_linked",
  DETACHED: "detached",
});

const LAUNDRY_BULK_SCAN_SESSION_KEY = "active-laundry-bulk-scan-session";
const LAUNDRY_BULK_SCAN_ENTRIES_KEY = "active-laundry-bulk-scan-entries";
const LAUNDRY_BULK_SCAN_LAST_EPC_KEY = "active-laundry-bulk-scan-last-epc";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const getValidUuid = (val) => {
  if (typeof val === "string" && UUID_REGEX.test(val.trim())) {
    return val.trim();
  }
  return undefined;
};

// Helper to resolve whether a tag is in an active batch (Condition 1) or last linked batch (Condition 2)
const extractBatchDetails = (
  item = {},
  rawTag = {},
  rawAsset = {},
  activeBatchMap = null,
  completedBatchMap = null,
) => {
  const epc = item?.epc || rawTag?.epc;
  const tagId = item?.id || item?._id || rawTag?.id || rawTag?._id;

  // Direct active batch candidate
  const directActive =
    item?.activeBatch ||
    rawTag?.activeBatch ||
    rawAsset?.activeBatch ||
    item?.currentBatch ||
    rawTag?.currentBatch;

  // Direct last / previous batch candidate
  const directLast =
    item?.lastBatch ||
    rawTag?.lastBatch ||
    rawAsset?.lastBatch ||
    item?.previousBatch ||
    rawTag?.previousBatch;

  // Generic batch candidate
  const genericBatch = item?.batch || rawTag?.batch || rawAsset?.batch;

  // Cached active batch lookup
  const activeFromMap =
    (epc && activeBatchMap?.get(epc)) ||
    (tagId && activeBatchMap?.get(tagId));

  // Cached completed batch lookup
  const completedFromMap =
    (epc && completedBatchMap?.get(epc)) ||
    (tagId && completedBatchMap?.get(tagId));

  // Condition 1: Check active batch
  let activeBatchName = null;
  if (directActive) {
    activeBatchName =
      directActive.batchCode ||
      directActive.name ||
      directActive.batchName ||
      directActive.code ||
      (typeof directActive === "string" ? directActive : null);
  } else if (item?.activeBatchName || rawTag?.activeBatchName) {
    activeBatchName = item?.activeBatchName || rawTag?.activeBatchName;
  } else if (
    genericBatch &&
    genericBatch.status !== "completed" &&
    genericBatch.status !== "sent_to_business"
  ) {
    activeBatchName =
      genericBatch.batchCode ||
      genericBatch.name ||
      genericBatch.batchName ||
      (typeof genericBatch === "string" ? genericBatch : null);
  } else if (activeFromMap) {
    activeBatchName =
      activeFromMap.batchCode || activeFromMap.batchName || activeFromMap.id;
  } else if (
    item?.batchName &&
    !item?.isCompletedBatch &&
    item?.batchStatus !== "completed"
  ) {
    activeBatchName = item.batchName;
  } else if (
    item?.batchCode &&
    !item?.isCompletedBatch &&
    item?.batchStatus !== "completed"
  ) {
    activeBatchName = item.batchCode;
  }

  // Condition 2: If active batch is NOT found, check what last batch it was linked with
  let lastBatchName = null;
  if (directLast) {
    lastBatchName =
      directLast.batchCode ||
      directLast.name ||
      directLast.batchName ||
      directLast.code ||
      (typeof directLast === "string" ? directLast : null);
  } else if (item?.lastBatchName || rawTag?.lastBatchName) {
    lastBatchName = item?.lastBatchName || rawTag?.lastBatchName;
  } else if (
    genericBatch &&
    (genericBatch.status === "completed" ||
      genericBatch.status === "sent_to_business")
  ) {
    lastBatchName =
      genericBatch.batchCode ||
      genericBatch.name ||
      genericBatch.batchName ||
      (typeof genericBatch === "string" ? genericBatch : null);
  } else if (completedFromMap) {
    lastBatchName =
      completedFromMap.batchCode ||
      completedFromMap.batchName ||
      completedFromMap.id;
  } else if (item?.previousBatchName || rawTag?.previousBatchName) {
    lastBatchName = item?.previousBatchName || rawTag?.previousBatchName;
  }

  // Resolved Batch: Active first; if not found, Last Linked batch
  const resolvedBatchName = activeBatchName || lastBatchName || null;
  const batchType = activeBatchName
    ? "active"
    : lastBatchName
      ? "last_linked"
      : null;

  // Batch IDs
  let activeBatchId = null;
  if (directActive) {
    activeBatchId =
      directActive.id ||
      directActive._id ||
      directActive.batchId ||
      (typeof directActive === "string" && directActive.length > 20
        ? directActive
        : null);
  } else if (activeFromMap?.batchId) {
    activeBatchId = activeFromMap.batchId;
  } else if (
    genericBatch &&
    genericBatch.status !== "completed" &&
    genericBatch.status !== "sent_to_business"
  ) {
    activeBatchId = genericBatch.id || genericBatch._id || genericBatch.batchId;
  } else if (item?.activeBatchId || rawTag?.activeBatchId) {
    activeBatchId = item?.activeBatchId || rawTag?.activeBatchId;
  } else if (
    item?.batchId &&
    !item?.isCompletedBatch &&
    item?.batchStatus !== "completed"
  ) {
    activeBatchId = item.batchId;
  }

  let lastBatchId = null;
  if (directLast) {
    lastBatchId =
      directLast.id ||
      directLast._id ||
      directLast.batchId ||
      (typeof directLast === "string" && directLast.length > 20
        ? directLast
        : null);
  } else if (completedFromMap?.batchId) {
    lastBatchId = completedFromMap.batchId;
  } else if (
    genericBatch &&
    (genericBatch.status === "completed" ||
      genericBatch.status === "sent_to_business")
  ) {
    lastBatchId = genericBatch.id || genericBatch._id || genericBatch.batchId;
  } else if (item?.lastBatchId || rawTag?.lastBatchId) {
    lastBatchId = item?.lastBatchId || rawTag?.lastBatchId;
  }

  if (!activeBatchId && activeBatchName && activeBatchMap) {
    activeBatchId = activeBatchMap.get(activeBatchName)?.batchId || null;
  }
  if (!lastBatchId && lastBatchName && completedBatchMap) {
    lastBatchId = completedBatchMap.get(lastBatchName)?.batchId || null;
  }

  const resolvedBatchId = activeBatchId || lastBatchId || null;

  return {
    activeBatchId,
    lastBatchId,
    resolvedBatchId,
    activeBatchName,
    lastBatchName,
    resolvedBatchName,
    batchType,
    isComplaintEligible: Boolean(resolvedBatchName),
  };
};

const safeGetJson = (key, fallback = null) => {
  try {
    const val = sessionStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (err) {
    void err;
    return fallback;
  }
};

const safeGetItem = (key, fallback = null) => {
  try {
    const val = sessionStorage.getItem(key);
    return val !== null ? val : fallback;
  } catch (err) {
    void err;
    return fallback;
  }
};

const safeSetItem = (key, value) => {
  try {
    if (value === null || value === undefined) {
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(
        key,
        typeof value === "string" ? value : JSON.stringify(value),
      );
    }
  } catch (err) {
    void err;
  }
};

const safeRemoveItem = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch (err) {
    void err;
  }
};

const getItemScanGroup = (item = {}) => {
  const isDetached =
    item.status === "dispatched" ||
    item.status === "completed" ||
    item.status === "detached" ||
    item.mappingStatus === "detached" ||
    item.scanGroup === "detached";

  if (isDetached) return LAUNDRY_BULK_SCAN_GROUPS.DETACHED;
  if (
    item.isUnassigned ||
    item.status === "unassigned" ||
    item.status === "unlinked" ||
    !item.businessName
  ) {
    return LAUNDRY_BULK_SCAN_GROUPS.NEW_UNLINKED;
  }
  return LAUNDRY_BULK_SCAN_GROUPS.EXISTING_LINKED;
};

const getInitialLaundryActiveTab = (entries = []) => {
  if (!Array.isArray(entries) || entries.length === 0) {
    return LAUNDRY_BULK_SCAN_GROUPS.NEW_UNLINKED;
  }
  let newUnlinked = 0;
  let existingLinked = 0;
  let detached = 0;
  entries.forEach((item) => {
    const group = getItemScanGroup(item);
    if (group === LAUNDRY_BULK_SCAN_GROUPS.NEW_UNLINKED) newUnlinked++;
    else if (group === LAUNDRY_BULK_SCAN_GROUPS.EXISTING_LINKED) existingLinked++;
    else if (group === LAUNDRY_BULK_SCAN_GROUPS.DETACHED) detached++;
  });
  if (newUnlinked > 0) return LAUNDRY_BULK_SCAN_GROUPS.NEW_UNLINKED;
  if (existingLinked > 0) return LAUNDRY_BULK_SCAN_GROUPS.EXISTING_LINKED;
  if (detached > 0) return LAUNDRY_BULK_SCAN_GROUPS.DETACHED;
  return LAUNDRY_BULK_SCAN_GROUPS.NEW_UNLINKED;
};

const LaundryBulkScanningIndex = () => {
  const navigate = useNavigate();
  const [, setUndoNotices] = useGlobalUndoNotices();
  const [activeTab, setActiveTab] = useState(() => {
    const raw = safeGetJson(LAUNDRY_BULK_SCAN_ENTRIES_KEY, []);
    return getInitialLaundryActiveTab(raw);
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState("");
  const [partnerFilter, setPartnerFilter] = useState("all");
  const [selectedTagIds, setSelectedTagIds] = useState(() => new Set());
  const [session, setSession] = useState(() => {
    const stored = safeGetJson(LAUNDRY_BULK_SCAN_SESSION_KEY);
    const validStoredId = getValidUuid(stored?.id);
    if (validStoredId) return { ...stored, id: validStoredId };
    const activeScan = getActiveLaundryScan();
    const validActiveId = getValidUuid(activeScan?.sessionId);
    return validActiveId
      ? {
          id: validActiveId,
          status: "active",
          startedAt: new Date().toISOString(),
        }
      : null;
  });
  const [scanner, setScanner] = useState(null);
  const [scannersList, setScannersList] = useState([]);
  const [lastEpc, setLastEpc] = useState(() => safeGetItem(LAUNDRY_BULK_SCAN_LAST_EPC_KEY, null));
  const [allEntries, setAllEntries] = useState(() => {
    const raw = safeGetJson(LAUNDRY_BULK_SCAN_ENTRIES_KEY, []);
    return raw.map((item) => {
      const isLegacyMock =
        item.businessName === "Linked Business" &&
        (!item.tenantId || item.assetName === "Standard Linen");
      if (isLegacyMock) {
        return {
          ...item,
          businessName: null,
          tenantId: null,
          assetName: null,
          categoryName: null,
          washCount: null,
          washLimit: null,
          tagWashCount: null,
          tagWashLimit: null,
          status: "unassigned",
          isUnassigned: true,
        };
      }
      return {
        ...item,
        tagWashCount:
          item.tagWashCount ??
          item.tag?.totalLaundryCycles ??
          item.totalLaundryCycles ??
          (item.isUnassigned ? null : (item.washCount ?? 0)),
        tagWashLimit:
          item.tagWashLimit ??
          item.tag?.washLimit ??
          item.washLimit ??
          null,
      };
    });
  });
  const activeBatchesMapRef = useRef(new Map());
  const completedBatchesMapRef = useRef(new Map());
  const activeScanStartTimeRef = useRef(null);
  const startTransitionTimeRef = useRef(null);
  const stopTransitionTimeRef = useRef(null);
  const commandTimeoutRef = useRef(null);

  const [partnersList, setPartnersList] = useState([]);
  const [isClearing, setIsClearing] = useState(false);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [isCommandRunning, setIsCommandRunning] = useState(null);
  const [isLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Load available scanners, active partners, and batches on mount
  useEffect(() => {
    let mounted = true;

    const fetchInitialData = async () => {
      try {
        const [
          scannersRes,
          tenantsRes,
          incomingBatchesRes,
          completedBatchesRes,
        ] = await Promise.allSettled([
          getLaundryScanners({ page: 1, limit: 100 }),
          getLaundryTenants({ limit: 100 }),
          getIncomingBatches({ limit: 100 }),
          getCompletedLaundryDispatchBatches({ limit: 100 }),
        ]);

        if (!mounted) return;

        if (scannersRes.status === "fulfilled") {
          const sPayload =
            scannersRes.value?.data?.data ?? scannersRes.value?.data ?? {};
          const rawList = Array.isArray(sPayload)
            ? sPayload
            : sPayload?.items ||
              sPayload?.scanners ||
              sPayload?.docs ||
              sPayload?.data ||
              [];
          const sList = Array.isArray(rawList) ? rawList : [];
          if (sList.length > 0) {
            setScannersList(sList);
            const activeScanner =
              sList.find((s) => s.status === "active" || s.isOnline) || sList[0];
            setScanner(activeScanner);
          }
        }

        if (tenantsRes.status === "fulfilled") {
          const tList =
            tenantsRes.value?.data?.data?.items ||
            tenantsRes.value?.data?.items ||
            tenantsRes.value?.data ||
            [];
          if (Array.isArray(tList)) {
            const formatted = tList.map((item) => {
              const tObj = item.tenant || item;
              const name =
                item.businessName ||
                tObj.businessName ||
                tObj.companyName ||
                tObj.fullName ||
                "Partner Business";
              return { id: item.tenantId || tObj.id || item.id, name };
            });
            setPartnersList(formatted);
          }
        }

        if (incomingBatchesRes.status === "fulfilled") {
          const incPayload =
            incomingBatchesRes.value?.data?.data ??
            incomingBatchesRes.value?.data ??
            {};
          const incBatches = Array.isArray(incPayload)
            ? incPayload
            : incPayload?.items ||
              incPayload?.batches ||
              incPayload?.docs ||
              [];
          incBatches.forEach((b) => {
            const batchCode = b.batchCode || b.code || b.id;
            const batchName = b.name || b.batchName || batchCode;
            const items = b.items || b.batchItems || b.tags || [];
            if (Array.isArray(items)) {
              items.forEach((it) => {
                const epc = it.epc || it.tag?.epc;
                const id = it.id || it._id || it.tag?.id || it.tag?._id;
                const info = {
                  batchId: b.id,
                  batchCode,
                  batchName,
                  status: "active",
                  tenantId: b.tenantId || b.tenant?.id,
                  businessName: b.businessName || b.tenant?.businessName,
                };
                if (epc) activeBatchesMapRef.current.set(epc, info);
                if (id) activeBatchesMapRef.current.set(id, info);
              });
            }
            activeBatchesMapRef.current.set(b.id, {
              batchId: b.id,
              batchCode,
              batchName,
              status: "active",
              tenantId: b.tenantId || b.tenant?.id,
              businessName: b.businessName || b.tenant?.businessName,
            });
            if (batchCode) {
              activeBatchesMapRef.current.set(batchCode, {
                batchId: b.id,
                batchCode,
                batchName,
                status: "active",
                tenantId: b.tenantId || b.tenant?.id,
                businessName: b.businessName || b.tenant?.businessName,
              });
            }
            if (batchName) {
              activeBatchesMapRef.current.set(batchName, {
                batchId: b.id,
                batchCode,
                batchName,
                status: "active",
                tenantId: b.tenantId || b.tenant?.id,
                businessName: b.businessName || b.tenant?.businessName,
              });
            }
          });
        }

        if (completedBatchesRes.status === "fulfilled") {
          const compPayload =
            completedBatchesRes.value?.data?.data ??
            completedBatchesRes.value?.data ??
            {};
          const compBatches = Array.isArray(compPayload)
            ? compPayload
            : compPayload?.items ||
              compPayload?.batches ||
              compPayload?.docs ||
              [];
          compBatches.forEach((b) => {
            const batchCode = b.batchCode || b.code || b.id;
            const batchName = b.name || b.batchName || batchCode;
            const items = b.items || b.batchItems || b.tags || [];
            if (Array.isArray(items)) {
              items.forEach((it) => {
                const epc = it.epc || it.tag?.epc;
                const id = it.id || it._id || it.tag?.id || it.tag?._id;
                const info = {
                  batchId: b.id,
                  batchCode,
                  batchName,
                  status: "completed",
                  tenantId: b.tenantId || b.tenant?.id,
                  businessName: b.businessName || b.tenant?.businessName,
                };
                if (epc) completedBatchesMapRef.current.set(epc, info);
                if (id) completedBatchesMapRef.current.set(id, info);
              });
            }
            completedBatchesMapRef.current.set(b.id, {
              batchId: b.id,
              batchCode,
              batchName,
              status: "completed",
              tenantId: b.tenantId || b.tenant?.id,
              businessName: b.businessName || b.tenant?.businessName,
            });
            if (batchCode) {
              completedBatchesMapRef.current.set(batchCode, {
                batchId: b.id,
                batchCode,
                batchName,
                status: "completed",
                tenantId: b.tenantId || b.tenant?.id,
                businessName: b.businessName || b.tenant?.businessName,
              });
            }
            if (batchName) {
              completedBatchesMapRef.current.set(batchName, {
                batchId: b.id,
                batchCode,
                batchName,
                status: "completed",
                tenantId: b.tenantId || b.tenant?.id,
                businessName: b.businessName || b.tenant?.businessName,
              });
            }
          });
        }

        // Re-resolve existing entries with the newly loaded batch maps
        setAllEntries((prev) => {
          if (!prev || prev.length === 0) return prev;
          let changed = false;
          const updated = prev.map((entry) => {
            const batchInfo = extractBatchDetails(
              entry,
              null,
              null,
              activeBatchesMapRef.current,
              completedBatchesMapRef.current,
            );
            const resolvedBatchId =
              batchInfo.resolvedBatchId ||
              entry.batchId ||
              entry.resolvedBatchId ||
              entry.activeBatchId;
            if (
              batchInfo.resolvedBatchName ||
              resolvedBatchId ||
              !entry.batchId
            ) {
              changed = true;
              return {
                ...entry,
                batchId: resolvedBatchId,
                activeBatchId: batchInfo.activeBatchId || entry.activeBatchId,
                resolvedBatchId,
                activeBatchName:
                  batchInfo.activeBatchName || entry.activeBatchName,
                lastBatchName: batchInfo.lastBatchName || entry.lastBatchName,
                resolvedBatchName:
                  batchInfo.resolvedBatchName || entry.resolvedBatchName,
                batchType: batchInfo.batchType || entry.batchType,
                isComplaintEligible:
                  batchInfo.isComplaintEligible ||
                  Boolean(entry.resolvedBatchName),
              };
            }
            return entry;
          });
          if (changed) {
            safeSetItem(LAUNDRY_BULK_SCAN_ENTRIES_KEY, updated);
            return updated;
          }
          return prev;
        });
      } catch (err) {
        console.error("Failed to load scanner/partner/batch data:", err);
      }
    };

    fetchInitialData();

    return () => {
      mounted = false;
    };
  }, []);

  // Handle incoming live RFID scanner bulk scan event
  const handleLiveScanEvent = useCallback((payload) => {
    const data = payload?.data?.data ?? payload?.data ?? payload ?? {};

    const isFinished =
      payload?.event === SOCKET_EVENTS.SCAN_SESSION_FINISHED ||
      data?.event === SOCKET_EVENTS.SCAN_SESSION_FINISHED ||
      data?.type === SOCKET_EVENTS.SCAN_SESSION_FINISHED ||
      data?.status === "stopped" ||
      data?.status === "finished" ||
      data?.status === "closed" ||
      data?.session?.status === "stopped" ||
      data?.session?.status === "finished" ||
      data?.session?.status === "closed";

    if (isFinished) {
      const stopDoneTime = new Date();
      const stopStartTime = stopTransitionTimeRef.current;
      let stopDuration = "";
      if (stopStartTime) {
        const diffSec = Math.max(
          0,
          Math.floor((stopDoneTime.getTime() - stopStartTime.getTime()) / 1000),
        );
        const mins = Math.floor(diffSec / 60);
        const secs = diffSec % 60;
        stopDuration = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
      }
      stopTransitionTimeRef.current = null;
      startTransitionTimeRef.current = null;
      activeScanStartTimeRef.current = null;
      setSession((prev) => (prev ? { ...prev, status: "stopped" } : null));

      const scannerName = scanner?.name || scanner?.scannerName || "Fixed Scanner";
      toast.scannerStop({
        message: "Scanner Stopped",
        totalDuration: stopDuration,
        isFinal: true,
        scannerName,
        duration: 2500,
      });
      return;
    }

    // As soon as scanning starts in APK, stop start timer and dismiss toast
    if (startTransitionTimeRef.current) {
      startTransitionTimeRef.current = null;
      toast.dismiss("scanner-session-toast");
    }
    if (commandTimeoutRef.current) {
      clearTimeout(commandTimeoutRef.current);
      commandTimeoutRef.current = null;
    }
    setIsCommandRunning(null);

    const incomingEntries = [
      ...(Array.isArray(data.entries) ? data.entries : []),
      ...(Array.isArray(data.results) ? data.results : []),
      ...(Array.isArray(data.processedItems) ? data.processedItems : []),
      ...(Array.isArray(data.tags) ? data.tags : []),
      ...(Array.isArray(data.scannedTags) ? data.scannedTags : []),
      ...(data.epc || data.tag ? [data] : []),
    ];

    if (incomingEntries.length > 0) {
      setAllEntries((prev) => {
        const existingIds = new Set(prev.map((e) => e.epc || e.id));
        const newItems = incomingEntries
          .filter((item) => {
            const rawTag = item.tag || item.scannedTag || item;
            const epc = item.epc || rawTag.epc || item.id;
            return epc && !existingIds.has(epc);
          })
          .map((item, idx) => {
            const rawTag = item.tag || item.scannedTag || item;
            const rawAsset = item.asset || rawTag.asset;
            const rawTenant = item.tenant || rawTag.tenant || rawAsset?.tenant;

            const tenantId =
              item.tenantId ||
              rawTenant?.id ||
              rawTenant?._id ||
              rawTag.tenantId ||
              rawAsset?.tenantId ||
              null;

            let partnerName =
              item.businessName ||
              rawTenant?.businessName ||
              rawTenant?.name ||
              rawTenant?.companyName ||
              null;

            if (partnerName === "Linked Business" && !tenantId) {
              partnerName = null;
            }

            if (!partnerName && tenantId && partnersList.length > 0) {
              const matched = partnersList.find(
                (p) => String(p.id) === String(tenantId),
              );
              if (matched) partnerName = matched.name;
            }

            const mappingStatus = String(
              item.mappingStatus || rawTag.mappingStatus || "",
            ).toLowerCase();
            const scanGroup = item.scanGroup || rawTag.scanGroup;
            const rawStatus = String(
              item.status ||
                rawTag.status ||
                rawTag.currentStatus ||
                item.assetStatus ||
                rawTag.assetStatus ||
                item.tagStatus ||
                "",
            ).toLowerCase();

            const isExplicitlyUnlinked =
              mappingStatus === "unlinked" ||
              mappingStatus === "unassigned" ||
              mappingStatus === "detached" ||
              scanGroup === "new_unlinked" ||
              scanGroup === "detached" ||
              rawStatus === "unassigned" ||
              rawStatus === "unlinked";

            const isLinked =
              Boolean(partnerName || tenantId) && !isExplicitlyUnlinked;

            const epc =
              item.epc ||
              rawTag.epc ||
              item.id ||
              `E28011${Math.floor(100000 + Math.random() * 900000)}`;

            const assetName =
              item.assetName ||
              rawAsset?.assetName ||
              rawAsset?.name ||
              rawTag.assetName ||
              null;

            const categoryName =
              item.categoryName ||
              rawAsset?.category?.name ||
              rawAsset?.categoryName ||
              rawTag.categoryName ||
              null;

            const washCount =
              item.washCount ??
              item.assetWashCount ??
              rawTag.washCount ??
              rawAsset?.washCount ??
              null;

            const washLimit =
              item.washLimit ??
              item.assetWashLimit ??
              rawAsset?.washLimit ??
              rawTag.washLimit ??
              null;

            const tagWashCount =
              item.tagWashCount ??
              rawTag.tagWashCount ??
              rawTag.totalLaundryCycles ??
              item.totalLaundryCycles ??
              (isLinked ? 0 : null);

            const tagWashLimit =
              item.tagWashLimit ??
              rawTag.tagWashLimit ??
              rawTag.washLimit ??
              washLimit ??
              null;

            const batchInfo = extractBatchDetails(
              item,
              rawTag,
              rawAsset,
              activeBatchesMapRef.current,
              completedBatchesMapRef.current,
            );

            return {
              id: item.id || item.tempTagId || `scan-${Date.now()}-${idx}`,
              epc,
              tenantId: isLinked ? tenantId : null,
              businessName: isLinked ? (partnerName || "Linked Business") : null,
              assetName: isLinked ? (assetName || "Standard Item") : null,
              categoryName: isLinked ? (categoryName || "Linen") : null,
              washCount: isLinked ? (washCount ?? 0) : null,
              washLimit: isLinked ? (washLimit ?? 50) : null,
              tagWashCount: isLinked ? (tagWashCount ?? 0) : null,
              tagWashLimit: isLinked ? (tagWashLimit ?? washLimit ?? 50) : null,
              status: isLinked ? (rawStatus || item.status || "scanned") : "unassigned",
              isUnassigned: !isLinked,
              createdAt:
                item.createdAt || item.scannedAt || new Date().toISOString(),
              location: item.location || scanner?.location || "Main Floor",
              batchId: batchInfo.resolvedBatchId,
              activeBatchId: batchInfo.activeBatchId,
              resolvedBatchId: batchInfo.resolvedBatchId,
              activeBatchName: batchInfo.activeBatchName,
              lastBatchName: batchInfo.lastBatchName,
              resolvedBatchName: batchInfo.resolvedBatchName,
              batchType: batchInfo.batchType,
              isComplaintEligible: batchInfo.isComplaintEligible,
            };
          });

        if (newItems.length > 0) {
          const latestEpc = newItems[newItems.length - 1].epc;
          setLastEpc(latestEpc);
          safeSetItem(LAUNDRY_BULK_SCAN_LAST_EPC_KEY, latestEpc);

          // Automatically switch to the respective tab that received scanned items
          const groupCounts = {
            [LAUNDRY_BULK_SCAN_GROUPS.NEW_UNLINKED]: 0,
            [LAUNDRY_BULK_SCAN_GROUPS.EXISTING_LINKED]: 0,
            [LAUNDRY_BULK_SCAN_GROUPS.DETACHED]: 0,
          };
          newItems.forEach((item) => {
            const group = getItemScanGroup(item);
            groupCounts[group] = (groupCounts[group] || 0) + 1;
          });

          let targetGroup = getItemScanGroup(newItems[0]);
          let maxCount = 0;
          Object.entries(groupCounts).forEach(([group, count]) => {
            if (count > maxCount) {
              maxCount = count;
              targetGroup = group;
            }
          });

          if (targetGroup) {
            setActiveTab(targetGroup);
            setCurrentPage(0);
          }
        }

        const combined = [...newItems, ...prev];
        safeSetItem(LAUNDRY_BULK_SCAN_ENTRIES_KEY, combined);
        return combined;
      });

      const incomingSessionId =
        getValidUuid(data.sessionId) || getValidUuid(data.session?.id);
      if (incomingSessionId) {
        const nextSession = {
          id: incomingSessionId,
          status: "active",
          startedAt: session?.startedAt || new Date().toISOString(),
        };
        setSession(nextSession);
        safeSetItem(LAUNDRY_BULK_SCAN_SESSION_KEY, nextSession);
      } else if (!session) {
        setSession({
          status: "active",
          startedAt: new Date().toISOString(),
        });
      }
    }
  }, [partnersList, scanner, session]);

  // Dedicated listener for session finished from APK
  const handleSessionFinished = useCallback(() => {
    if (commandTimeoutRef.current) {
      clearTimeout(commandTimeoutRef.current);
      commandTimeoutRef.current = null;
    }
    setIsCommandRunning(null);

    const stopDoneTime = new Date();
    const stopStartTime = stopTransitionTimeRef.current;
    let stopDuration = "";
    if (stopStartTime) {
      const diffSec = Math.max(
        0,
        Math.floor((stopDoneTime.getTime() - stopStartTime.getTime()) / 1000),
      );
      const mins = Math.floor(diffSec / 60);
      const secs = diffSec % 60;
      stopDuration = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    stopTransitionTimeRef.current = null;
    startTransitionTimeRef.current = null;
    activeScanStartTimeRef.current = null;

    setSession((prev) => {
      const next = prev ? { ...prev, status: "stopped" } : null;
      if (next) safeSetItem(LAUNDRY_BULK_SCAN_SESSION_KEY, next);
      else safeRemoveItem(LAUNDRY_BULK_SCAN_SESSION_KEY);
      return next;
    });

    const scannerName = scanner?.name || scanner?.scannerName || "Fixed Scanner";
    toast.scannerStop({
      message: "Scanner Stopped",
      totalDuration: stopDuration,
      isFinal: true,
      scannerName,
      duration: 3000,
    });
  }, [scanner]);

  const handleSessionStarted = useCallback(() => {
    if (commandTimeoutRef.current) {
      clearTimeout(commandTimeoutRef.current);
      commandTimeoutRef.current = null;
    }
    if (startTransitionTimeRef.current) {
      startTransitionTimeRef.current = null;
      toast.dismiss("scanner-session-toast");
    }
    setIsCommandRunning(null);
    setSession((prev) => {
      const next = prev
        ? { ...prev, status: "active" }
        : { status: "active", startedAt: new Date().toISOString() };
      safeSetItem(LAUNDRY_BULK_SCAN_SESSION_KEY, next);
      return next;
    });
  }, []);

  const handleSessionUpdated = useCallback((payload) => {
    const data = payload?.data?.data ?? payload?.data ?? payload ?? {};
    const status = data?.session?.status || data?.status;
    if (status === "stopped" || status === "finished" || status === "closed") {
      handleSessionFinished();
    } else if (status === "active") {
      handleSessionStarted();
    }
  }, [handleSessionFinished, handleSessionStarted]);

  // Listen to live scanner events via socket
  useSocketEvent(SOCKET_EVENTS.SCAN_SESSION_FINISHED, handleSessionFinished);
  useSocketEvent(SOCKET_EVENTS.SCAN_SESSION_STARTED, handleSessionStarted);
  useSocketEvent(SOCKET_EVENTS.SCAN_SESSION_UPDATED, handleSessionUpdated);
  useSocketEvents(
    useMemo(
      () => [
        SOCKET_EVENTS.SCANNER_SCAN_BULK,
        SOCKET_EVENTS.SCAN_ENTRIES_UPDATED,
      ],
      [],
    ),
    handleLiveScanEvent,
  );

  // Auto-switch to tab that has data if current active tab has 0 entries
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!allEntries || allEntries.length === 0) return;
    const groupCounts = {
      [LAUNDRY_BULK_SCAN_GROUPS.NEW_UNLINKED]: 0,
      [LAUNDRY_BULK_SCAN_GROUPS.EXISTING_LINKED]: 0,
      [LAUNDRY_BULK_SCAN_GROUPS.DETACHED]: 0,
    };
    allEntries.forEach((item) => {
      const g = getItemScanGroup(item);
      groupCounts[g] = (groupCounts[g] || 0) + 1;
    });

    if (groupCounts[activeTab] === 0) {
      if (groupCounts[LAUNDRY_BULK_SCAN_GROUPS.NEW_UNLINKED] > 0) {
        setActiveTab(LAUNDRY_BULK_SCAN_GROUPS.NEW_UNLINKED);
        setCurrentPage(0);
      } else if (groupCounts[LAUNDRY_BULK_SCAN_GROUPS.EXISTING_LINKED] > 0) {
        setActiveTab(LAUNDRY_BULK_SCAN_GROUPS.EXISTING_LINKED);
        setCurrentPage(0);
      } else if (groupCounts[LAUNDRY_BULK_SCAN_GROUPS.DETACHED] > 0) {
        setActiveTab(LAUNDRY_BULK_SCAN_GROUPS.DETACHED);
        setCurrentPage(0);
      }
    }
  }, [allEntries, activeTab]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleClearSession = async () => {
    setIsClearing(true);
    try {
      if (
        session?.id &&
        !String(session.id).startsWith("scan-") &&
        !String(session.id).startsWith("session-")
      ) {
        try {
          await clearLaundryScannerSession(session.id);
        } catch (apiErr) {
          // If the backend session expired or is not found, log warning and continue with local cleanup
          console.warn("Backend session clear:", apiErr);
        }
      }
    } catch (err) {
      console.warn("Error during session clear:", err);
    } finally {
      clearActiveLaundryScan();
      safeRemoveItem(LAUNDRY_BULK_SCAN_SESSION_KEY);
      safeRemoveItem(LAUNDRY_BULK_SCAN_ENTRIES_KEY);
      safeRemoveItem(LAUNDRY_BULK_SCAN_LAST_EPC_KEY);
      setSession(null);
      setAllEntries([]);
      setLastEpc(null);
      setSelectedTagIds(new Set());
      setIsClearing(false);
      toast.dismiss("scanner-session-toast");
      toast.success("Bulk scan entries cleared successfully");
    }
  };

  const handleCreateComplaintFromSelection = async (customRows) => {
    const selectedRows =
      Array.isArray(customRows) && customRows.length > 0
        ? customRows
        : allEntries.filter((r) => selectedTagIds.has(r.id));

    if (selectedRows.length === 0) {
      toast.error("Please select at least one tag to file a complaint.");
      return;
    }

    const epcsToVerify = selectedRows
      .map((r) => r.epc)
      .filter(Boolean);

    if (epcsToVerify.length === 0) {
      toast.error("Please select at least one RFID tag to file a complaint.");
      return;
    }

    try {
      // Call backend API to verify eligibility against the live database
      const res = await verifyLaundryComplaintEligibility({
        epcs: epcsToVerify,
        tags: selectedRows.map((r) => ({
          epc: r.epc,
          assetName: r.assetName || r.title,
        })),
      });

      const data = res?.data || res;
      const eligibleTags = data?.eligibleTags || [];
      const ineligibleTags = data?.ineligibleTags || [];

      if (!eligibleTags || eligibleTags.length === 0) {
        toast.error(
          "This tag is not linked to any business partner or batch, so a complaint cannot be filed.",
        );
        return;
      }

      if (ineligibleTags.length > 0) {
        toast.warning(
          `${ineligibleTags.length} unlinked tag(s) excluded. Proceeding with ${eligibleTags.length} linked tag(s).`,
        );
      }

      const primaryTag = eligibleTags[0];
      const primaryBatchName = data.primaryBatchName || primaryTag.resolvedBatchName;
      const primaryAssetName = data.primaryAssetName || primaryTag.assetName || "Standard Linen";
      const primaryEpc = data.primaryEpc || primaryTag.epc;
      const tenantId = data.tenantId || primaryTag.tenantId || "";
      const partnerName = data.partnerName || primaryTag.partnerName || "";

      const tagDetails = eligibleTags
        .map(
          (t, idx) =>
            `${idx + 1}. Tag EPC: ${t.epc}\n   Asset Name: ${t.assetName || "Standard Linen"}\n   Batch Name: ${t.resolvedBatchName} (${t.batchType === "active" ? "Active Batch" : "Last Linked Batch"})\n   Business Partner: ${t.partnerName || partnerName || "N/A"}`,
        )
        .join("\n\n");

      const subject = `Tag Discrepancy - Batch ${primaryBatchName} (${eligibleTags.length} Tag(s))`;
      const description = `Complaint regarding scanned RFID tag(s) and batch discrepancy:\n\n${tagDetails}\n\nRemarks / Observed Issue:\n`;

      navigate("/laundry/complaints/create", {
        state: {
          recipientId: tenantId,
          partnerName,
          batchName: primaryBatchName,
          batchType: primaryTag.batchType,
          assetName: primaryAssetName,
          epc: primaryEpc,
          subject,
          description,
          selectedTags: eligibleTags,
        },
      });
    } catch (err) {
      console.error("Tag eligibility verification error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "This tag is not linked to any business partner or batch, so a complaint cannot be filed.";
      toast.error(msg);
    }
  };

  const handleBatchAction = async (action, customRows) => {
    const selectedRows =
      Array.isArray(customRows) && customRows.length > 0
        ? customRows
        : allEntries.filter((r) => selectedTagIds.has(r.id));

    if (selectedRows.length === 0) {
      toast.error(
        `Please select at least one tag to ${action === "check_in" ? "check in" : "check out"}.`,
      );
      return;
    }

    // Resolve batch for each row
    const rowsWithBatch = selectedRows.map((r) => {
      let bId = r.batchId || r.activeBatchId || r.resolvedBatchId;
      if (!bId && r.resolvedBatchName) {
        bId =
          activeBatchesMapRef.current?.get(r.resolvedBatchName)?.batchId ||
          completedBatchesMapRef.current?.get(r.resolvedBatchName)?.batchId;
      }
      if (!bId && r.activeBatchName) {
        bId = activeBatchesMapRef.current?.get(r.activeBatchName)?.batchId;
      }
      return { ...r, batchId: bId };
    });

    const unlinkedRows = rowsWithBatch.filter((r) => !r.batchId);
    const validRows = rowsWithBatch.filter((r) => Boolean(r.batchId));

    if (validRows.length === 0) {
      toast.error(
        "Selected tag(s) are not associated with any active batch and cannot be processed.",
      );
      return;
    }

    const targetScannerId = scanner?.id || scanner?.scannerId;
    if (!targetScannerId) {
      toast.error(
        "No active scanner detected. Please select or connect a scanner.",
      );
      return;
    }

    // Group valid rows by batchId
    const batchesMap = new Map();
    validRows.forEach((r) => {
      if (!batchesMap.has(r.batchId)) {
        batchesMap.set(r.batchId, []);
      }
      batchesMap.get(r.batchId).push(r.epc);
    });

    setIsActionInProgress(true);

    try {
      for (const [batchId, epcs] of batchesMap.entries()) {
        const validSessionId = getValidUuid(session?.id);
        const payload = {
          scannerId: targetScannerId,
          batchId,
          ...(validSessionId ? { sessionId: validSessionId } : {}),
          epcs,
          scanAction: action,
        };

        const res = await testLaundryScannerScan(payload);
        const data = res?.data?.data || res?.data || res;

        // Enrich with businessName if available from selected entries
        const matchedEntry = allEntries.find((e) => e.batchId === batchId || e.resolvedBatchId === batchId);
        const batchBusinessName = matchedEntry?.businessName || matchedEntry?.tenant?.businessName || null;
        if (!data.businessName && batchBusinessName) {
          data.businessName = batchBusinessName;
          if (data.business) data.business.name = batchBusinessName;
          if (data.batch) data.batch.businessName = batchBusinessName;
        }

        const notices = normalizeAutomaticScanUndoNotices(data, "laundry");
        if (notices.length > 0) {
          setUndoNotices((current) => mergeUndoNotices(current, notices));
        }

        // If a real database session ID was returned, update local session
        const returnedSessionId =
          getValidUuid(data?.session?.id) ||
          getValidUuid(data?.scanSessionId) ||
          getValidUuid(data?.sessionId);
        if (returnedSessionId) {
          const nextSession = {
            id: returnedSessionId,
            status: data?.session?.status || "active",
            startedAt: data?.session?.startedAt || new Date().toISOString(),
          };
          setSession(nextSession);
          safeSetItem(LAUNDRY_BULK_SCAN_SESSION_KEY, nextSession);
        }

        // Update local entries state immediately
        setAllEntries((prev) => {
          const epcSet = new Set(epcs);
          const updated = prev.map((item) => {
            if (!epcSet.has(item.epc)) return item;
            if (action === "check_in") {
              return {
                ...item,
                status: "at_laundry",
              };
            }
            if (action === "check_out") {
              const currentWash = Number(item.washCount || 0) + 1;
              const currentTagWash = Number(item.tagWashCount || 0) + 1;
              return {
                ...item,
                status: "sent_to_business",
                washCount: currentWash,
                tagWashCount: currentTagWash,
              };
            }
            return item;
          });
          safeSetItem(LAUNDRY_BULK_SCAN_ENTRIES_KEY, updated);
          return updated;
        });

        if (data?.notification?.message) {
          toast.success(data.notification.message);
        } else {
          const actionLabel =
            action === "check_in" ? "checked in" : "checked out";
          toast.success(`${epcs.length} tag(s) ${actionLabel} successfully.`);
        }
      }

      if (unlinkedRows.length > 0) {
        toast.warning(
          `${unlinkedRows.length} unlinked tag(s) were skipped as they have no batch association.`,
        );
      }

      // Clear selections after processing
      setSelectedTagIds(new Set());
    } catch (err) {
      console.error(`Failed to ${action}:`, err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        `Failed to ${action === "check_in" ? "check in" : "check out"} batch tags.`;
      toast.error(errMsg);
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleFixedCommand = async (command) => {
    if (commandTimeoutRef.current) {
      clearTimeout(commandTimeoutRef.current);
      commandTimeoutRef.current = null;
    }
    setIsCommandRunning(command);
    try {
      if (command === "start") {
        const validId = getValidUuid(session?.id);
        const startedAt = new Date().toISOString();
        const nextSession = {
          ...(validId ? { id: validId } : {}),
          status: "starting",
          startedAt,
        };
        setSession(nextSession);
        if (validId) safeSetItem(LAUNDRY_BULK_SCAN_SESSION_KEY, nextSession);

        activeScanStartTimeRef.current = new Date(startedAt);

        if (scanner?.id) {
          await issueLaundryFixedScannerCommand(scanner.id, "start");
        }

        const scannerName = scanner?.name || scanner?.scannerName || "Fixed Scanner";
        startTransitionTimeRef.current = new Date(startedAt);
        stopTransitionTimeRef.current = null;

        toast.scannerStart({
          message: "Starting Scanner...",
          startTime: startedAt,
          formattedTime: formatTimeWithUserPreferences(startedAt, true),
          scannerName,
          duration: 0,
        });

        // 15-second safety fallback: if APK/scanner device is turned off or disconnected
        commandTimeoutRef.current = setTimeout(() => {
          setIsCommandRunning(null);
          toast.dismiss("scanner-session-toast");
          setSession((prev) => ({
            ...(prev || {}),
            status: "offline",
          }));
          toast.error(
            "Scanner is offline or not responding. Please make sure the scanner device is turned on and connected.",
          );
        }, 15000);
      } else if (command === "stop") {
        const scannerName = scanner?.name || scanner?.scannerName || "Fixed Scanner";
        const stopStart = new Date();
        stopTransitionTimeRef.current = stopStart;
        startTransitionTimeRef.current = null;

        setSession((prev) => ({
          ...(prev || {}),
          status: "stopping",
        }));

        // Red danger live timer counting until APK actually closes the session
        toast.scannerStop({
          message: "Stopping Scanner...",
          startTime: stopStart.toISOString(),
          formattedTime: formatTimeWithUserPreferences(stopStart, true),
          scannerName,
          isFinal: false,
          duration: 0,
        });

        if (scanner?.id) {
          await issueLaundryFixedScannerCommand(scanner.id, "stop");
        }

        // 15-second safety fallback if APK/tablet doesn't respond via socket
        commandTimeoutRef.current = setTimeout(() => {
          setIsCommandRunning(null);
          toast.dismiss("scanner-session-toast");
          setSession((prev) => ({
            ...(prev || {}),
            status: "stopped",
          }));
        }, 15000);
      } else if (command === "rescan") {
        if (scanner?.id) {
          await issueLaundryFixedScannerCommand(scanner.id, "rescan");
          toast.success("Rescan command sent to scanner");
        } else {
          toast.info("Scanner ready for rescan.");
        }
        setIsCommandRunning(null);
      }
    } catch (err) {
      console.error(err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        `Unable to send ${command} command to scanner`;
      toast.error(errMsg);
      setIsCommandRunning(null);
      setSession((prev) => ({
        ...(prev || {}),
        status: "offline",
      }));
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
        commandTimeoutRef.current = null;
      }
    }
  };

  // Compute live counts
  const counts = useMemo(() => {
    let newUnlinked = 0;
    let existingLinked = 0;
    let detached = 0;

    allEntries.forEach((item) => {
      const group = getItemScanGroup(item);
      if (group === LAUNDRY_BULK_SCAN_GROUPS.DETACHED) {
        detached += 1;
      } else if (group === LAUNDRY_BULK_SCAN_GROUPS.NEW_UNLINKED) {
        newUnlinked += 1;
      } else {
        existingLinked += 1;
      }
    });

    return {
      totalTags: allEntries.length,
      newUnlinked,
      existingLinked,
      detached,
    };
  }, [allEntries]);

  const scanTabsWithCounts = useMemo(
    () => [
      {
        label: "New Unlinked",
        value: LAUNDRY_BULK_SCAN_GROUPS.NEW_UNLINKED,
        count: counts.newUnlinked,
      },
      {
        label: "Existing Linked",
        value: LAUNDRY_BULK_SCAN_GROUPS.EXISTING_LINKED,
        count: counts.existingLinked,
      },
      {
        label: "Detached",
        value: LAUNDRY_BULK_SCAN_GROUPS.DETACHED,
        count: counts.detached,
      },
    ],
    [counts],
  );

  // Partner filter options
  const partnerOptions = useMemo(
    () => [
      { value: "all", label: "All Businesses" },
      ...partnersList.map((p) => ({
        value: String(p.id),
        label: p.name,
      })),
    ],
    [partnersList],
  );

  const eligibleSelectedCount = useMemo(() => {
    return allEntries.filter(
      (r) =>
        selectedTagIds.has(r.id) &&
        !r.isUnassigned &&
        r.status !== "unassigned" &&
        r.status !== "unlinked" &&
        Boolean(r.tenantId || r.businessName) &&
        Boolean(r.activeBatchName || r.lastBatchName || r.resolvedBatchName),
    ).length;
  }, [allEntries, selectedTagIds]);

  // Filtered entries based on active tab, search, and partner filter
  const filteredEntries = useMemo(() => {
    return allEntries.filter((item) => {
      const group = getItemScanGroup(item);

      // Group / Tab filter
      if (activeTab !== group) {
        return false;
      }

      // Search filter
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const epcMatch = item.epc?.toLowerCase().includes(query);
        const nameMatch = item.assetName?.toLowerCase().includes(query);
        const partnerMatch = item.businessName?.toLowerCase().includes(query);
        if (!epcMatch && !nameMatch && !partnerMatch) return false;
      }

      // Partner filter
      if (partnerFilter !== "all") {
        if (
          String(item.tenantId) !== partnerFilter &&
          item.businessName !== partnerFilter
        ) {
          return false;
        }
      }

      return true;
    });
  }, [allEntries, activeTab, search, partnerFilter]);

  const isManualMode =
    String(scanner?.scannerMode || scanner?.mode || "").toLowerCase() === "manual";

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-(--theme-text-primary)">
            <ScanLine className="text-(--color-aurora-teal)" size={24} />
            <h1 className="m-0 text-2xl font-black">Bulk Scan Tags</h1>
          </div>
          <p className="m-0 text-xs text-(--theme-text-muted)">
            Live RFID batch scanning and tag detection for partner inventory.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedTagIds.size > 0 && (
            <>
              {isManualMode && (
                <>
                  <Button
                    disabled={isActionInProgress}
                    leftIcon={<LogIn size={15} />}
                    loading={isActionInProgress}
                    onClick={() => handleBatchAction("check_in")}
                    size="md"
                    variant="primary"
                  >
                    Check In ({selectedTagIds.size})
                  </Button>
                  <Button
                    disabled={isActionInProgress}
                    leftIcon={<LogOut size={15} />}
                    loading={isActionInProgress}
                    onClick={() => handleBatchAction("check_out")}
                    size="md"
                    variant="secondary"
                  >
                    Check Out ({selectedTagIds.size})
                  </Button>
                </>
              )}
              <Button
                leftIcon={<AlertTriangle size={15} />}
                onClick={handleCreateComplaintFromSelection}
                size="md"
                variant="outline"
              >
                Complaint ({selectedTagIds.size})
              </Button>
            </>
          )}
          <Button
            disabled={!session && allEntries.length === 0}
            loading={isClearing}
            onClick={handleClearSession}
            size="md"
            variant="secondary"
          >
            Clear All Entries
          </Button>
        </div>
      </div>

      {!session && (
        <Alert variant="info">
          No active scanner session detected. Start or trigger your RFID scanner to stream live tags into the system.
        </Alert>
      )}

      {loadError && (
        <Alert variant="danger">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{loadError}</span>
            <Button
              leftIcon={<RefreshCw size={14} />}
              onClick={() => setLoadError("")}
              size="sm"
              variant="outline"
            >
              Dismiss
            </Button>
          </div>
        </Alert>
      )}

      <GlobalUndoBanners inline portal="laundry" />

      {/* Live Scanner Status Card */}
      <ScannerStatusCard
        hasEntries={allEntries.length > 0}
        isActionInProgress={isActionInProgress}
        isClearing={isClearing}
        isCommandRunning={isCommandRunning}
        lastEpc={lastEpc}
        onCheckIn={() => handleBatchAction("check_in")}
        onCheckOut={() => handleBatchAction("check_out")}
        onClearSession={handleClearSession}
        onCreateComplaint={handleCreateComplaintFromSelection}
        onFixedCommand={handleFixedCommand}
        onSelectScanner={setScanner}
        scanner={scanner}
        scannersList={scannersList}
        selectedCount={selectedTagIds.size}
        eligibleSelectedCount={eligibleSelectedCount}
        session={session}
      />

      {/* Summary KPI Cards */}
      <SummaryCards counts={counts} loading={isLoading} />

      {/* Main Scanned Entries Card */}
      <Card padding="0" rounded="18px">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--theme-border) px-4 py-4">
          <div className="min-w-0 flex-[1_1_520px] overflow-x-auto overscroll-x-contain">
            <Tabs
              className="w-max border-0 bg-transparent p-0 shadow-none"
              itemClassName="min-w-[150px] overflow-hidden"
              equalWidth={false}
              items={scanTabsWithCounts}
              onChange={(tab) => {
                setActiveTab(tab);
                setCurrentPage(0);
              }}
              value={activeTab}
            />
          </div>
        </div>

        <div className="space-y-4 p-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[minmax(240px,1fr)_200px_auto]">
            <Input
              leftIcon={<Search size={16} />}
              onChange={(val) => {
                setSearch(val);
                setCurrentPage(0);
              }}
              placeholder="Search by tag EPC, item name, business..."
              value={search}
            />
            <Dropdown
              onChange={(val) => {
                setPartnerFilter(val);
                setCurrentPage(0);
              }}
              options={partnerOptions}
              value={partnerFilter}
              placeholder="Filter by Business"
              search={partnerOptions.length > 6}
            />
            <Button
              leftIcon={<RefreshCw size={15} />}
              onClick={() => {
                // Trigger refresh / recheck
                toast.info("Scanned entries refreshed");
              }}
              size="md"
              variant="outline"
            >
              Refresh
            </Button>
          </div>

          <BulkScanEntriesTable
            isActionInProgress={isActionInProgress}
            isManualMode={isManualMode}
            loading={isLoading}
            onCheckIn={(selectedRows) =>
              handleBatchAction("check_in", selectedRows)
            }
            onCheckOut={(selectedRows) =>
              handleBatchAction("check_out", selectedRows)
            }
            onCreateComplaint={handleCreateComplaintFromSelection}
            onPageChange={({ selected }) => setCurrentPage(selected)}
            onSelectionChange={setSelectedTagIds}
            pagination={{
              page: currentPage + 1,
              limit: 50,
              total: filteredEntries.length,
              totalPages: Math.ceil(filteredEntries.length / 50) || 1,
            }}
            rows={filteredEntries.slice(currentPage * 50, (currentPage + 1) * 50)}
          />
        </div>
      </Card>
    </div>
  );
};

export default LaundryBulkScanningIndex;

const ACTIVE_LAUNDRY_SCAN_KEY = "active-laundry-scan-context";

const getSessionId = (payload) =>
  payload?.data?.data?.session?.id ??
  payload?.data?.session?.id ??
  payload?.session?.id ??
  payload?.data?.data?.sessionId ??
  payload?.data?.sessionId ??
  payload?.sessionId ??
  null;

const getBatchId = (payload) =>
  payload?.data?.data?.batch?.id ??
  payload?.data?.batch?.id ??
  payload?.batch?.id ??
  payload?.data?.data?.batchId ??
  payload?.data?.batchId ??
  payload?.batchId ??
  payload?.data?.session?.batchId ??
  payload?.session?.batchId ??
  payload?.data?.data?.session?.laundryBatchId ??
  payload?.data?.session?.laundryBatchId ??
  payload?.session?.laundryBatchId ??
  null;

const getScannerId = (payload) => {
  const data = payload?.data?.data ?? payload?.data ?? payload ?? {};
  return data.scannerId ?? data.session?.scannerId ?? null;
};

const getTagIds = (payload) => {
  const data = payload?.data?.data ?? payload?.data ?? payload ?? {};
  const records = [
    ...(Array.isArray(data.results) ? data.results : []),
    ...(Array.isArray(data.processedItems) ? data.processedItems : []),
    ...(Array.isArray(data.entries) ? data.entries : []),
  ];

  return records
    .filter((item) => item?.accepted !== false)
    .map(
      (item) =>
        item?.tagId ??
        item?.tag?.id ??
        item?.tag?._id ??
        item?.scannedTag?.tagId ??
        item?.scannedTag?.tag?.id ??
        item?.entry?.tagId,
    )
    .filter(Boolean);
};

const getAffectedBatchIds = (payload) => {
  const data = payload?.data?.data ?? payload?.data ?? payload ?? {};
  const explicitIds = Array.isArray(data.affectedBatchIds)
    ? data.affectedBatchIds
    : [];
  const resultIds = Array.isArray(data.results)
    ? data.results.map((item) => item?.batchId)
    : [];
  const counterIds = Array.isArray(data.batchCounters)
    ? data.batchCounters.map((item) => item?.batchId)
    : [];
  return [...new Set([...explicitIds, ...resultIds, ...counterIds].filter(Boolean))];
};

export const getActiveLaundryScan = () => {
  try {
    const value = sessionStorage.getItem(ACTIVE_LAUNDRY_SCAN_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export const captureLaundryScanEvent = (payload) => {
  const previous = getActiveLaundryScan() || {};
  const incomingId = getSessionId(payload);
  const data = payload?.data?.data ?? payload?.data ?? payload ?? {};
  const terminal = ["finished", "cleared"].includes(data.session?.status);
  if (terminal && previous.sessionId && incomingId !== previous.sessionId) return previous;
  const current = incomingId && incomingId !== previous.sessionId ? {} : previous;
  const sessionId = getSessionId(payload) || current.sessionId || null;
  const batchId = getBatchId(payload) || current.batchId || null;
  const scannerId = getScannerId(payload) || current.scannerId || null;
  const affectedBatchIds = [
    ...new Set([...(current.affectedBatchIds || []), ...getAffectedBatchIds(payload)]),
  ];
  const tagIds = [
    ...new Set([...(current.tagIds || []), ...getTagIds(payload)]),
  ];
  const next = {
    sessionId: terminal ? null : sessionId,
    scannerId,
    batchId: batchId || (affectedBatchIds.length === 1 ? affectedBatchIds[0] : null),
    affectedBatchIds,
    tagIds: terminal ? [] : tagIds,
  };

  try {
    sessionStorage.setItem(ACTIVE_LAUNDRY_SCAN_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("laundry-scan-context-changed", {
      detail: next,
    }));
  } catch {
    // Live navigation and the backend refetch continue when storage is unavailable.
  }

  return next;
};

export const clearActiveLaundryScan = () => {
  try {
    sessionStorage.removeItem(ACTIVE_LAUNDRY_SCAN_KEY);
    window.dispatchEvent(new CustomEvent("laundry-scan-context-changed", { detail: null }));
  } catch {
    // No-op when browser storage is unavailable.
  }
};

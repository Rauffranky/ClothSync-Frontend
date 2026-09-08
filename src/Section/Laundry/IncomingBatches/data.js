import { formatDateTime } from "../../../Utils/date";
import { formatStatusLabel } from "../../../Utils/status";

export const batchStatusLabels = {
  dispatched: "Sent to Laundry",
  partially_completed: "Partially Completed",
  at_laundry: "Received",
  washed: "Washed",
  sent_to_business: "Sent to Business",
  partially_returned: "Partially Returned",
  completed: "Completed",
  delayed: "Delayed",
};

export const batchStatusColors = {
  partially_completed: "orange",
  at_laundry: "purple",
  completed: "green",
  delayed: "red",
};

const statusVariants = {
  dispatched: "info",
  ready_for_check_in: "info",
  partially_completed: "warning",
  partially_checked_in: "warning",
  received: "purple",
  at_laundry: "purple",
  checked_in: "success",
  completed: "success",
  delayed: "danger",
};

const statusColorVariants = {
  orange: "warning",
  purple: "purple",
  green: "success",
  red: "danger",
};

export const itemStatusLabels = {
  sent: "Pending Scan",
  at_laundry: "Received",
  missing: "Missing",
  damaged: "Damaged",
  delayed: "Delayed",
};

const itemStatusVariants = {
  sent: "neutral",
  at_laundry: "success",
  missing: "warning",
  damaged: "danger",
  delayed: "danger",
};

const getBusinessName = (batch) => {
  const business = batch.tenant || batch.business || batch.tenantProfile || {};
  return business.businessName || business.companyName || business.name || batch.businessName || "—";
};

const getCount = (...values) => {
  for (const value of values) {
    if (Array.isArray(value)) return value.length;
    if (value === null || value === undefined || value === "") continue;

    const count = Number(value);
    if (Number.isFinite(count)) return count;
  }

  return null;
};

const checkedInStatuses = new Set([
  "accepted",
  "at_laundry",
  "checked_in",
  "in_laundry",
  "received",
]);

const clampCheckedInCount = (count, total) =>
  total > 0 ? Math.min(Math.max(count, 0), total) : Math.max(count, 0);

const getCheckedInTagCount = (batch, total, statusValue) => {
  const summary = batch.summary || batch.progress || batch.counts || {};
  const explicitCount = getCount(
    batch.receivedCount,
    batch.checkedInTagsCount,
    batch.checkedInTagCount,
    batch.tagsCheckedIn,
    batch.checkedInItemsCount,
    batch.receivedItemsCount,
    batch.checkedInItems,
    batch.receivedItems,
    batch.checkedInCount,
    summary.receivedCount,
    summary.checkedInTagsCount,
    summary.checkedInTagCount,
    summary.checkedInItems,
    summary.receivedItems,
    summary.checkedInCount,
  );

  if (explicitCount !== null) return clampCheckedInCount(explicitCount, total);

  const checkedInItems = getBatchItems(batch).filter((item) =>
    checkedInStatuses.has(
      String(item.status || item.tag?.currentStatus || "").toLowerCase(),
    ),
  ).length;
  if (checkedInItems > 0) return clampCheckedInCount(checkedInItems, total);

  return checkedInStatuses.has(String(statusValue).toLowerCase()) ? total : 0;
};

export const normalizeIncomingBatch = (batch = {}) => {
  const summary = batch.summary || batch.progress || batch.counts || {};
  const batchItems = getBatchItems(batch);
  const declaredTotal = Number(batch.totalCount ?? summary.totalCount ?? batch.totalTagsCount ?? batch.totalItems ?? batch.itemsCount) || 0;
  // Details responses can contain the complete item list while an older count
  // field is stale. Never render fewer items than the rows we actually show.
  const total = Math.max(declaredTotal, batchItems.length);
  const statusValue = batch.status || "dispatched";
  const checkedIn = getCheckedInTagCount(batch, total, statusValue);
  const receivedCount = getCount(batch.receivedCount, summary.receivedCount, checkedIn) ?? 0;
  const receivedNowCount = getCount(batch.receivedNowCount, summary.receivedNowCount) ?? 0;
  const missingCount = getCount(batch.missingCount, summary.missingCount) ?? 0;
  const pendingCount = getCount(batch.pendingCount, summary.pendingCount) ?? Math.max(total - receivedCount - missingCount, 0);

  return {
    ...batch,
    apiId: batch.id || batch._id,
    id: batch.batchCode || batch.code || batch.batchId || batch.id || "—",
    business: getBusinessName(batch),
    location: batch.dispatchLocation || batch.location || batch.zoneName || "—",
    dispatchAt: formatDateTime(batch.dispatchedAt || batch.dispatchDate || batch.createdAt),
    total,
    checkedIn,
    totalCount: total,
    receivedCount,
    receivedNowCount,
    missingCount,
    pendingCount,
    receiptComplete:
      pendingCount === 0 && missingCount === 0 && receivedCount === total,
    status: batchStatusLabels[statusValue] || batch.statusLabel || formatStatusLabel(statusValue),
    statusValue,
    statusVariant:
      statusColorVariants[batchStatusColors[statusValue]] ||
      statusVariants[statusValue] ||
      "neutral",
    delayed: Number(batch.delayedItems ?? batch.delayedCount) || 0,
    lastActivity: formatDateTime(batch.lastActivityAt || batch.updatedAt),
    notes: batch.notes || batch.description || "—",
    items: batchItems.map(normalizeIncomingBatchItem),
  };
};

const getNestedName = (record, fallback = "—") =>
  record?.name || record?.title || record?.assetName || record?.translations?.en?.title || fallback;

export function normalizeIncomingBatchItem(item = {}) {
  const tag = item.tag || item.scannedTag || item;
  const asset = item.asset || tag.asset || {};
  const category = item.category || asset.category || {};
  const statusValue = String(item.status || tag.currentStatus || "sent").toLowerCase();
  return {
    ...item,
    id: item.id || item._id || tag.id || tag._id || tag.epc,
    tagId: tag.id || tag._id || item.tagId || null,
    epc: tag.epc || item.epc || "—",
    tagCode: tag.tagCode || item.tagCode || "—",
    assetName: asset.assetName || item.assetName || "—",
    assetCode: asset.assetCode || item.assetCode || "—",
    category: getNestedName(category),
    statusValue,
    status: itemStatusLabels[statusValue] || item.statusLabel || formatStatusLabel(statusValue),
    statusVariant: itemStatusVariants[statusValue] || "neutral",
  };
}

function getBatchItems(batch) {
  const items = batch.items || batch.batchItems || batch.tags || [];
  return Array.isArray(items) ? items : [];
}

export const getIncomingBatchCollection = (response, limit = 10) => {
  const payload = response?.data ?? response ?? {};
  const items = payload.items || payload.batches || payload.docs || payload.results || [];
  const rows = Array.isArray(items) ? items.map(normalizeIncomingBatch) : [];
  const pagination = payload.pagination || payload.meta || {};
  const totalItems = Number(pagination.totalItems ?? pagination.total ?? rows.length) || 0;
  const totalPages = Number(pagination.totalPages ?? pagination.pages ?? Math.ceil(totalItems / limit)) || 0;
  const rawCounts = payload.counts || payload.summary || [];
  const counts = Array.isArray(rawCounts)
    ? Object.fromEntries(rawCounts.filter((item) => item?.key).map((item) => [item.key, Number(item.count) || 0]))
    : rawCounts;

  return { rows, counts: counts || {}, totalItems, totalPages };
};

export const getCompletedBatchCollection = (response, limit = 20) => {
  const payload = response?.data ?? response ?? {};
  const items = payload.items || [];
  const pagination = payload.pagination || {};
  const rows = Array.isArray(items)
    ? items.map((batch) => {
        const progress = batch.progress || {};
        const business = batch.business || {};
        const totalCount = Number(progress.totalCount ?? batch.totalTagsCount) || 0;
        const returnedCount = Number(progress.returnedCount) || 0;
        const exceptionCount = Number(progress.exceptionCount) || 0;
        const missingCount = Number(progress.statusCounts?.missing) || 0;
        const pendingCount = Number(progress.pendingCount) || 0;
        const progressPercent = Number(progress.progressPercent) || 0;
        const statusValue = batch.status || "completed";
        const completionStatusValue = batch.completionStatus || "completed";

        return {
          ...batch,
          apiId: batch.id || batch._id,
          id: batch.batchCode || batch.id || "—",
          business: business.name || business.businessName || "—",
          businessEmail: business.email || "—",
          total: totalCount,
          returnedCount,
          missingCount,
          exceptionCount,
          pendingCount,
          progressPercent: Math.min(Math.max(progressPercent, 0), 100),
          statusValue,
          status:
            batchStatusLabels[statusValue] || formatStatusLabel(statusValue),
          statusVariant:
            statusColorVariants[batchStatusColors[statusValue]] || "neutral",
          completionStatusValue,
          completionStatus:
            batchStatusLabels[completionStatusValue] ||
            formatStatusLabel(completionStatusValue),
          completionStatusVariant:
            statusColorVariants[batchStatusColors[completionStatusValue]] ||
            "neutral",
          completedAt: formatDateTime(batch.completedAt),
          lastActivity: formatDateTime(
            batch.lastReturnActivityAt || batch.completedAt,
          ),
        };
      })
    : [];
  const totalItems = Number(pagination.totalItems ?? rows.length) || 0;
  const totalPages =
    Number(pagination.totalPages ?? Math.ceil(totalItems / limit)) || 0;

  return {
    rows,
    totalItems,
    totalPages,
    stats: payload.stats || {},
  };
};

export const getIncomingBatchDetails = (response) => {
  const payload = response?.data ?? response ?? {};
  return normalizeIncomingBatch(payload.batch || payload.item || payload);
};

export const normalizeReceiptResponse = (response) => {
  const data = response?.data ?? response ?? {};
  const batch = normalizeIncomingBatch(data.batch || {});
  const totalCount = Number(data.totalCount ?? batch.totalCount) || 0;
  const receivedCount = Number(data.receivedCount ?? batch.receivedCount) || 0;
  const receivedNowCount = Number(data.receivedNowCount ?? batch.receivedNowCount) || 0;
  const missingCount = Number(data.missingCount ?? batch.missingCount) || 0;
  const pendingCount = Number(data.pendingCount ?? batch.pendingCount) || 0;

  return {
    totalCount,
    receivedCount,
    receivedNowCount,
    missingCount,
    pendingCount,
    batch: {
      ...batch,
      total: totalCount,
      checkedIn: receivedCount,
      totalCount,
      receivedCount,
      receivedNowCount,
      missingCount,
      pendingCount,
      receiptComplete:
        pendingCount === 0 &&
        missingCount === 0 &&
        receivedCount === totalCount,
    },
  };
};

export const normalizeScanResult = (result = {}) => {
  const tag = result.tag || result.scannedTag?.tag || result.scannedTag || result.entry?.tag || result.entry || {};
  const asset = result.asset || tag.asset || {};
  const category = result.category || asset.category || {};
  const acceptedStatuses = ["accepted", "processed", "success", "checked_in", "checked_out"];
  const accepted = result.accepted === true || acceptedStatuses.includes(String(result.status || "").toLowerCase());
  const reasonCode = result.reason || result.message || null;
  return {
    ...result,
    id: result.id || result.entryId || tag.id || tag.epc || result.epc,
    tagId:
      result.tagId ||
      result.tag?.id ||
      result.tag?._id ||
      result.scannedTag?.tagId ||
      result.scannedTag?.tag?.id ||
      result.scannedTag?.tag?._id ||
      tag.id ||
      tag._id ||
      null,
    epc: result.epc || tag.epc || "—",
    assetName: asset.assetName || result.assetName || "—",
    category: getNestedName(category),
    scannedAt: formatDateTime(result.scannedAt || result.createdAt || new Date()),
    accepted,
    reasonCode,
    reason: reasonCode === "tag_not_in_selected_batch"
      ? "This tag does not belong to the selected incoming batch. No action was taken."
      : reasonCode,
  };
};

const errorMessages = {
  "bulkScanMessages.sessionNotFound": "This scan session is no longer available. Start a new scan.",
  "scannerMessages.scannerInaccessible": "You do not have access to this scanner.",
  "scannerMessages.scannerInactive": "The selected scanner is inactive.",
  tag_not_in_selected_batch: "This tag does not belong to the selected incoming batch.",
};

export const getLaundryBatchErrorMessage = (error, fallback) => {
  if (!error?.response) {
    if (["ERR_NETWORK", "ECONNABORTED", "ETIMEDOUT"].includes(error?.code)) {
      return "Unable to connect to the server. Please try again.";
    }
    return error?.message || fallback;
  }
  const message = error.response?.data?.message || error.message;
  if (errorMessages[message]) return errorMessages[message];
  if (message && /^[a-z]+(?:[A-Z][a-z]+)*Messages\.[A-Za-z]+$/.test(message)) return fallback;
  return message || fallback;
};

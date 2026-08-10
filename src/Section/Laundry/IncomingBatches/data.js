import { formatDateTime } from "../../../Utils/date";
import { formatStatusLabel } from "../../../Utils/status";

const statusVariants = {
  dispatched: "info",
  ready_for_check_in: "info",
  partially_checked_in: "warning",
  received: "success",
  at_laundry: "success",
  checked_in: "success",
  delayed: "danger",
};

const getBusinessName = (batch) => {
  const business = batch.tenant || batch.business || batch.tenantProfile || {};
  return business.businessName || business.companyName || business.name || batch.businessName || "—";
};

export const normalizeIncomingBatch = (batch = {}) => {
  const total = Number(batch.totalItems ?? batch.itemsCount ?? batch.totalTagsCount) || 0;
  const checkedIn = Number(batch.checkedInItems ?? batch.receivedItems ?? batch.checkedInCount) || 0;
  const statusValue = batch.status || "dispatched";

  return {
    ...batch,
    apiId: batch.id || batch._id,
    id: batch.batchCode || batch.code || batch.batchId || batch.id || "—",
    business: getBusinessName(batch),
    location: batch.dispatchLocation || batch.location || batch.zoneName || "—",
    dispatchAt: formatDateTime(batch.dispatchedAt || batch.dispatchDate || batch.createdAt),
    total,
    checkedIn,
    status: batch.statusLabel || formatStatusLabel(statusValue),
    statusValue,
    statusVariant: statusVariants[statusValue] || "neutral",
    delayed: Number(batch.delayedItems ?? batch.delayedCount) || 0,
    lastActivity: formatDateTime(batch.lastActivityAt || batch.updatedAt),
    notes: batch.notes || batch.description || "—",
    items: getBatchItems(batch).map(normalizeIncomingBatchItem),
  };
};

const getNestedName = (record, fallback = "—") =>
  record?.name || record?.title || record?.assetName || record?.translations?.en?.title || fallback;

export function normalizeIncomingBatchItem(item = {}) {
  const tag = item.tag || item.scannedTag || item;
  const asset = item.asset || tag.asset || {};
  const category = item.category || asset.category || {};
  return {
    ...item,
    id: item.id || item._id || tag.id || tag._id || tag.epc,
    tagId: tag.id || tag._id || item.tagId || null,
    epc: tag.epc || item.epc || "—",
    tagCode: tag.tagCode || item.tagCode || "—",
    assetName: asset.assetName || item.assetName || "—",
    assetCode: asset.assetCode || item.assetCode || "—",
    category: getNestedName(category),
    status: item.statusLabel || formatStatusLabel(item.status || tag.currentStatus),
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

export const getIncomingBatchDetails = (response) => {
  const payload = response?.data ?? response ?? {};
  return normalizeIncomingBatch(payload.batch || payload.item || payload);
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
    tagId: result.tagId || result.tag?.id || result.scannedTag?.tagId || result.scannedTag?.tag?.id || tag.id || null,
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

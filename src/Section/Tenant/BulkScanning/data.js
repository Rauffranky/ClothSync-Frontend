export const BULK_SCAN_PAGE_LIMIT = 50;

export const BULK_SCAN_GROUPS = Object.freeze({
  NEW_UNLINKED: "new_unlinked",
  EXISTING_LINKED: "existing_linked",
  DETACHED: "detached",
});

export const BULK_SCAN_TABS = Object.freeze([
  { label: "New Unlinked Tags", value: BULK_SCAN_GROUPS.NEW_UNLINKED },
  { label: "Existing Linked Tags", value: BULK_SCAN_GROUPS.EXISTING_LINKED },
  { label: "Detached Tags", value: BULK_SCAN_GROUPS.DETACHED },
]);

const getNumber = (...values) => {
  const value = values.find((item) => Number.isFinite(Number(item)));
  return value === undefined ? 0 : Number(value);
};

const getRecordId = (record) =>
  record?.id ??
  record?.entryId ??
  record?.tagId ??
  record?.tag?.id ??
  record?.scannedTag?.id ??
  record?.epc;

export const normalizeBulkScanEntry = (record = {}) => {
  const tag = record.tag ?? record.scannedTag ?? record;
  const asset = record.asset ?? tag.asset ?? null;
  const category = record.category ?? tag.category ?? asset?.category ?? null;
  const previousAssignment = record.previousAssignment ?? null;

  return {
    ...record,
    id: getRecordId(record),
    epc: record.epc ?? tag.epc ?? "-",
    scannedAt:
      record.scannedAt ??
      record.lastScannedAt ??
      tag.lastScannedAt ??
      record.createdAt ??
      null,
    location:
      record.location ??
      record.scannerLocation ??
      tag.lastScannedLocation ??
      "-",
    asset,
    category,
    previousAssignment,
  };
};

const getGroupCount = (tabs, group) => {
  const tab = tabs.find(
    (item) => (item.scanGroup ?? item.value ?? item.key) === group,
  );
  return getNumber(tab?.count, tab?.total);
};

export const normalizeBulkScanCounts = (source = {}) => {
  const payload = source?.data ?? source;
  const session = payload?.session ?? payload;
  const counters = payload?.counters ?? payload?.counts ?? {};
  const tabs = Array.isArray(payload?.tabs) ? payload.tabs : [];

  return {
    totalTags: getNumber(
      counters.totalTags,
      counters.totalTagsCount,
      session?.totalTagsCount,
    ),
    existingLinked: getNumber(
      counters.existingLinked,
      counters.existingLinkedCount,
      session?.existingLinkedCount,
      getGroupCount(tabs, BULK_SCAN_GROUPS.EXISTING_LINKED),
    ),
    newUnlinked: getNumber(
      counters.newUnlinked,
      counters.newUnlinkedCount,
      session?.newUnlinkedCount,
      getGroupCount(tabs, BULK_SCAN_GROUPS.NEW_UNLINKED),
    ),
    detached: getNumber(
      counters.detached,
      counters.detachedCount,
      session?.detachedCount,
      getGroupCount(tabs, BULK_SCAN_GROUPS.DETACHED),
    ),
  };
};

export const normalizeBulkScanEntriesResponse = (response) => {
  const payload = response?.data ?? response ?? {};
  const entries = payload.entries ?? {};
  const pagination = entries.pagination ?? {};
  const items = Array.isArray(entries.items) ? entries.items : [];
  const page = getNumber(pagination.page, pagination.currentPage, 1) || 1;
  const limit = getNumber(pagination.limit, pagination.perPage, BULK_SCAN_PAGE_LIMIT);
  const totalItems = getNumber(
    pagination.totalItems,
    pagination.total,
    pagination.totalRecords,
  );
  const totalPages = getNumber(
    pagination.totalPages,
    Math.ceil(totalItems / Math.max(limit, 1)),
  );

  return {
    session: payload.session ?? null,
    scanner: payload.scanner ?? payload.session?.scanner ?? null,
    counts: normalizeBulkScanCounts(payload),
    tabs: Array.isArray(payload.tabs) ? payload.tabs : [],
    rows: items.map(normalizeBulkScanEntry),
    pagination: { page, limit, totalItems, totalPages },
  };
};

export const getLiveScanGroup = (result = {}) => {
  const entry = result.scannedTag ?? result.entry ?? result;
  const explicitGroup = result.scanGroup ?? entry.scanGroup;
  if (Object.values(BULK_SCAN_GROUPS).includes(explicitGroup)) {
    return explicitGroup;
  }

  if (entry.detachedAt || entry.previousAssignment) {
    return BULK_SCAN_GROUPS.DETACHED;
  }

  const mappingStatus = entry.mappingStatus ?? result.mappingStatus;
  if (mappingStatus === "linked") return BULK_SCAN_GROUPS.EXISTING_LINKED;
  return BULK_SCAN_GROUPS.NEW_UNLINKED;
};

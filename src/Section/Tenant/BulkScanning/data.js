export const BULK_SCAN_PAGE_LIMIT = 50;

export const BULK_SCAN_GROUPS = Object.freeze({
  NEW_UNLINKED: "new_unlinked",
  EXISTING_LINKED: "existing_linked",
  DETACHED: "detached",
});

export const BULK_SCAN_TABS = Object.freeze([
  { label: "New Unlinked", value: BULK_SCAN_GROUPS.NEW_UNLINKED },
  { label: "Existing Linked", value: BULK_SCAN_GROUPS.EXISTING_LINKED },
  { label: "Detached", value: BULK_SCAN_GROUPS.DETACHED },
]);

const getNumber = (...values) => {
  const value = values.find((item) => Number.isFinite(Number(item)));
  return value === undefined ? 0 : Number(value);
};

const getNullableNumber = (...values) => {
  const value = values.find((item) => item !== null && item !== undefined && item !== "");
  return value === undefined ? null : Number(value);
};

const getRecordId = (record) =>
  record?.tempTagId ??
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
    tempTagId: record.tempTagId ?? tag.tempTagId ?? null,
    tagId: record.tagId ?? tag.tagId ?? tag.id ?? null,
    assetId: record.assetId ?? tag.assetId ?? asset?.id ?? asset?._id ?? null,
    epc: record.epc ?? tag.epc ?? "-",
    tagStatus: record.tagStatus ?? tag.status ?? null,
    tagStatusLabel: record.tagStatusLabel ?? tag.statusLabel ?? null,
    mappingStatus: record.mappingStatus ?? tag.mappingStatus ?? null,
    mappingStatusLabel: record.mappingStatusLabel ?? tag.mappingStatusLabel ?? null,
    currentStatus: record.currentStatus ?? asset?.status ?? null,
    currentStatusLabel: record.currentStatusLabel ?? asset?.statusLabel ?? null,
    assetWashCount: getNullableNumber(record.assetWashCount, asset?.washCount, asset?.washCountUsed),
    tagWashCount: getNullableNumber(record.tagWashCount, tag.washCount, tag?.washCountUsed),
    assetWashLimit: getNullableNumber(record.assetWashLimit, asset?.washLimit),
    tagWashLimit: getNullableNumber(record.tagWashLimit, tag.washLimit),
    washCountDifference: record.washCountDifference ??
      Math.abs(
        getNullableNumber(record.assetWashCount, asset?.washCount, asset?.washCountUsed) -
        getNullableNumber(record.tagWashCount, tag.washCount, tag?.washCountUsed),
      ),
    washCountMatchesTag: record.washCountMatchesTag ?? null,
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
  // The entries endpoint currently returns its collection directly under
  // `data.items`. Keep the nested `data.entries.items` shape compatible with
  // older responses and socket-driven fixtures.
  const entries = payload.entries ?? payload;
  const pagination = entries.pagination ?? payload.pagination ?? {};
  const items = Array.isArray(entries.items)
    ? entries.items
    : Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(entries.results)
        ? entries.results
        : Array.isArray(payload.results)
          ? payload.results
      : [];
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

  if (String(entry.mappingStatus ?? result.mappingStatus ?? "").toLowerCase() === "detached") {
    return BULK_SCAN_GROUPS.DETACHED;
  }

  const mappingStatus = entry.mappingStatus ?? result.mappingStatus;
  if (mappingStatus === "linked") return BULK_SCAN_GROUPS.EXISTING_LINKED;
  return BULK_SCAN_GROUPS.NEW_UNLINKED;
};

export const getExistingTagErrorMessage = (error) => {
  const payload = error?.response?.data ?? error?.data ?? error ?? {};
  const hasUnavailableTag = Boolean(
    payload.tagsAlreadyMapped?.length ||
      payload.tagsUnavailable?.length ||
      payload.newTagUnavailable ||
      payload.data?.tagsAlreadyMapped?.length ||
      payload.data?.tagsUnavailable?.length ||
      payload.data?.newTagUnavailable,
  );
  return hasUnavailableTag
    ? "This RFID tag is already linked or unavailable. Please scan a new unused RFID tag."
    : null;
};

const SKIPPED_REASON_MESSAGES = Object.freeze({
  default_laundry_required: "No active default laundry is configured.",
  tag_or_asset_not_found: "The tag or linked asset could not be found.",
  tag_not_linked: "The tag is not linked to an active asset.",
  tag_inactive: "The tag is inactive.",
  tag_lost: "The tag is marked as lost.",
  tag_damaged: "The tag is damaged.",
  tag_retired: "The tag has been retired.",
  asset_retired: "The linked asset has been retired.",
  asset_inactive: "The linked asset is inactive.",
  already_in_active_laundry_batch:
    "The tag is already in an active laundry batch.",
  active_laundry_batch_required:
    "The tag has no active laundry batch and cannot be checked in.",
  asset_status_sent_to_laundry:
    "The asset has already been sent to laundry.",
  asset_status_at_laundry: "The asset is currently at the laundry.",
  asset_status_washed: "The asset has already been washed.",
  asset_status_delayed: "The asset is currently delayed.",
});

export const getSkippedReasonMessage = (reason) => {
  if (SKIPPED_REASON_MESSAGES[reason]) return SKIPPED_REASON_MESSAGES[reason];
  return "The selected action cannot be performed for this tag.";
};

export const normalizeActionUndoNotices = (response, defaults = {}) => {
  const data = response?.data ?? response ?? {};
  const message = response?.message ?? defaults.message ?? null;
  const common = {
    actionSource: data.actionSource ?? defaults.actionSource ?? null,
    kind: defaults.kind ?? "action",
    message,
    scannerMode: data.scannerMode ?? defaults.scannerMode ?? null,
  };
  const automaticActions = Array.isArray(data.automaticActions)
    ? data.automaticActions
    : [];

  const getLaundryName = (item) => {
    if (item.laundry?.name) return item.laundry.name;
    if (Array.isArray(item.laundries) && item.laundries.length > 0) {
      const names = item.laundries.map((l) => l.name).filter(Boolean);
      return names.length > 0 ? names.join(", ") : "original laundries";
    }
    return null;
  };

  if (automaticActions.length > 0) {
    return automaticActions
      .filter((item) => item?.undo?.id && item?.undo?.expiresAt)
      .map((item) => ({
        ...common,
        ...item.undo,
        action: item.action ?? null,
        batchCode: item.batch?.batchCode ?? null,
        laundryName: getLaundryName(item),
        businessName: item.business?.name ?? null,
        processedCount: item.processedCount ?? 0,
        processedTagCount: item.processedTagCount ?? item.processedCount ?? 0,
      }));
  }

  const undos = Array.isArray(data.undos) ? data.undos : [];
  if (undos.length > 0) {
    return undos
      .filter((undo) => undo?.id && undo?.expiresAt)
      .map((undo) => ({
        ...common,
        ...undo,
        action: undo.action ?? data.action ?? null,
        laundryName: getLaundryName(data),
        businessName: data.business?.name ?? null,
        processedTagCount: data.processedTagCount ?? data.processedCount ?? 0,
      }));
  }

  if (!data.undo?.id || !data.undo?.expiresAt) return [];
  return [{
    ...common,
    ...data.undo,
    action: data.action ?? defaults.action ?? null,
    batchCode: data.batch?.batchCode ?? null,
    laundryName: getLaundryName(data),
    businessName: data.business?.name ?? null,
    processedCount: data.processedCount ?? data.processedTagCount ?? 0,
    processedTagCount: data.processedTagCount ?? data.processedCount ?? 0,
  }];
};

export const getSuggestedScanAction = (rows = []) => {
  const suggestions = rows
    .map((row) => {
      if (["check_in", "check_out"].includes(row.scanAction)) {
        return row.scanAction;
      }
      if (row.scanDirection === "going_to_laundry") return "check_out";
      if (row.scanDirection === "returning_from_laundry") return "check_in";
      return null;
    })
    .filter(Boolean);

  return suggestions.length > 0 && suggestions.every((item) => item === suggestions[0])
    ? suggestions[0]
    : null;
};

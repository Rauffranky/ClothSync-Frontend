const unwrapScanPayload = (source) => {
  let payload = source ?? {};

  for (let depth = 0; depth < 3; depth += 1) {
    const nested = payload?.data;
    if (!nested || typeof nested !== "object" || Array.isArray(nested)) break;

    const hasUndoFields =
      payload.undo ||
      payload.notification?.undo ||
      payload.automaticActions ||
      payload.undos;
    const nestedHasUndoFields =
      nested.undo ||
      nested.notification?.undo ||
      nested.automaticActions ||
      nested.undos;
    if (hasUndoFields && !nestedHasUndoFields) break;
    payload = nested;
  }

  return payload;
};

export const normalizeAutomaticScanUndoNotices = (source, portal) => {
  const payload = unwrapScanPayload(source);
  const notification = payload.notification || {};
  const session =
    payload.session || source?.session || source?.data?.session || {};
  const action = notification.action || payload.action || null;
  const counters = payload.counters || {};
  const processedTagCount =
    payload.processedTagCount ??
    payload.processedCount ??
    (action === "check_in"
      ? payload.checkedInCount ?? counters.checkedInCount
      : action === "check_out"
        ? payload.checkedOutCount ?? counters.checkedOutCount
        : null) ??
    0;
  const common = {
    actionSource: payload.actionSource || "scanner_mode",
    kind: "action",
    message: notification.message || payload.message || source?.message || null,
    portal,
    laundryId:
      payload.laundryId ||
      payload.session?.laundryId ||
      payload.laundry?.id ||
      source?.laundryId ||
      source?.data?.laundryId ||
      null,
    scannerMode: payload.scannerMode || session.scannerMode || "auto",
    sessionId: session.id || payload.sessionId || null,
  };
  const actions = Array.isArray(payload.automaticActions)
    ? payload.automaticActions
    : [];

  if (actions.length > 0) {
    return actions
      .filter((item) => item?.undo?.id && item?.undo?.expiresAt)
      .map((item) => ({
        ...common,
        ...item.undo,
        action: item.action || action,
        batchCode: item.batch?.batchCode || payload.batch?.batchCode || null,
        businessName: item.business?.name || payload.business?.name || null,
        laundryName: item.laundry?.name || payload.laundry?.name || null,
        processedTagCount:
          item.processedTagCount ?? item.processedCount ?? processedTagCount,
      }));
  }

  const undos = Array.isArray(payload.undos) ? payload.undos : [];
  if (undos.length > 0) {
    return undos
      .filter((undo) => undo?.id && undo?.expiresAt)
      .map((undo) => ({
        ...common,
        ...undo,
        action: undo.action || action,
        batchCode: payload.batch?.batchCode || null,
        businessName: payload.business?.name || null,
        laundryName: payload.laundry?.name || null,
        processedTagCount: undo.processedTagCount ?? processedTagCount,
      }));
  }

  const undo = notification.undo || payload.undo;
  if (!undo?.id || !undo?.expiresAt) return [];

  return [{
    ...common,
    ...undo,
    action,
    batchCode: payload.batch?.batchCode || null,
    businessName: payload.business?.name || null,
    laundryName: payload.laundry?.name || null,
    processedTagCount,
  }];
};

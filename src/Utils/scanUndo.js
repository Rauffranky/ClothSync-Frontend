import { getAuthSessionUser } from "../axios/auth/authSession";

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

const resolveBusinessName = (item, payload, notification, source, portal, batchCode) => {
  const direct =
    item?.businessName ||
    item?.business?.businessName ||
    item?.business?.name ||
    item?.batch?.businessName ||
    item?.batch?.tenant?.businessName ||
    item?.batch?.tenant?.fullName ||
    item?.tenant?.businessName ||
    item?.tenant?.fullName ||
    item?.tenantName ||
    payload?.businessName ||
    payload?.business?.businessName ||
    payload?.business?.name ||
    payload?.batch?.businessName ||
    payload?.batch?.tenant?.businessName ||
    payload?.batch?.tenant?.fullName ||
    payload?.tenant?.businessName ||
    payload?.tenant?.fullName ||
    payload?.tenantName ||
    notification?.businessName ||
    notification?.business?.name ||
    source?.businessName ||
    source?.batch?.businessName ||
    null;

  if (direct && direct !== "Business" && direct !== "Linked Business") {
    return direct;
  }

  // Fallback for business portal: auth user is the business
  if (portal === "business") {
    const authUser = getAuthSessionUser();
    const name =
      authUser?.businessName ||
      authUser?.fullName ||
      authUser?.name ||
      authUser?.companyName ||
      null;
    if (name) return name;
  }

  // Fallback for laundry portal: search active-laundry-bulk-scan-entries
  if (portal === "laundry") {
    try {
      const rawStored = localStorage.getItem("active-laundry-bulk-scan-entries");
      if (rawStored) {
        const entries = JSON.parse(rawStored);
        if (Array.isArray(entries) && entries.length > 0) {
          const match = batchCode
            ? entries.find(
                (e) =>
                  e.batchCode === batchCode ||
                  e.batchName === batchCode ||
                  e.resolvedBatchName === batchCode,
              )
            : null;
          const found =
            match?.businessName ||
            match?.tenant?.businessName ||
            entries.find((e) => e.businessName && e.businessName !== "Linked Business")
              ?.businessName;
          if (found && found !== "Business" && found !== "Linked Business") {
            return found;
          }
        }
      }
    } catch {
      // ignore
    }
  }

  return direct || null;
};

const resolveLaundryName = (item, payload, notification, source, portal) => {
  const direct =
    item?.laundryName ||
    item?.laundry?.companyName ||
    item?.laundry?.name ||
    item?.batch?.laundryName ||
    item?.batch?.laundry?.companyName ||
    item?.batch?.laundry?.name ||
    payload?.laundryName ||
    payload?.laundry?.companyName ||
    payload?.laundry?.name ||
    payload?.batch?.laundryName ||
    payload?.batch?.laundry?.companyName ||
    payload?.batch?.laundry?.name ||
    notification?.laundryName ||
    notification?.laundry?.companyName ||
    notification?.laundry?.name ||
    source?.laundryName ||
    null;

  if (direct && direct !== "Laundry") {
    return direct;
  }

  // Fallback for laundry portal: auth user is the laundry
  if (portal === "laundry") {
    const authUser = getAuthSessionUser();
    const name =
      authUser?.companyName ||
      authUser?.fullName ||
      authUser?.name ||
      authUser?.laundryName ||
      null;
    if (name) return name;
  }

  return direct || null;
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
      .filter((item) => item?.undo?.id && item?.undo?.expiresAt && Number(item.processedTagCount ?? item.processedCount ?? 0) > 0)
      .map((item) => {
        const batchCode = item.batch?.batchCode || payload.batch?.batchCode || null;
        return {
          ...common,
          ...item.undo,
          action: item.action || action,
          batchCode,
          businessName: resolveBusinessName(item, payload, notification, source, portal, batchCode),
          laundryName: resolveLaundryName(item, payload, notification, source, portal),
          processedTagCount:
            item.processedTagCount ?? item.processedCount ?? processedTagCount,
        };
      });
  }

  const undos = Array.isArray(payload.undos) ? payload.undos : [];
  if (undos.length > 0) {
    return undos
      .filter((undo) => undo?.id && undo?.expiresAt && Number(undo.processedTagCount ?? undo.processedCount ?? processedTagCount) > 0)
      .map((undo) => {
        const batchCode = payload.batch?.batchCode || null;
        return {
          ...common,
          ...undo,
          action: undo.action || action,
          batchCode,
          businessName: resolveBusinessName(undo, payload, notification, source, portal, batchCode),
          laundryName: resolveLaundryName(undo, payload, notification, source, portal),
          processedTagCount: undo.processedTagCount ?? processedTagCount,
        };
      });
  }

  const undo = notification.undo || payload.undo;
  if (!undo?.id || !undo?.expiresAt || processedTagCount <= 0) return [];

  const batchCode = payload.batch?.batchCode || null;
  return [{
    ...common,
    ...undo,
    action,
    batchCode,
    businessName: resolveBusinessName(null, payload, notification, source, portal, batchCode),
    laundryName: resolveLaundryName(null, payload, notification, source, portal),
    processedTagCount,
  }];
};


const titleCase = (value) =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

export const getPaginatedCollection = (response, collectionKeys, limit) => {
  const root = response ?? {};
  const payload = root?.data ?? root;
  const rows = Array.isArray(payload)
    ? payload
    : collectionKeys.reduce(
        (collection, key) => collection || payload?.[key],
        null,
      ) ||
      payload?.items ||
      payload?.docs ||
      payload?.results ||
      [];
  const pagination =
    payload?.pagination || payload?.meta || root?.pagination || root?.meta || payload;
  const totalItems = Number(
    pagination?.totalItems ??
      pagination?.totalDocs ??
      pagination?.total ??
      pagination?.count ??
      rows.length,
  );
  const totalPages = Number(
    pagination?.totalPages ??
      pagination?.pages ??
      Math.ceil(totalItems / limit),
  );

  return {
    rows: Array.isArray(rows) ? rows : [],
    totalItems: Number.isFinite(totalItems) ? totalItems : 0,
    totalPages: Number.isFinite(totalPages) ? totalPages : 0,
  };
};

export const normalizeLinkedLaundry = (record) => {
  const laundry =
    record?.laundry && typeof record.laundry === "object"
      ? record.laundry
      : record?.laundryId && typeof record.laundryId === "object"
        ? record.laundryId
        : record;
  const profile = laundry?.businessProfile || laundry?.profile || laundry;
  const translation =
    record?.translations?.en ||
    laundry?.translations?.en ||
    profile?.translations?.en ||
    {};
  const rawStatus = String(record?.status ?? laundry?.status ?? "active").toLowerCase();
  const isConnected = ["active", "connected", "linked"].includes(rawStatus);
  const isSuspended = ["suspend", "inactive", "suspended", "unlinked"].includes(
    rawStatus,
  );
  const status = isConnected
    ? "Connected"
    : isSuspended
      ? "Suspend"
      : titleCase(rawStatus) || "Unknown";
  const city = profile?.city || laundry?.city || record?.city;
  const state = profile?.state || laundry?.state || record?.state;
  const locationParts = [city, state].filter(Boolean);

  return {
    ...record,
    apiId: record?._id || record?.id,
    id:
      record?.laundryCode ||
      laundry?.laundryCode ||
      laundry?.code ||
      laundry?._id ||
      laundry?.id ||
      record?._id ||
      record?.id,
    name:
      translation?.name ||
      profile?.businessName ||
      laundry?.businessName ||
      laundry?.fullName ||
      laundry?.name ||
      record?.laundryName ||
      "Unnamed Laundry",
    contact:
      record?.contactName ||
      profile?.contactName ||
      laundry?.contactPersonName ||
      laundry?.owner?.fullName ||
      laundry?.user?.fullName ||
      "-",
    email:
      record?.contactEmail ||
      record?.email ||
      profile?.email ||
      laundry?.email ||
      laundry?.owner?.email ||
      laundry?.user?.email ||
      "-",
    location:
      record?.location ||
      profile?.address ||
      laundry?.address ||
      locationParts.join(", ") ||
      "-",
    status,
    statusVariant: isConnected ? "success" : isSuspended ? "neutral" : "warning",
    isDefault: Boolean(record?.isDefault),
    dispatchMode: record?.dispatchMode || "-",
    batches: Number(record?.batches ?? record?.batchCount ?? record?.totalBatchesCount ?? 0),
    itemsSent: Number(record?.itemsSent ?? record?.sentItemsCount ?? record?.itemsCurrentlySentCount ?? 0),
    missing: Number(record?.missing ?? record?.missingItemsCount ?? record?.delayedItemsCount ?? 0),
  };
};

export const normalizePendingInvite = (invite) => {
  const laundry =
    invite?.laundry && typeof invite.laundry === "object"
      ? invite.laundry
      : invite?.laundryId && typeof invite.laundryId === "object"
        ? invite.laundryId
        : {};
  const rawStatus = String(invite?.status || "pending").toLowerCase();
  const status = ["pending", "sent", "invite_sent"].includes(rawStatus)
    ? "Invite Sent"
    : titleCase(rawStatus) || "Pending";

  return {
    ...invite,
    id: invite?._id || invite?.id || invite?.email || laundry?.email,
    email:
      invite?.email ||
      invite?.invitedEmail ||
      invite?.laundryEmail ||
      laundry?.email ||
      "-",
    status,
    statusVariant:
      rawStatus === "accepted"
        ? "success"
        : rawStatus === "expired" || rawStatus === "rejected"
          ? "danger"
          : "neutral",
    sentAt: invite?.sentAt || invite?.createdAt || invite?.invitedAt || null,
  };
};

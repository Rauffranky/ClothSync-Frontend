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

export const normalizeLinkedLaundryDetails = (response) => {
  const record = response?.data ?? response ?? {};
  const laundry =
    record?.laundry && typeof record.laundry === "object"
      ? record.laundry
      : record?.laundryId && typeof record.laundryId === "object"
        ? record.laundryId
        : {};
  const user = laundry?.user && typeof laundry.user === "object" ? laundry.user : {};
  const rawStatus = String(record?.status || laundry?.status || "unknown").toLowerCase();
  const laundryId =
    typeof record?.laundryId === "object"
      ? record.laundryId?.id || record.laundryId?._id
      : record?.laundryId;

  return {
    relationshipId: record?.id || record?._id || "-",
    tenantId: record?.tenantId || "-",
    laundryId: laundryId || laundry?.id || laundry?._id || "-",
    name:
      record?.laundryName ||
      laundry?.companyName ||
      laundry?.fullName ||
      user?.fullName ||
      "Unnamed Laundry",
    status: titleCase(rawStatus) || "Unknown",
    statusVariant: ["active", "connected", "linked"].includes(rawStatus)
      ? "success"
      : ["suspend", "inactive", "suspended", "unlinked"].includes(rawStatus)
        ? "neutral"
        : "warning",
    isDefault: Boolean(record?.isDefault),
    linkedAt: record?.linkedAt || record?.createdAt || null,
    unlinkedAt: record?.unlinkedAt || null,
    stats: {
      activeBatches: Number(record?.activeBatchesCount ?? 0),
      itemsCurrentlySent: Number(record?.itemsCurrentlySentCount ?? 0),
      delayedItems: Number(record?.delayedItemsCount ?? 0),
      totalBatches: Number(record?.totalBatchesCount ?? 0),
      totalItems: Number(record?.totalItemsCount ?? 0),
    },
    contact: {
      name:
        laundry?.contactPersonName ||
        laundry?.fullName ||
        user?.fullName ||
        record?.laundryName ||
        "-",
      email:
        record?.contactEmail || laundry?.email || user?.email || "-",
      phone:
        record?.contactPhone || laundry?.phone || user?.phone || "-",
      address: record?.location || laundry?.address || "-",
      country: record?.country || laundry?.country || "-",
    },
    profile: {
      id: laundry?.id || laundry?._id || laundryId || "-",
      userId: laundry?.userId || user?.id || user?._id || "-",
      fullName: laundry?.fullName || "-",
      companyName: laundry?.companyName || "-",
      contactPersonName: laundry?.contactPersonName || "-",
      email: laundry?.email || "-",
      phone: laundry?.phone || "-",
      address: laundry?.address || "-",
      country: laundry?.country || "-",
      city: laundry?.city || "-",
      state: laundry?.state || "-",
      postalCode: laundry?.postalCode || "-",
      avatar: laundry?.avatar || null,
      status: titleCase(laundry?.status) || "-",
      creationSource: titleCase(laundry?.creationSource) || "-",
      createdAt: laundry?.createdAt || null,
      updatedAt: laundry?.updatedAt || null,
    },
    user: {
      id: user?.id || user?._id || "-",
      fullName: user?.fullName || "-",
      email: user?.email || "-",
      phone: user?.phone || "-",
      status: titleCase(user?.status) || "-",
      creationSource: titleCase(user?.creationSource) || "-",
    },
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

  return {
    ...invite,
    id: invite?._id || invite?.id || invite?.email || laundry?.email,
    email:
      invite?.email ||
      invite?.invitedEmail ||
      invite?.laundryEmail ||
      laundry?.email ||
      "-",
    statusValue: rawStatus,
    status: rawStatus,
    statusVariant:
      rawStatus === "accepted"
        ? "success"
        : rawStatus === "pending"
          ? "warning"
        : rawStatus === "expired" || rawStatus === "rejected"
          ? "danger"
          : "neutral",
    sentAt: invite?.sentAt || invite?.createdAt || invite?.invitedAt || null,
  };
};

export const normalizeClosedInvite = (invite) => {
  const normalizedInvite = normalizePendingInvite(invite);
  const statusValue = normalizedInvite.statusValue;

  return {
    ...normalizedInvite,
    status: titleCase(statusValue),
    statusVariant:
      statusValue === "rejected"
        ? "danger"
        : statusValue === "expired"
          ? "warning"
          : "neutral",
    closedAt:
      invite?.rejectedAt ||
      invite?.cancelledAt ||
      invite?.expiresAt ||
      invite?.updatedAt ||
      null,
    reason: invite?.rejectionReason || "-",
  };
};

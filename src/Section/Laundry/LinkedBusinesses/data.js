const titleCase = (value) =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const getNumber = (...values) => {
  const value = values.find((item) => item !== null && item !== undefined);
  if (value === undefined) return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const getInitials = (value) =>
  String(value || "Business")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const getLocation = (...sources) => {
  const explicitLocation = sources.find(
    (source) => typeof source?.location === "string" && source.location.trim(),
  )?.location;
  if (explicitLocation) return explicitLocation;

  const city = sources.find((source) => source?.city)?.city;
  const state = sources.find((source) => source?.state)?.state;
  const country = sources.find((source) => source?.country)?.country;
  return [city, state, country].filter(Boolean).join(", ") || "-";
};

export const linkedBusinessStatusOptions = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Suspended", value: "suspend" },
];

export const businessTypeOptions = [
  { label: "All Business Types", value: "all" },
  { label: "Hotel", value: "hotel" },
  { label: "Hospital", value: "hospital" },
];

export const getLaundryTenantCollection = (response, limit) => {
  const root = response ?? {};
  const payload = root?.data ?? root;
  const rows = Array.isArray(payload)
    ? payload
    : payload?.items ||
      payload?.tenants ||
      payload?.businesses ||
      payload?.linkedTenants ||
      payload?.docs ||
      [];
  const pagination = payload?.pagination || root?.pagination || {};
  const totalItems = getNumber(
    pagination?.totalItems,
    pagination?.total,
    pagination?.count,
    rows.length,
  );
  const totalPages = getNumber(
    pagination?.totalPages,
    pagination?.pages,
    Math.ceil((totalItems || 0) / limit),
  );

  return {
    rows: Array.isArray(rows) ? rows : [],
    counts:
      payload?.counts ??
      payload?.summary ??
      root?.counts ??
      root?.summary ??
      null,
    totalItems: totalItems || 0,
    totalPages: totalPages || 0,
  };
};

export const normalizeLaundryTenantCounts = (counts) => {
  const summary = Array.isArray(counts)
    ? Object.fromEntries(
        counts
          .filter((item) => item?.key)
          .map((item) => [item.key, getNumber(item.count)]),
      )
    : counts || {};

  return {
    totalLinked: getNumber(
      summary.totalLinked,
      summary.totalBusinesses,
      summary.linkedBusinesses,
    ),
    activeBusinesses: getNumber(
      summary.activeBusinesses,
      summary.activeTenants,
      summary.activeLinked,
    ),
    pendingRequests: getNumber(
      summary.pendingRequests,
      summary.pendingInvites,
    ),
    activeBatches: getNumber(
      summary.activeBatches,
      summary.activeBatchesCount,
    ),
    itemsInLaundry: getNumber(
      summary.itemsInLaundry,
      summary.itemsInLaundryCount,
    ),
    openExceptions: getNumber(
      summary.openExceptions,
      summary.openExceptionsCount,
    ),
  };
};

export const normalizeLaundryTenant = (record) => {
  const rawOperations =
    record?.operations ||
    record?.currentOperations ||
    record?.stats ||
    record?.counts ||
    {};
  const operations = Array.isArray(rawOperations)
    ? Object.fromEntries(
        rawOperations
          .filter((item) => item?.key)
          .map((item) => [item.key, getNumber(item.count)]),
      )
    : rawOperations;
  const tenant =
    record?.tenant && typeof record.tenant === "object"
      ? record.tenant
      : record?.tenantId && typeof record.tenantId === "object"
        ? record.tenantId
        : {};
  const profile = tenant?.businessProfile || tenant?.profile || tenant;
  const name =
    record?.businessName ||
    record?.tenantName ||
    profile?.businessName ||
    tenant?.companyName ||
    tenant?.fullName ||
    tenant?.name ||
    "Unnamed Business";
  const rawStatus = String(
    record?.status || tenant?.status || "active",
  ).toLowerCase();
  const isActive = ["active", "connected", "linked"].includes(rawStatus);
  const isSuspended = ["suspend", "suspended"].includes(rawStatus);

  return {
    ...record,
    id:
      record?.id ||
      record?._id ||
      tenant?.id ||
      tenant?._id ||
      record?.tenantId,
    apiId:
      record?.id ||
      record?._id ||
      (typeof record?.tenantId === "string" ? record.tenantId : null) ||
      tenant?.id ||
      tenant?._id,
    name,
    initials: getInitials(name),
    businessType: titleCase(
      record?.businessType || profile?.businessType || tenant?.businessType,
    ) || "-",
    location: getLocation(record?.contact, record, profile, tenant),
    status: isActive
      ? "Connected"
      : isSuspended
        ? "Suspended"
        : titleCase(rawStatus) || "Unknown",
    statusVariant: isActive ? "success" : isSuspended ? "warning" : "neutral",
    activeBatches: getNumber(
      record?.activeBatchesCount,
      record?.activeBatches,
      record?.batchesCount,
      operations?.activeBatches,
    ) || 0,
    incomingBatches: getNumber(
      record?.incomingBatchesCount,
      record?.incomingBatches,
      record?.activeBatchesCount,
      record?.activeBatches,
      record?.batchesCount,
      operations?.incomingBatches,
      operations?.activeBatches,
    ) || 0,
    itemsInLaundry: getNumber(
      record?.itemsInLaundryCount,
      record?.itemsInLaundry,
      record?.currentItemsCount,
      operations?.itemsInLaundry,
    ) || 0,
    sentToBusiness: getNumber(
      record?.sentToBusinessCount,
      record?.itemsSentToBusiness,
      record?.returnedItemsCount,
      operations?.sentToBusiness,
    ) || 0,
    delayedItems: getNumber(
      record?.delayedItemsCount,
      record?.delayedItems,
      operations?.delayedItems,
    ) || 0,
    openExceptions: getNumber(
      record?.openExceptionsCount,
      record?.openExceptions,
      record?.exceptionsCount,
      operations?.openExceptions,
    ) || 0,
    lastActivityAt:
      operations?.lastActivityAt ||
      record?.lastActivityAt ||
      record?.updatedAt ||
      record?.linkedAt ||
      null,
    lastActivityLabel:
      record?.lastActivityLabel || record?.lastActivity || null,
    contactName:
      record?.contactName ||
      record?.contact?.name ||
      profile?.contactPersonName ||
      tenant?.contactPersonName ||
      tenant?.fullName ||
      "-",
    contactEmail:
      record?.contactEmail ||
      record?.contact?.email ||
      profile?.email ||
      tenant?.email ||
      tenant?.user?.email ||
      "-",
    contactPhone:
      record?.contactPhone ||
      record?.contact?.phone ||
      profile?.phone ||
      tenant?.phone ||
      "-",
  };
};

export const normalizeLaundryTenantDetails = (response) => {
  const payload = response?.data ?? response ?? {};
  const record =
    payload?.business ||
    payload?.tenantLink ||
    payload?.linkedTenant ||
    payload?.item ||
    payload;
  const normalized = normalizeLaundryTenant({
    ...record,
    counts: record?.counts || payload?.counts,
    operations: record?.operations || payload?.operations,
    currentOperations:
      record?.currentOperations || payload?.currentOperations,
    stats: record?.stats || payload?.stats,
  });

  return {
    ...normalized,
    linkedAt: record?.linkedAt || record?.createdAt || null,
    updatedAt: record?.updatedAt || null,
    address:
      record?.address ||
      record?.contact?.location ||
      record?.tenant?.address ||
      record?.tenant?.businessProfile?.address ||
      normalized.location,
    city:
      record?.city ||
      record?.contact?.city ||
      record?.tenant?.city ||
      record?.tenant?.businessProfile?.city ||
      null,
    state:
      record?.state ||
      record?.contact?.state ||
      record?.tenant?.state ||
      record?.tenant?.businessProfile?.state ||
      null,
    country:
      record?.country ||
      record?.contact?.country ||
      record?.tenant?.country ||
      record?.tenant?.businessProfile?.country ||
      null,
  };
};

export const normalizePendingTenantRequest = (record) => {
  const tenant =
    record?.tenant && typeof record.tenant === "object"
      ? record.tenant
      : record?.tenantId && typeof record.tenantId === "object"
        ? record.tenantId
        : {};
  const profile = tenant?.businessProfile || tenant?.profile || tenant;
  const name =
    record?.businessName ||
    record?.tenantName ||
    profile?.businessName ||
    tenant?.companyName ||
    tenant?.fullName ||
    "Unnamed Business";
  const rawStatus = String(record?.status || "pending").toLowerCase();
  const canRespond = ["pending", "pending_review"].includes(rawStatus);

  return {
    ...record,
    id: record?.id || record?._id,
    apiId: record?.id || record?._id,
    name,
    initials: getInitials(name),
    contactName:
      record?.contactName ||
      record?.contactPersonName ||
      profile?.contactPersonName ||
      tenant?.fullName ||
      "-",
    contactEmail:
      record?.contactEmail ||
      record?.email ||
      profile?.email ||
      tenant?.email ||
      "-",
    location: getLocation(record, profile, tenant),
    requestedAt:
      record?.requestDate ||
      record?.requestedAt ||
      record?.sentAt ||
      record?.createdAt ||
      null,
    requestType: titleCase(record?.requestType || "new_connection"),
    statusValue: rawStatus,
    status: canRespond ? "Pending Review" : titleCase(rawStatus),
    statusVariant: canRespond ? "warning" : "neutral",
    canRespond,
  };
};

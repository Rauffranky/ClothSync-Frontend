import { formatDateWithUserPreferences } from "../../../Utils/date";

export const BUSINESS_ITEMS_PER_PAGE = 10;

export const businessStatusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Verified", value: "verified" },
  { label: "Unverified", value: "unverified" },
];

export const BUSINESS_TYPES = [
  { label: "Hotel", value: "hotel" },
  { label: "Hospital", value: "hospital" },
];

export const businessTypeOptions = [
  { label: "All Types", value: "all" },
  ...BUSINESS_TYPES,
];

export const formatBusinessType = (type) => {
  if (!type) return "—";
  const found = BUSINESS_TYPES.find(
    (item) => item.value.toLowerCase() === String(type).toLowerCase(),
  );
  if (found) return found.label;
  return String(type).charAt(0).toUpperCase() + String(type).slice(1);
};

export const formatCreationSource = (source) => {
  if (!source) return "Super Admin";
  if (source === "super_admin") return "Super Admin";
  if (source === "self") return "Self";
  return source
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const normalizeBusiness = (tenant) => {
  const isVerified = tenant?.isVerified !== undefined
    ? Boolean(tenant?.isVerified)
    : Boolean(tenant?.emailVerifiedAt || tenant?.user?.emailVerifiedAt);

  const rawStatus = String(tenant?.status || "").toLowerCase();

  let statusLabel = "Active";
  let statusVariant = "success";

  if (!isVerified || rawStatus === "unverified") {
    statusLabel = "Unverified";
    statusVariant = "warning";
  } else if (rawStatus === "inactive" || rawStatus === "suspend" || rawStatus === "deleted") {
    statusLabel = "Inactive";
    statusVariant = "danger";
  } else if (rawStatus === "pending") {
    statusLabel = "Pending";
    statusVariant = "warning";
  } else {
    statusLabel = "Active";
    statusVariant = "success";
  }

  const locationParts = [tenant?.city, tenant?.state, tenant?.country].filter(Boolean);
  const location = locationParts.length > 0 ? locationParts.join(", ") : tenant?.country || "—";

  return {
    ...tenant,
    apiId: tenant?.id || tenant?._id,
    id: tenant?.id || tenant?._id,
    businessName: tenant?.businessName || tenant?.fullName || "Unnamed Business",
    contactName: tenant?.fullName || "—",
    email: tenant?.email || "—",
    phone: tenant?.phone || "—",
    rawBusinessType: tenant?.businessType,
    businessType: formatBusinessType(tenant?.businessType),
    isVerified,
    verificationStatus: isVerified ? "Verified" : "Unverified",
    status: statusLabel,
    rawStatus,
    statusVariant,
    location,
    address: tenant?.address || "—",
    timezone: tenant?.timezone || "UTC",
    rawCreationSource: tenant?.creationSource,
    creationSource: formatCreationSource(tenant?.creationSource),
    created: formatDateWithUserPreferences(
      tenant?.createdAt || tenant?.created,
    ),
  };
};

export const getBusinessPaginatedCollection = (response) => {
  const root = response?.data?.data || response?.data || response || {};
  const items =
    root.items ||
    root.rows ||
    (Array.isArray(root) ? root : []);

  const pagination = root.pagination || {};
  const totalItems =
    pagination.total ??
    pagination.totalItems ??
    root.count ??
    items.length;

  const totalPages =
    pagination.totalPages ??
    pagination.pages ??
    (Math.ceil(totalItems / BUSINESS_ITEMS_PER_PAGE) || 1);

  const apiCounts = root.counts || root.summary || {};

  const totalCount =
    apiCounts.total !== undefined
      ? Number(apiCounts.total)
      : Number(totalItems) || 0;

  const activeCount =
    apiCounts.active !== undefined
      ? Number(apiCounts.active)
      : items.filter(
          (item) => String(item?.status).toLowerCase() === "active" && (item?.isVerified || item?.emailVerifiedAt),
        ).length;

  const unverifiedCount =
    apiCounts.unverified !== undefined
      ? Number(apiCounts.unverified)
      : items.filter(
          (item) => item?.isVerified === false || String(item?.status).toLowerCase() === "unverified" || !item?.emailVerifiedAt,
        ).length;

  const inactiveCount =
    apiCounts.inactive !== undefined
      ? Number(apiCounts.inactive)
      : items.filter(
          (item) => String(item?.status).toLowerCase() === "inactive",
        ).length;

  return {
    rows: items,
    totalItems: Number(totalItems) || 0,
    totalPages: Number(totalPages) || 1,
    summary: {
      total: totalCount,
      active: activeCount,
      unverified: unverifiedCount,
      inactive: inactiveCount,
    },
  };
};

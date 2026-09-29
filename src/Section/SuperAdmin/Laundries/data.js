import { formatDateWithUserPreferences } from "../../../Utils/date";

export const LAUNDRY_ITEMS_PER_PAGE = 10;

export const laundryStatusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Suspended", value: "suspend" },
];

export const normalizeLaundry = (laundry) => {
  const rawStatus = String(laundry?.status || "").toLowerCase();

  let statusLabel = "Active";
  let statusVariant = "success";

  if (rawStatus === "inactive") {
    statusLabel = "Inactive";
    statusVariant = "neutral";
  } else if (rawStatus === "suspend" || rawStatus === "suspended") {
    statusLabel = "Suspended";
    statusVariant = "danger";
  } else if (rawStatus === "pending") {
    statusLabel = "Pending";
    statusVariant = "warning";
  }

  const locationParts = [laundry?.city, laundry?.state, laundry?.country].filter(Boolean);
  const location = locationParts.length > 0 ? locationParts.join(", ") : laundry?.country || "—";

  return {
    ...laundry,
    apiId: laundry?.id || laundry?._id,
    id: laundry?.id || laundry?._id,
    companyName: laundry?.companyName || laundry?.name || "Unnamed Laundry",
    contactName: laundry?.fullName || laundry?.contactPersonName || "—",
    email: laundry?.email || "—",
    phone: laundry?.phone || "—",
    address: laundry?.address || "—",
    city: laundry?.city || "",
    state: laundry?.state || "",
    country: laundry?.country || "—",
    postalCode: laundry?.postalCode || "",
    location,
    status: statusLabel,
    rawStatus,
    statusVariant,
    created: formatDateWithUserPreferences(
      laundry?.createdAt || laundry?.created,
    ),
  };
};

export const getLaundryPaginatedCollection = (response) => {
  const root = response?.data?.data || response?.data || response || {};
  const items =
    root.items ||
    root.rows ||
    root.laundries ||
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
    (Math.ceil(totalItems / LAUNDRY_ITEMS_PER_PAGE) || 1);

  const apiCounts = root.counts || root.summary || {};

  const totalCount =
    apiCounts.total !== undefined
      ? Number(apiCounts.total)
      : Number(totalItems) || 0;

  const activeCount =
    apiCounts.active !== undefined
      ? Number(apiCounts.active)
      : items.filter(
          (item) => String(item?.status).toLowerCase() === "active",
        ).length;

  const inactiveCount =
    apiCounts.inactive !== undefined
      ? Number(apiCounts.inactive)
      : items.filter(
          (item) => String(item?.status).toLowerCase() === "inactive",
        ).length;

  const suspendedCount =
    apiCounts.suspended !== undefined || apiCounts.suspend !== undefined
      ? Number(apiCounts.suspended ?? apiCounts.suspend)
      : items.filter(
          (item) =>
            String(item?.status).toLowerCase() === "suspend" ||
            String(item?.status).toLowerCase() === "suspended",
        ).length;

  return {
    rows: items,
    totalItems: Number(totalItems) || 0,
    totalPages: Number(totalPages) || 1,
    summary: {
      total: totalCount,
      active: activeCount,
      inactive: inactiveCount,
      suspended: suspendedCount,
    },
  };
};

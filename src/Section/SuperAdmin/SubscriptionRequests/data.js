import { formatDateWithUserPreferences } from "../../../Utils/date";

export const SUBSCRIPTION_REQUESTS_PER_PAGE = 10;

export const subscriptionStatusFilterOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Pending Approval", value: "pending" },
  { label: "Active", value: "active" },
  { label: "Rejected", value: "rejected" },
];

export const targetTypeFilterOptions = [
  { label: "All Organizations", value: "all" },
  { label: "Laundries", value: "laundry" },
  { label: "Businesses", value: "tenant" },
];

export const normalizeSubscriptionRequest = (item) => {
  const rawStatus = String(item?.status || "pending").toLowerCase();
  const orgName =
    item?.laundry?.companyName ||
    item?.laundry?.fullName ||
    item?.tenant?.businessName ||
    item?.tenant?.companyName ||
    item?.tenant?.fullName ||
    item?.tenant?.name ||
    "—";

  const orgEmail =
    item?.laundry?.email ||
    item?.tenant?.email ||
    "—";

  const targetTypeLabel =
    item?.targetType === "laundry" ? "Laundry" : "Business";

  let statusVariant = "warning";
  let statusLabel = "Pending";
  if (rawStatus === "active") {
    statusVariant = "success";
    statusLabel = "Active";
  } else if (rawStatus === "rejected") {
    statusVariant = "danger";
    statusLabel = "Rejected";
  } else if (rawStatus === "expired") {
    statusVariant = "neutral";
    statusLabel = "Expired";
  }

  return {
    ...item,
    id: item?.id,
    orgName,
    orgEmail,
    targetTypeLabel,
    planName: item?.plan?.name || "—",
    planCode: item?.plan?.code || "—",
    formattedPrice: `$${Number(item?.price || 0).toFixed(2)}`,
    billingCycle: item?.billingCycle || "monthly",
    status: statusLabel,
    rawStatus,
    statusVariant,
    created: formatDateWithUserPreferences(item?.createdAt),
    startDate: item?.startDate ? formatDateWithUserPreferences(item.startDate) : "—",
    endDate: item?.endDate ? formatDateWithUserPreferences(item.endDate) : "—",
  };
};

export const getSubscriptionRequestsPaginatedCollection = (response) => {
  const root = response?.data?.data || response?.data || response || {};
  const items =
    root.items ||
    root.rows ||
    (Array.isArray(root) ? root : []);

  const pagination = root.pagination || {};
  const summary = root.summary || {};
  const totalItems =
    pagination.total ??
    pagination.totalItems ??
    root.count ??
    items.length;

  const totalPages =
    pagination.totalPages ??
    pagination.pages ??
    (Math.ceil(totalItems / SUBSCRIPTION_REQUESTS_PER_PAGE) || 1);

  return {
    rows: items,
    totalItems: Number(totalItems) || 0,
    totalPages: Number(totalPages) || 1,
    currentPage: Number(pagination.page ?? 1) - 1,
    summary: {
      total: summary.total ?? totalItems,
      pendingCount: summary.pendingCount ?? 0,
      activeCount: summary.activeCount ?? 0,
      rejectedCount: summary.rejectedCount ?? 0,
    },
  };
};

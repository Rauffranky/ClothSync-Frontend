import { formatDateWithUserPreferences } from "../../../Utils/date";

export const BUSINESS_TYPES_PER_PAGE = 10;

export const businessTypeStatusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export const normalizeBusinessType = (item) => {
  const rawStatus = String(item?.status || "active").toLowerCase();
  const isActive = rawStatus === "active";

  return {
    ...item,
    id: item?.id,
    name: item?.name || "—",
    code: item?.code || "—",
    description: item?.description || "—",
    status: isActive ? "Active" : "Inactive",
    rawStatus,
    statusVariant: isActive ? "success" : "danger",
    created: formatDateWithUserPreferences(item?.createdAt || item?.created),
  };
};

export const getBusinessTypePaginatedCollection = (response) => {
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
    (Math.ceil(totalItems / BUSINESS_TYPES_PER_PAGE) || 1);

  const activeCount = items.filter(
    (item) => String(item?.status).toLowerCase() === "active",
  ).length;

  const inactiveCount = items.filter(
    (item) => String(item?.status).toLowerCase() === "inactive",
  ).length;

  return {
    rows: items,
    totalItems: Number(totalItems) || 0,
    totalPages: Number(totalPages) || 1,
    currentPage: Number(pagination.page ?? 1) - 1,
    activeCount,
    inactiveCount,
  };
};

import { formatDateWithUserPreferences } from "../../../Utils/date";

export const CATEGORY_ITEMS_PER_PAGE = 5;

export const categoryStatusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export const categoryUsageOptions = [
  { label: "All Usage", value: "all" },
  { label: "In Use", value: "in use" },
  { label: "Not In Use", value: "not in use" },
];

const getCount = (value, fallback = null) => {
  const count = Number(value);
  return Number.isFinite(count) ? count : fallback;
};

export const normalizeCategory = (category) => {
  const status = String(category?.status || "inactive").toLowerCase();
  const translation = category?.translations?.en || {};
  const assetCount = getCount(
    category?.totalMappedAssets ??
      category?.assetCount ??
      category?.assetsCount ??
      category?.assets?.length,
    0,
  );
  const usageValue = category?.usage ?? category?.usageStatus;
  const isUsed = usageValue
    ? String(usageValue).toLowerCase() === "in use"
    : assetCount > 0;

  return {
    ...category,
    apiId: category?._id || category?.id,
    id:
      category?.categoryCode ||
      category?.categoryId ||
      category?.code ||
      category?._id ||
      category?.id,
    name:
      category?.title ||
      category?.name ||
      category?.categoryName ||
      translation.title ||
      "Unnamed Category",
    description: category?.description || translation.description || "",
    status: status === "active" ? "Active" : "Inactive",
    statusVariant: status === "active" ? "success" : "danger",
    usage: isUsed ? "In Use" : "Not in Use",
    usageState: isUsed ? "used" : "unused",
    assets: assetCount,
    created: formatDateWithUserPreferences(
      category?.createdAt || category?.created,
    ),
    lastUpdated: formatDateWithUserPreferences(
      category?.updatedAt || category?.lastUpdated,
    ),
  };
};

export const normalizeCategorySummary = (counts) => {
  const summary = Array.isArray(counts)
    ? Object.fromEntries(
        counts
          .filter((item) => item?.key)
          .map((item) => [item.key, getCount(item.count)]),
      )
    : counts || {};

  return {
    totalCategories: getCount(summary.totalCategories),
    activeCategories: getCount(summary.activeCategories),
    inactiveCategories: getCount(summary.inactiveCategories),
    categoriesInUse: getCount(summary.categoriesInUse),
  };
};

export const getCategoryPaginatedCollection = (
  response,
  limit = CATEGORY_ITEMS_PER_PAGE,
) => {
  const payload = response?.data ?? response ?? {};
  const rows = Array.isArray(payload)
    ? payload
    : payload?.items ||
      payload?.categories ||
      payload?.docs ||
      payload?.results ||
      [];
  const pagination = payload?.pagination || payload?.meta || {};
  const totalItems = getCount(
    pagination?.totalItems ??
      pagination?.totalDocs ??
      pagination?.total ??
      rows.length,
    0,
  );
  const totalPages = getCount(
    pagination?.totalPages ??
      pagination?.pages ??
      Math.ceil(totalItems / limit),
    0,
  );

  return {
    rows: Array.isArray(rows) ? rows : [],
    summary: normalizeCategorySummary(payload?.counts),
    totalItems,
    totalPages,
  };
};

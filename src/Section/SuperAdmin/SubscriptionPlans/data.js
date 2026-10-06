import * as Yup from "yup";
import { formatDateWithUserPreferences } from "../../../Utils/date";

export const SUBSCRIPTION_PLANS_PER_PAGE = 10;

export const subscriptionPlanStatusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export const billingCycleOptions = [
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Yearly", value: "yearly" },
  { label: "One-Time", value: "one_time" },
];

export const formatBillingCycle = (cycle) => {
  const map = {
    monthly: "Monthly",
    quarterly: "Quarterly",
    yearly: "Yearly",
    one_time: "One-Time",
  };
  return map[cycle] || cycle || "Monthly";
};

export const formatQuota = (val) => {
  if (val === null || val === undefined || val === -1) {
    return "Unlimited";
  }
  return Number(val).toLocaleString();
};

export const normalizeSubscriptionPlan = (item) => {
  const rawStatus = String(item?.status || "active").toLowerCase();
  const isActive = rawStatus === "active";
  const numPrice = Number(item?.price || 0);

  return {
    ...item,
    id: item?.id,
    name: item?.name || "—",
    code: item?.code || "—",
    description: item?.description || "—",
    price: numPrice,
    formattedPrice: `$${numPrice.toFixed(2)}`,
    billingCycle: item?.billingCycle || "monthly",
    formattedBillingCycle: formatBillingCycle(item?.billingCycle),
    targetType: item?.targetType || "laundry",
    maxLinkedBusinesses: item?.maxLinkedBusinesses,
    maxScanners: item?.maxScanners,
    maxStaff: item?.maxStaff,
    maxStaffRoles: item?.maxStaffRoles,
    maxAssets: item?.maxAssets,
    maxCategories: item?.maxCategories,
    allowBulkScan: Boolean(item?.allowBulkScan),
    allowBatchDispatch: Boolean(item?.allowBatchDispatch),
    allowReports: Boolean(item?.allowReports),
    status: isActive ? "Active" : "Inactive",
    rawStatus,
    statusVariant: isActive ? "success" : "danger",
    created: formatDateWithUserPreferences(item?.createdAt || item?.created),
  };
};

export const getSubscriptionPlanPaginatedCollection = (response) => {
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
    (Math.ceil(totalItems / SUBSCRIPTION_PLANS_PER_PAGE) || 1);

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

export const subscriptionPlanValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Plan name must be at least 2 characters")
    .max(100, "Plan name cannot exceed 100 characters")
    .required("Plan name is required"),
  code: Yup.string()
    .trim()
    .matches(
      /^[a-z0-9_-]*$/,
      "Code can only contain lowercase letters, numbers, hyphens, and underscores",
    )
    .max(100, "Code cannot exceed 100 characters")
    .required("Identifier code is required"),
  targetType: Yup.string()
    .oneOf(["laundry", "business"])
    .required("Target portal type is required"),
  description: Yup.string()
    .trim()
    .max(255, "Description cannot exceed 255 characters"),
  price: Yup.number()
    .typeError("Price must be a valid number")
    .min(0, "Price cannot be negative")
    .required("Price is required"),
  billingCycle: Yup.string()
    .oneOf(["monthly", "quarterly", "yearly", "one_time"])
    .required("Billing cycle is required"),
  unlimitedLinkedBusinesses: Yup.boolean(),
  maxLinkedBusinesses: Yup.mixed().when("unlimitedLinkedBusinesses", {
    is: (val) => val === true,
    then: (schema) => schema.nullable().optional(),
    otherwise: (schema) =>
      schema
        .test(
          "required-quota",
          "Quota limit is required when Unlimited is turned off",
          (val) => val !== "" && val !== null && val !== undefined,
        )
        .test("valid-quota", "Must be 0 or greater", (val) => {
          if (val === "" || val === null || val === undefined) return false;
          const n = Number(val);
          return !isNaN(n) && n >= 0 && Number.isInteger(n);
        }),
  }),
  unlimitedScanners: Yup.boolean(),
  maxScanners: Yup.mixed().when("unlimitedScanners", {
    is: (val) => val === true,
    then: (schema) => schema.nullable().optional(),
    otherwise: (schema) =>
      schema
        .test(
          "required-quota",
          "Quota limit is required when Unlimited is turned off",
          (val) => val !== "" && val !== null && val !== undefined,
        )
        .test("valid-quota", "Must be 0 or greater", (val) => {
          if (val === "" || val === null || val === undefined) return false;
          const n = Number(val);
          return !isNaN(n) && n >= 0 && Number.isInteger(n);
        }),
  }),
  unlimitedStaff: Yup.boolean(),
  maxStaff: Yup.mixed().when("unlimitedStaff", {
    is: (val) => val === true,
    then: (schema) => schema.nullable().optional(),
    otherwise: (schema) =>
      schema
        .test(
          "required-quota",
          "Quota limit is required when Unlimited is turned off",
          (val) => val !== "" && val !== null && val !== undefined,
        )
        .test("valid-quota", "Must be 0 or greater", (val) => {
          if (val === "" || val === null || val === undefined) return false;
          const n = Number(val);
          return !isNaN(n) && n >= 0 && Number.isInteger(n);
        }),
  }),
  unlimitedStaffRoles: Yup.boolean(),
  maxStaffRoles: Yup.mixed().when("unlimitedStaffRoles", {
    is: (val) => val === true,
    then: (schema) => schema.nullable().optional(),
    otherwise: (schema) =>
      schema
        .test(
          "required-quota",
          "Quota limit is required when Unlimited is turned off",
          (val) => val !== "" && val !== null && val !== undefined,
        )
        .test("valid-quota", "Must be 0 or greater", (val) => {
          if (val === "" || val === null || val === undefined) return false;
          const n = Number(val);
          return !isNaN(n) && n >= 0 && Number.isInteger(n);
        }),
  }),
  unlimitedAssets: Yup.boolean(),
  maxAssets: Yup.mixed().when(["targetType", "unlimitedAssets"], {
    is: (targetType, unlimitedAssets) =>
      targetType === "business" && !unlimitedAssets,
    then: (schema) =>
      schema
        .test(
          "required-quota",
          "Quota limit is required when Unlimited is turned off",
          (val) => val !== "" && val !== null && val !== undefined,
        )
        .test("valid-quota", "Must be 0 or greater", (val) => {
          if (val === "" || val === null || val === undefined) return false;
          const n = Number(val);
          return !isNaN(n) && n >= 0 && Number.isInteger(n);
        }),
    otherwise: (schema) => schema.nullable().optional(),
  }),
  unlimitedCategories: Yup.boolean(),
  maxCategories: Yup.mixed().when(["targetType", "unlimitedCategories"], {
    is: (targetType, unlimitedCategories) =>
      targetType === "business" && !unlimitedCategories,
    then: (schema) =>
      schema
        .test(
          "required-quota",
          "Quota limit is required when Unlimited is turned off",
          (val) => val !== "" && val !== null && val !== undefined,
        )
        .test("valid-quota", "Must be 0 or greater", (val) => {
          if (val === "" || val === null || val === undefined) return false;
          const n = Number(val);
          return !isNaN(n) && n >= 0 && Number.isInteger(n);
        }),
    otherwise: (schema) => schema.nullable().optional(),
  }),
  allowBulkScan: Yup.boolean(),
  allowBatchDispatch: Yup.boolean(),
  allowReports: Yup.boolean(),
  status: Yup.string().oneOf(["active", "inactive"]).required("Status is required"),
});

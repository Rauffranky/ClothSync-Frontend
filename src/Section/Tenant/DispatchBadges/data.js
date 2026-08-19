export const DISPATCH_BATCH_ITEMS_PER_PAGE = 7;

export const STATUS_BADGE_VARIANTS = {
  "Dispatched": "pending",
  "Sent to Laundry": "pending",
  "At Laundry": "purple",
  "In Laundry": "purple",
  "Checked In": "info",
  "Sent to Business": "ready",
  "Completed": "completed",
  "Returned": "completed",
  "Partially Returned": "warning",
  "Delayed": "overdue",
  "Missing": "overdue",
};

export const laundryOptions = [
  { label: "Laundries", value: "all" },
  { label: "FreshCare Laundry", value: "FreshCare Laundry" },
  { label: "Prime Laundry Services", value: "Prime Laundry Services" },
  { label: "BlueStar Textile", value: "BlueStar Textile" },
  { label: "PrimeLinen Pro", value: "PrimeLinen Pro" },
  { label: "Meridian Clean Services", value: "Meridian Clean Services" },
];

export const statusOptions = [
  { label: "Status", value: "all" },
  { label: "Sent to Laundry", value: "Sent to Laundry" },
  { label: "In Laundry", value: "In Laundry" },
  { label: "Sent to Business", value: "Sent to Business" },
  { label: "Returned", value: "Returned" },
  { label: "Delayed", value: "Delayed" },
];

export const INITIAL_DISPATCH_BATCHES = [
  {
    id: "BATCH-1024",
    laundryName: "FreshCare Laundry",
    dispatchLocation: "Main Site",
    created: "Jun 29, 2026, 10:30 AM",
    items: 120,
    status: "Sent to Laundry",
    createdBy: "Sarah Khan",
    driverName: "Kashif Mahmood",
    vehicleNumber: "LEA-4921",
    estimatedReturn: "Jul 01, 2026",
    notes: "Regular weekly linen supply batch.",
  },
  {
    id: "BATCH-1023",
    laundryName: "Prime Laundry Services",
    dispatchLocation: "North Site",
    created: "Jun 28, 2026, 04:15 PM",
    items: 86,
    status: "In Laundry",
    createdBy: "Ahmed Ali",
    driverName: "Tariq Jameel",
    vehicleNumber: "KHI-8832",
    estimatedReturn: "Jun 30, 2026",
    notes: "High-priority bath towels wash.",
  },
  {
    id: "BATCH-1022",
    laundryName: "FreshCare Laundry",
    dispatchLocation: "Main Site",
    created: "Jun 27, 2026, 11:00 AM",
    items: 154,
    status: "Sent to Business",
    createdBy: "Sarah Khan",
    driverName: "Kashif Mahmood",
    vehicleNumber: "LEA-4921",
    estimatedReturn: "Jun 29, 2026",
    notes: "Linen returned and dispatched back to business main store.",
  },
  {
    id: "BATCH-1021",
    laundryName: "BlueStar Textile",
    dispatchLocation: "East Wing",
    created: "Jun 26, 2026, 09:45 AM",
    items: 63,
    status: "Returned",
    createdBy: "Rania Aziz",
    driverName: "Bilal Hassan",
    vehicleNumber: "ISL-1002",
    estimatedReturn: "Jun 28, 2026",
    notes: "Delivered and verified at East Wing reception.",
  },
  {
    id: "BATCH-1020",
    laundryName: "PrimeLinen Pro",
    dispatchLocation: "South Hub",
    created: "Jun 25, 2026, 02:00 PM",
    items: 98,
    status: "Delayed",
    createdBy: "James Okafor",
    driverName: "Usman Raza",
    vehicleNumber: "LHR-7721",
    estimatedReturn: "Jun 27, 2026",
    notes: "Delayed due to presser maintenance issue at facility.",
  },
  {
    id: "BATCH-1019",
    laundryName: "Meridian Clean Services",
    dispatchLocation: "West Block",
    created: "Jun 24, 2026, 08:30 AM",
    items: 44,
    status: "In Laundry",
    createdBy: "Priya Nair",
    driverName: "Rashid Minhas",
    vehicleNumber: "FSD-3091",
    estimatedReturn: "Jun 27, 2026",
    notes: "Special stain removal treatment underway.",
  },
  {
    id: "BATCH-1018",
    laundryName: "FreshCare Laundry",
    dispatchLocation: "Main Site",
    created: "Jun 23, 2026, 03:20 PM",
    items: 210,
    status: "Returned",
    createdBy: "Sarah Khan",
    driverName: "Kashif Mahmood",
    vehicleNumber: "LEA-4921",
    estimatedReturn: "Jun 25, 2026",
    notes: "Bulk bedsheet batch returned cleanly.",
  },
  {
    id: "BATCH-1017",
    laundryName: "BlueStar Textile",
    dispatchLocation: "North Site",
    created: "Jun 22, 2026, 10:00 AM",
    items: 115,
    status: "Sent to Laundry",
    createdBy: "Ahmed Ali",
    driverName: "Bilal Hassan",
    vehicleNumber: "ISL-1002",
    estimatedReturn: "Jun 24, 2026",
    notes: "Uniform and tablecloths dispatch.",
  },
  {
    id: "BATCH-1016",
    laundryName: "PrimeLinen Pro",
    dispatchLocation: "Main Site",
    created: "Jun 21, 2026, 01:15 PM",
    items: 75,
    status: "Delayed",
    createdBy: "Sarah Khan",
    driverName: "Usman Raza",
    vehicleNumber: "LHR-7721",
    estimatedReturn: "Jun 23, 2026",
    notes: "Weather delay on delivery route.",
  },
  {
    id: "BATCH-1015",
    laundryName: "FreshCare Laundry",
    dispatchLocation: "East Wing",
    created: "Jun 20, 2026, 09:00 AM",
    items: 180,
    status: "Delayed",
    createdBy: "James Okafor",
    driverName: "Kashif Mahmood",
    vehicleNumber: "LEA-4921",
    estimatedReturn: "Jun 22, 2026",
    notes: "Awaiting inspection approval.",
  },
];

export const getDispatchSummaryCounts = (batches = []) => {
  return {
    totalBatches: batches.length,
    sentToLaundry: batches.filter((b) => b.status === "Sent to Laundry").length,
    inLaundry: batches.filter((b) => b.status === "In Laundry").length,
    returned: batches.filter((b) => b.status === "Returned" || b.status === "Sent to Business").length,
    delayed: batches.filter((b) => b.status === "Delayed").length,
  };
};

const countValue = (counts, keys, fallback = 0) => {
  if (Array.isArray(counts)) {
    const match = counts.find((item) => keys.includes(item?.key));
    return Number(match?.count ?? match?.value ?? fallback);
  }
  const key = keys.find((item) => counts?.[item] != null);
  return Number(key ? counts[key] : fallback);
};

export const getTenantDispatchBatchCollection = (response, limit = 20) => {
  const payload = response?.data ?? response ?? {};
  const items = [payload.items, payload.batches, payload.docs].find(Array.isArray) ?? [];
  const pagination = payload.pagination ?? payload.meta ?? {};
  const totalItems = Number(pagination.totalItems ?? pagination.total ?? payload.total ?? items.length);
  const totalPages = Number(pagination.totalPages ?? pagination.pages ?? Math.ceil(totalItems / limit));
  const counts = payload.counts ?? payload.summary ?? {};

  const rows = items.map((batch) => {
    const laundry =
      batch.laundry ??
      batch.laundryLink?.laundry ??
      batch.linkedLaundry?.laundry ??
      {};
    const creator =
      batch.dispatcher ??
      batch.createdByUser ??
      batch.creator ??
      batch.createdBy ??
      {};
    const backendId = batch.id ?? batch._id;
    const rawStatus = batch.status ?? batch.batchStatus ?? "";
    const returnProgress = batch.returnProgress ?? {};
    const returned = Number(batch.returned ?? returnProgress.returned ?? 0) || 0;
    const missing = Number(batch.missing ?? 0) || 0;
    const total = Number(
      batch.totalItems ?? returnProgress.total ?? batch.totalTagsCount ?? 0,
    ) || 0;
    const returnProgressPercentage = Number(
      batch.returnProgressPercentage ?? returnProgress.percentage ?? (total ? (returned / total) * 100 : 0),
    ) || 0;
    return {
      ...batch,
      apiId: backendId,
      id: batch.batchCode ?? batch.batchId ?? batch.code ?? backendId ?? "—",
      laundryName: batch.laundryName ?? laundry.companyName ?? laundry.businessName ?? laundry.name ?? "—",
      dispatchLocation: batch.dispatchLocation ?? batch.locationName ?? batch.location ?? "—",
      created: formatDateTime(batch.createdAt ?? batch.dispatchDateTime ?? batch.created),
      items: total || Number(batch.itemsCount ?? batch.totalItemsCount ?? batch.items?.length ?? 0),
      returned,
      missing,
      returnProgressPercentage: Math.min(Math.max(returnProgressPercentage, 0), 100),
      status: formatStatusLabel(rawStatus),
      rawStatus,
      createdBy: (typeof creator === "string" ? creator : creator.fullName ?? creator.name) ?? "—",
    };
  });
  const localCounts = getDispatchSummaryCounts(rows);

  return {
    rows,
    pagination: { totalItems, totalPages },
    counts: {
      totalBatches: countValue(counts, ["totalBatches", "total"], totalItems),
      sentToLaundry: countValue(counts, ["sentToLaundry", "sent_to_laundry"], localCounts.sentToLaundry),
      inLaundry: countValue(counts, ["inLaundry", "at_laundry", "in_laundry"], localCounts.inLaundry),
      returned: countValue(counts, ["returned", "sentToBusiness", "sent_to_business"], localCounts.returned),
      delayed: countValue(counts, ["delayed"], localCounts.delayed),
    },
  };
};
import { formatDateTime } from "../../../Utils/date";
import { formatStatusLabel } from "../../../Utils/status";

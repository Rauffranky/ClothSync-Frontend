import { formatDateTime } from "../../../Utils/date";
import { formatStatusLabel } from "../../../Utils/status";

export const assetsData = [
    {
        id: "LNS-BED-0041",
        name: "King Duvet Cover",
        tag: "TAG-001",
        category: "Bed Linen",
        location: "Laundry — Floor 2",
        lastScanTime: "2 min ago",
        status: "In Laundry",
        statusVariant: "purple", // Assuming 'purple' is for In Laundry based on image colors
        washCount: 14,
        maxWash: 200,
        assignedLaundry: "PureWash Industrial",
    },
    {
        id: "LNS-TWL-0198",
        name: "Bath Towel — Large",
        tag: "TAG-002",
        category: "Bath Towels",
        location: "Loading Bay Exit",
        lastScanTime: "7 min ago",
        status: "Sent to Laundry",
        statusVariant: "warning",
        washCount: 27,
        maxWash: 150,
        assignedLaundry: "PureWash Industrial",
    },
    {
        id: "LNS-UNF-0067",
        name: "Housekeeping Apron",
        tag: "TAG-003",
        category: "Staff Uniforms",
        location: "Lobby — Floor 1",
        lastScanTime: "1 hr ago",
        status: "In Business",
        statusVariant: "success",
        washCount: 8,
        maxWash: 100,
        assignedLaundry: "—",
    },
    {
        id: "LNS-BED-0099",
        name: "Pillow Case Set",
        tag: "TAG-004",
        category: "Bed Linen",
        location: "PureWash Industrial",
        lastScanTime: "3 hrs ago",
        status: "Delayed",
        statusVariant: "danger",
        washCount: 31,
        maxWash: 200,
        assignedLaundry: "PureWash Industrial",
    },
    {
        id: "LNS-TBL-0012",
        name: "Round Tablecloth",
        tag: "TAG-007",
        category: "Table Linen",
        location: "Warehouse — Floor G",
        lastScanTime: "30 min ago",
        status: "Washed",
        statusVariant: "info",
        washCount: 5,
        maxWash: 300,
        assignedLaundry: "Metro Linen Service",
    },
    {
        id: "LNS-TBL-0013",
        name: "Round Tablecloth",
        tag: "TAG-007",
        category: "Table Linen",
        location: "Warehouse — Floor G",
        lastScanTime: "30 min ago",
        status: "Washed",
        statusVariant: "info",
        washCount: 5,
        maxWash: 300,
        assignedLaundry: "Metro Linen Service",
    },
    {
        id: "LNS-TBL-0014",
        name: "Round Tablecloth",
        tag: "TAG-007",
        category: "Table Linen",
        location: "Warehouse — Floor G",
        lastScanTime: "30 min ago",
        status: "Washed",
        statusVariant: "info",
        washCount: 5,
        maxWash: 300,
        assignedLaundry: "Metro Linen Service",
    },
    {
        id: "LNS-TBL-0015",
        name: "Round Tablecloth",
        tag: "TAG-007",
        category: "Table Linen",
        location: "Warehouse — Floor G",
        lastScanTime: "30 min ago",
        status: "Washed",
        statusVariant: "info",
        washCount: 5,
        maxWash: 300,
        assignedLaundry: "Metro Linen Service",
    },
    {
        id: "LNS-TBL-0011",
        name: "Round Tablecloth",
        tag: "TAG-007",
        category: "Table Linen",
        location: "Warehouse — Floor G",
        lastScanTime: "30 min ago",
        status: "Washed",
        statusVariant: "info",
        washCount: 5,
        maxWash: 300,
        assignedLaundry: "Metro Linen Service",
    },
    {
        id: "LNS-POL-0001",
        name: "Pool Towel XL",
        tag: "TAG-007",
        category: "Pool Towels",
        location: "Warehouse — Floor G",
        lastScanTime: "Never",
        status: "In Business",
        statusVariant: "success",
        washCount: 0,
        maxWash: 150,
        assignedLaundry: "—",
    },
    {
        id: "LNS-BED-0020",
        name: "Queen Flat Sheet",
        tag: "No Tag",
        category: "Bed Linen",
        location: "Warehouse — Floor G",
        lastScanTime: "14 days ago",
        status: "Retired",
        statusVariant: "neutral",
        washCount: 198,
        maxWash: 200,
        assignedLaundry: "—",
    },
];

export const categoryOptions = [
    { label: "All Categories", value: "all" },
    { label: "Bed Linen", value: "Bed Linen" },
    { label: "Bath Towels", value: "Bath Towels" },
    { label: "Staff Uniforms", value: "Staff Uniforms" },
];

export const zoneOptions = [
    { label: "All Zones", value: "all" },
    { label: "Floor 1", value: "Floor 1" },
    { label: "Floor 2", value: "Floor 2" },
    { label: "Warehouse", value: "Warehouse" },
];

export const laundryFilterOptions = [
    { label: "All Laundries", value: "all" },
    { label: "PureWash Industrial", value: "PureWash Industrial" },
    { label: "Metro Linen Service", value: "Metro Linen Service" },
];

export const assetStatusOptions = [
    { label: "All Statuses", value: "all" },
    { label: "In Business", value: "in_business" },
    { label: "Sent to Laundry", value: "sent_to_laundry" },
    { label: "In Laundry", value: "at_laundry" },
    { label: "Washed", value: "washed" },
    { label: "Returned", value: "returned" },
    { label: "Missing", value: "missing" },
    { label: "Retired", value: "retired" },
    { label: "Inactive", value: "inactive" },
];

const getName = (record, keys, fallback = "—") => {
    const translation = record?.translations?.en || {};
    return keys.map((key) => record?.[key] ?? translation?.[key]).find(Boolean) || fallback;
};

const statusVariants = {
    in_business: "success",
    sent_to_laundry: "warning",
    at_laundry: "purple",
    washed: "info",
    returned: "info",
    missing: "danger",
    retired: "neutral",
    inactive: "danger",
};

export const normalizeTenantAsset = (asset = {}) => {
    const statusValue = asset.status || asset.currentStatus || "inactive";
    const category = asset.category || null;
    const laundryLink = asset.assignedLaundryLink || asset.laundryLink || null;
    const tags = Array.isArray(asset.tags) ? asset.tags : [];
    const firstTag = tags[0] || asset.tag || null;

    return {
        ...asset,
        apiId: asset.id || asset._id,
        id: asset.assetCode || asset.code || asset.id || asset._id,
        name: getName(asset, ["assetName", "name"], "Unnamed Asset"),
        tag: firstTag?.tagCode || firstTag?.epc || asset.tagCode || "No Tag",
        category: getName(category, ["title", "categoryName", "name"]),
        categoryId: asset.categoryId || category?.id || category?._id,
        zoneName: asset.zoneName || asset.location || "—",
        location: asset.lastScanLocation || asset.zoneName || "—",
        lastScanTime: asset.lastScannedAt
            ? formatDateTime(asset.lastScannedAt, true, true)
            : "Never",
        statusValue,
        status: formatStatusLabel(statusValue),
        statusVariant: statusVariants[statusValue] || "neutral",
        washCount: Number(asset.washCount) || 0,
        maxWash: Number(asset.washLimit) || 0,
        assignedLaundry:
            getName(laundryLink?.laundry || laundryLink, ["businessName", "companyName", "name"], "—"),
        laundryLinkId: asset.assignedLaundryLinkId || laundryLink?.id || laundryLink?._id,
    };
};

const getCount = (value, fallback = 0) => {
    const count = Number(value);
    return Number.isFinite(count) ? count : fallback;
};

export const normalizeTenantAssetCounts = (counts, totalItems = null) => {
    const source = Array.isArray(counts)
        ? Object.fromEntries(
            counts.filter((item) => item?.key).map((item) => [item.key, item.count]),
        )
        : counts || {};
    const optionalCount = (value) => {
        if (value === null || value === undefined) return null;
        const count = Number(value);
        return Number.isFinite(count) ? count : null;
    };

    return {
        totalAssets: optionalCount(source.totalAssets ?? source.total ?? totalItems),
        inBusiness: optionalCount(source.inBusiness ?? source.inBusinessAssets ?? source.in_business),
        sentToLaundry: optionalCount(source.sentToLaundry ?? source.sentToLaundryAssets ?? source.sent_to_laundry),
        atLaundry: optionalCount(source.atLaundry ?? source.inLaundry ?? source.inLaundryAssets ?? source.at_laundry),
        washed: optionalCount(source.washed ?? source.washedAssets),
        returned: optionalCount(source.returned ?? source.returnedAssets),
        delayed: optionalCount(source.delayed ?? source.delayedAssets),
        missing: optionalCount(source.missing ?? source.missingLost ?? source.missingLostAssets ?? source.missing_lost),
    };
};

export const getTenantAssetCollection = (response, limit = 20) => {
    const payload = response?.data ?? response ?? {};
    const items = Array.isArray(payload)
        ? payload
        : payload.items || payload.assets || payload.docs || payload.results || [];
    const rows = Array.isArray(items) ? items.map(normalizeTenantAsset) : [];
    const pagination = payload.pagination || payload.meta || {};
    const totalItems = getCount(
        pagination.totalItems ?? pagination.totalDocs ?? pagination.total ?? rows.length,
    );
    const filterSource = payload.filters || payload.filterOptions || {};
    const zones = filterSource.zoneNames || filterSource.zones || payload.zoneNames || [];

    return {
        rows,
        pagination: {
            totalItems,
            totalPages: getCount(
                pagination.totalPages ?? pagination.pages ?? Math.ceil(totalItems / limit),
            ),
        },
        counts: normalizeTenantAssetCounts(
            payload.counts || payload.summary,
            totalItems,
        ),
        zones: Array.isArray(zones)
            ? zones.map((zone) => typeof zone === "string" ? zone : zone?.value || zone?.zoneName).filter(Boolean)
            : [],
    };
};

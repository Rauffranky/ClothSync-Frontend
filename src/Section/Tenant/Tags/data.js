export const tagsData = [
    {
        id: "TAG-001",
        epc: "E2800189200040D6...",
        mapping: "Linked",
        assignedAsset: "King Duvet Cover",
        assetId: "LNS-BED-0041",
        category: "Bed Linen",
        assetStatus: "In Laundry",
        assetStatusVariant: "laundry",
        tagStatus: "Active",
        tagStatusVariant: "primary",
        lastScanTime: "2 min ago",
        location: "Laundry — Loading Bay",
        createdAt: "Jan 12, 2025",
    },
    {
        id: "TAG-002",
        epc: "E2800189200040D6...",
        mapping: "Linked",
        assignedAsset: "Bath Towel — Large",
        assetId: "LNS-TML-0198",
        category: "Bath Towels",
        assetStatus: "Sent to Laundry",
        assetStatusVariant: "sent",
        tagStatus: "Active",
        tagStatusVariant: "primary",
        lastScanTime: "7 min ago",
        location: "Loading Bay",
        createdAt: "Jan 12, 2025",
    },
    {
        id: "TAG-003",
        epc: "E2800189200040D6...",
        mapping: "Linked",
        assignedAsset: "Housekeeping Apron",
        assetId: "LNS-UNF-0067",
        category: "Staff Uniforms",
        assetStatus: "In Business",
        assetStatusVariant: "business",
        tagStatus: "Active",
        tagStatusVariant: "primary",
        lastScanTime: "1 hr ago",
        location: "Lobby — Floor 1",
        createdAt: "Feb 3, 2025",
    },
    {
        id: "TAG-004",
        epc: "E2800189200040D6...",
        mapping: "Linked",
        assignedAsset: "Pillow Case Set",
        assetId: "LNS-BED-0099",
        category: "Bed Linen",
        assetStatus: "Delayed",
        assetStatusVariant: "delayed",
        tagStatus: "Active",
        tagStatusVariant: "primary",
        lastScanTime: "3 hrs ago",
        location: "PureWash Industrial",
        hasAlert: true,
        createdAt: "Jan 14, 2025",
    },
    {
        id: "TAG-005",
        epc: "E2800189200040D6...",
        mapping: "Linked",
        assignedAsset: "Not mapped",
        assetId: "",
        category: "—",
        assetStatus: "—",
        assetStatusVariant: "secondary",
        tagStatus: "Active",
        tagStatusVariant: "primary",
        lastScanTime: "Never",
        location: "",
        createdAt: "Jun 5, 2025",
    },
    {
        id: "TAG-006",
        epc: "E2800189200040D6...",
        mapping: "Linked",
        assignedAsset: "Not mapped",
        assetId: "",
        category: "—",
        assetStatus: "—",
        assetStatusVariant: "secondary",
        tagStatus: "Active",
        tagStatusVariant: "primary",
        lastScanTime: "Never",
        location: "",
        createdAt: "Jun 5, 2025",
    },
    {
        id: "TAG-007",
        epc: "E2800189200040D6...",
        mapping: "Linked",
        assignedAsset: "Not mapped",
        assetId: "",
        category: "—",
        assetStatus: "—",
        assetStatusVariant: "secondary",
        tagStatus: "inactive",
        tagStatusVariant: "danger",
        lastScanTime: "2 days ago",
        location: "Loading Bay",
        hasAlert: true,
        createdAt: "Mar 8, 2025",
    },
    {
        id: "TAG-008",
        epc: "E2800189200040D6...",
        mapping: "Linked",
        assignedAsset: "Not mapped",
        assetId: "",
        category: "—",
        assetStatus: "—",
        assetStatusVariant: "secondary",
        tagStatus: "inactive",
        tagStatusVariant: "danger",
        lastScanTime: "14 days ago",
        location: "Lobby — Floor 1",
        createdAt: "Mar 8, 2025",
    },
];

export const allTagsOptions = [
    { label: "All Tags", value: "all" },
    { label: "Linked", value: "linked" },
    { label: "Unlinked", value: "unlinked" },
];

export const assetStatusOptions = [
    { label: "All Asset Statuses", value: "all" },
    { label: "In Business", value: "in_business" },
    { label: "Sent to Laundry", value: "sent_to_laundry" },
    { label: "In Laundry", value: "at_laundry" },
    { label: "Washed", value: "washed" },
    { label: "Returned", value: "returned" },
    { label: "Missing", value: "missing" },
    { label: "Retired", value: "retired" },
    { label: "Inactive", value: "inactive" },
];

export const statusOptions = [
    { label: "All Tag Statuses", value: "all" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Lost", value: "lost" },
    { label: "Damaged", value: "damaged" },
    { label: "Retired", value: "retired" },
];

const getName = (record, keys, fallback = "—") => {
    if (!record) return fallback;
    const translation = record?.translations?.en || {};
    return keys.map((key) => record?.[key] ?? translation?.[key]).find(Boolean) || fallback;
};

export const getAssetStatusVariant = (status) => ({
    in_business: "ready",
    sent_to_laundry: "pending",
    at_laundry: "purple",
    washed: "success",
    returned: "info",
    delayed: "overdue",
    missing: "danger",
    retired: "neutral",
    inactive: "danger",
}[status] || "neutral");

export const normalizeTenantTag = (tag = {}) => {
    const asset = tag.asset || null;
    const category = tag.category || asset?.category || null;
    const assetStatusValue = tag.assetStatus || tag.currentStatus || asset?.status || null;
    const mappingStatus = tag.mappingStatus || tag.mapping || "unlinked";
    const tagStatus = tag.tagStatus || tag.status || "inactive";

    return {
        ...tag,
        apiId: tag.id || tag._id,
        id: tag.tagCode || tag.code || tag.id || tag._id || tag.epc,
        epc: tag.epc || "—",
        mapping: formatStatusLabel(mappingStatus),
        assignedAsset: getName(asset, ["assetName", "name"], "Not mapped"),
        assetId: asset?.assetCode || asset?.code || asset?.id || tag.assetId || "",
        category: getName(category, ["title", "categoryName", "name"]),
        assetStatusValue,
        assetStatus: assetStatusValue ? formatStatusLabel(assetStatusValue) : "—",
        assetStatusVariant: getAssetStatusVariant(assetStatusValue),
        tagStatus: formatStatusLabel(tagStatus),
        lastScanTime: tag.lastScannedAt ? formatDateTime(tag.lastScannedAt, true, true) : "Never",
        location: tag.lastScannedLocation || tag.location || "",
        createdAt: formatDateWithUserPreferences(tag.createdAt),
        hasAlert: ["delayed", "missing"].includes(assetStatusValue),
    };
};

const getCount = (value, fallback = 0) => {
    const count = Number(value);
    return Number.isFinite(count) ? count : fallback;
};

export const normalizeTenantTagCounts = (counts, totalItems = null) => {
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
        totalTags: optionalCount(source.totalTags ?? source.total ?? totalItems),
        mappedTags: optionalCount(source.mappedTags ?? source.linkedTags ?? source.mapped),
        unmappedTags: optionalCount(source.unmappedTags ?? source.unlinkedTags ?? source.unmapped),
        activeTags: optionalCount(source.activeTags ?? source.active),
        unlinkedTags: optionalCount(source.unlinkedTags ?? source.detachedTags ?? source.detached),
    };
};

export const getTenantTagCollection = (response, limit = 10) => {
    const payload = response?.data ?? response ?? {};
    const items = Array.isArray(payload)
        ? payload
        : payload.items || payload.tags || payload.docs || payload.results || [];
    const pagination = payload.pagination || payload.meta || {};
    const totalItems = getCount(
        pagination.totalItems ?? pagination.totalDocs ?? pagination.total ?? items.length,
    );

    return {
        rows: Array.isArray(items) ? items.map(normalizeTenantTag) : [],
        pagination: {
            totalItems,
            totalPages: getCount(
                pagination.totalPages ?? pagination.pages ?? Math.ceil(totalItems / limit),
            ),
        },
        counts: normalizeTenantTagCounts(
            payload.counts || payload.summary,
            totalItems,
        ),
    };
};
import { formatDateTime, formatDateWithUserPreferences } from "../../../Utils/date";
import { formatStatusLabel } from "../../../Utils/status";

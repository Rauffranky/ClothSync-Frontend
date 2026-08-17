import { Radio, Wifi, WifiOff, MapPin, Smartphone, AlertTriangle } from "lucide-react";
import { formatDateTime } from "../../../Utils/date";
import { formatStatusLabel } from "../../../Utils/status";

const titleCase = (value) =>
    String(value || "")
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());

const getScannerRows = (payload) => {
    const rows = Array.isArray(payload)
        ? payload
        : payload?.items ||
          payload?.scanners ||
          payload?.docs ||
          payload?.results ||
          [];

    return Array.isArray(rows) ? rows : [];
};

export const normalizeScannerCounts = (counts) => {
    if (Array.isArray(counts)) {
        return Object.fromEntries(
            counts
                .filter((item) => item?.key)
                .map((item) => [item.key, Number(item.count) || 0]),
        );
    }

    return counts && typeof counts === "object" ? counts : null;
};

export const normalizeScanner = (scanner, index = 0) => {
    const translations = scanner?.translations || {};
    const translation = translations?.en || scanner?.translation || {};
    const assignedOperator =
        scanner?.assignedOperator || scanner?.operator || scanner?.staff || {};
    const assignedOperatorUser = assignedOperator?.user || {};
    const apiId = scanner?.id || scanner?._id || null;

    return {
        ...scanner,
        apiId,
        id: scanner?.scannerId || scanner?.code || `scanner-${index}`,
        name: translation?.name || scanner?.name || "Unnamed Scanner",
        type: titleCase(scanner?.scannerType || scanner?.type),
        mode: titleCase(scanner?.scannerMode || scanner?.mode),
        scannerLocation:
            translation?.location ||
            scanner?.location ||
            scanner?.locationName ||
            translation?.zoneName ||
            scanner?.zoneName ||
            "",
        zoneName:
            translation?.zoneName ||
            scanner?.zoneName ||
            scanner?.locationName ||
            "",
        location:
            translation?.zoneName || scanner?.zoneName || scanner?.locationName || "-",
        operator:
            assignedOperatorUser?.fullName ||
            assignedOperatorUser?.name ||
            assignedOperator?.fullName ||
            assignedOperator?.name ||
            scanner?.operatorName ||
            null,
        assignedOperatorId:
            scanner?.assignedOperatorId ||
            assignedOperator?.id ||
            assignedOperator?._id ||
            "",
        status: formatStatusLabel(scanner?.status, ""),
        signalStatus: scanner?.signalStatus || "online",
        firmwareVersion: scanner?.firmwareVersion || "",
        batteryLevel: scanner?.batteryLevel ?? 100,
        customNotes: translation?.notes || scanner?.notes || "",
        lastActivity:
            formatDateTime(
                scanner?.lastActivityAt || scanner?.lastSeenAt,
                true,
            ) || "-",
        reads:
            scanner?.reads ??
            scanner?.readsCount ??
            scanner?.readCount ??
            scanner?.totalReads ??
            null,
    };
};

export const getScannerPaginatedCollection = (response, limit) => {
    const payload = response?.data ?? response ?? {};
    const rows = getScannerRows(payload);
    const summary = normalizeScannerCounts(
        payload?.counts ?? payload?.summary ?? response?.counts,
    );
    const pagination = payload?.pagination || response?.pagination || {};
    const totalItems = Number(
        pagination?.totalItems ?? pagination?.totalDocs ?? pagination?.total ?? rows.length,
    );
    const totalPages = Number(
        pagination?.totalPages ??
            pagination?.pages ??
            Math.ceil(totalItems / limit),
    );

    return {
        rows,
        summary,
        totalItems: Number.isFinite(totalItems) ? totalItems : 0,
        totalPages: Number.isFinite(totalPages) ? totalPages : 0,
    };
};

export const scannerStats = [
    {
        id: "total",
        label: "Total Scanners",
        subtext: "registered devices",
        icon: Radio,
        variant: "info",
    },
    {
        id: "active",
        label: "Active Scanners",
        subtext: "currently online",
        icon: Wifi,
        variant: "success",
    },
    {
        id: "inactive",
        label: "Inactive Scanners",
        subtext: "offline / disabled",
        icon: WifiOff,
        variant: "danger",
    },
    {
        id: "fixed",
        label: "Fixed Scanners",
        subtext: "wall-mounted units",
        icon: MapPin,
        variant: "purple",
    },
    {
        id: "portable",
        label: "Portable Scanners",
        subtext: "handheld units",
        icon: Smartphone,
        variant: "warning",
    },
    {
        id: "warnings",
        label: "Scanner Warnings",
        subtext: "require attention",
        icon: AlertTriangle,
        variant: "orange",
    },
];

export const scannersData = [
    {
        id: "SCN-ENT-001",
        name: "Main Entrance",
        type: "Fixed",
        mode: "Entry",
        location: "Lobby — Floor 1",
        operator: "Alex Torres",
        status: "Active",
        lastActivity: "2 min ago",
        reads: 312,
    },
    {
        id: "SCN-EXT-002",
        name: "Loading Bay Exit",
        type: "Fixed",
        mode: "Exit",
        location: "Warehouse — Floor G",
        operator: "Maria Santos",
        status: "Active",
        lastActivity: "7 min ago",
        reads: 198,
    },
    {
        id: "SCN-PRT-003",
        name: "Handheld Unit A",
        type: "Portable",
        mode: "Automatic",
        location: "Roaming",
        operator: "James Dawson",
        status: "Active",
        lastActivity: "18 min ago",
        reads: 87,
    },
    {
        id: "SCN-ENT-004",
        name: "Laundry Room Entry",
        type: "Fixed",
        mode: "Entry",
        location: "Laundry — Floor 2",
        operator: "Sarah Kim",
        status: "Warning",
        lastActivity: "1 hr ago",
        reads: 44,
    },
    {
        id: "SCN-PRT-005",
        name: "Handheld Unit B",
        type: "Portable",
        mode: "Automatic",
        location: "Roaming",
        operator: null,
        status: "Inactive",
        lastActivity: "3 hrs ago",
        reads: null,
    },
    {
        id: "SCN-EXT-006",
        name: "Staff Exit Gate",
        type: "Fixed",
        mode: "Exit",
        location: "Staff Corridor — Floor 1",
        operator: null,
        status: "Inactive",
        lastActivity: "2 days ago",
        reads: null,
    },
];

export const scannerTypeOptions = [
    { label: "All Types", value: "all" },
    { label: "Fixed", value: "fixed" },
    { label: "Portable", value: "portable" },
];

export const scannerModeOptions = [
    { label: "All Modes", value: "all" },
    { label: "Entry", value: "entry" },
    { label: "Exit", value: "exit" },
    { label: "Manual", value: "manual" },
    { label: "Auto", value: "auto" },
];

export const scannerStatusOptions = [
    { label: "All Status", value: "all" },
    { label: "Active", value: "active" },
    { label: "Warning", value: "warning" },
    { label: "Inactive", value: "inactive" },
];

export const scannerStatusVariantMap = {
    Active: "success",
    Warning: "warning",
    Inactive: "danger",
};

export const scannerLocationOptions = [
    { label: "All Locations", value: "all" },
    { label: "Lobby — Floor 1", value: "Lobby — Floor 1" },
    { label: "Warehouse — Floor G", value: "Warehouse — Floor G" },
    { label: "Roaming", value: "Roaming" },
    { label: "Laundry — Floor 2", value: "Laundry — Floor 2" },
    { label: "Staff Corridor — Floor 1", value: "Staff Corridor — Floor 1" },
];

export const referenceStates = [
    {
        id: "active",
        label: "Active",
        description: "Scanner is online and reading tags normally.",
        variant: scannerStatusVariantMap.Active,
    },
    {
        id: "warning",
        label: "Warning",
        description: "Low signal, outdated firmware, or scanner errors.",
        variant: scannerStatusVariantMap.Warning,
    },
    {
        id: "inactive",
        label: "Inactive",
        description: "No scans recorded. Deactivated or offline.",
        variant: scannerStatusVariantMap.Inactive,
    },
    {
        id: "no-location",
        label: "No Location Assigned",
        description: "Fixed scanner missing a physical location.",
        variant: "orange",
    },
    {
        id: "duplicate-id",
        label: "Duplicate Scanner ID",
        description: "ID already registered in the system.",
        variant: "danger",
    },
    {
        id: "invalid-config",
        label: "Invalid Configuration",
        description: "Portable scanner set to fixed location.",
        variant: "danger",
    },
];

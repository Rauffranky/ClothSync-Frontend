import { Radio, Wifi, WifiOff, MapPin, Smartphone, AlertTriangle } from "lucide-react";

export const scannerStats = [
    {
        id: "total",
        value: 6,
        label: "Total Scanners",
        subtext: "registered devices",
        icon: Radio,
        variant: "info",
    },
    {
        id: "active",
        value: 3,
        label: "Active Scanners",
        subtext: "currently online",
        icon: Wifi,
        variant: "success",
    },
    {
        id: "inactive",
        value: 2,
        label: "Inactive Scanners",
        subtext: "offline / disabled",
        icon: WifiOff,
        variant: "neutral",
    },
    {
        id: "fixed",
        value: 4,
        label: "Fixed Scanners",
        subtext: "wall-mounted units",
        icon: MapPin,
        variant: "purple",
    },
    {
        id: "portable",
        value: 2,
        label: "Portable Scanners",
        subtext: "handheld units",
        icon: Smartphone,
        variant: "warning",
    },
    {
        id: "warnings",
        value: 1,
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
    { label: "Fixed", value: "Fixed" },
    { label: "Portable", value: "Portable" },
];

export const scannerModeOptions = [
    { label: "All Modes", value: "all" },
    { label: "Entry", value: "Entry" },
    { label: "Exit", value: "Exit" },
    { label: "Automatic", value: "Automatic" },
];

export const scannerStatusOptions = [
    { label: "All Statuses", value: "all" },
    { label: "Active", value: "Active" },
    { label: "Warning", value: "Warning" },
    { label: "Inactive", value: "Inactive" },
];

export const scannerStatusVariantMap = {
    Active: "success",
    Warning: "warning",
    Inactive: "neutral",
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

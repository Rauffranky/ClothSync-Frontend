export const missingByCategory = [
  { label: "Bath Towels", value: 4 },
  { label: "Bed Linen", value: 3 },
  { label: "Uniforms", value: 2 },
  { label: "Pool Towels", value: 2 },
];

export const missingStatusBreakdown = [
  { label: "Missing", value: 7, color: "var(--color-overdue)" },
  { label: "Suspected", value: 3, color: "#f97316" },
  { label: "Lost", value: 1, color: "var(--theme-text-muted)" },
];

export const missingAssets = [
  {
    id: "LNS-TWL-0210",
    tagEpc: "E2800189...41033",
    category: "Bath Towels",
    categoryVariant: "info",
    lastLocation: "Loading Bay Exit",
    lastScanDate: "Jun 7",
    lastScanTime: "14:00",
    batchId: "BTH-20240528-004",
    status: "Missing",
    statusVariant: "danger",
  },
  {
    id: "LNS-POL-0022",
    tagEpc: "E2800189...51200",
    category: "Pool Towels",
    categoryVariant: "info",
    lastLocation: "CleanFlow Solutions",
    lastScanDate: "Jun 1",
    lastScanTime: "09:00",
    batchId: "BTH-20240528-004",
    status: "Suspected Lost",
    statusVariant: "warning",
  },
  {
    id: "LNS-BED-0065",
    tagEpc: "E2800189...61201",
    category: "Bed Linen",
    categoryVariant: "info",
    lastLocation: "Warehouse — Floor G",
    lastScanDate: "May 29",
    lastScanTime: "16:00",
    batchId: "BTH-20240520-001",
    status: "Missing",
    statusVariant: "danger",
  },
  {
    id: "LNS-UNF-0077",
    tagEpc: "E2800189...60809",
    category: "Uniforms",
    categoryVariant: "info",
    lastLocation: "PureWash Industrial",
    lastScanDate: "May 28",
    lastScanTime: "10:00",
    batchId: "BTH-20240415-003",
    status: "Lost",
    statusVariant: "neutral",
  },
];

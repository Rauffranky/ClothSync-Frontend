export const weekLabels = ["W18", "W19", "W20", "W21", "W22", "W23", "W24", "W25"];

export const sentReturnedSeries = {
  sent: [142, 158, 104, 205, 188, 214, 312, 286],
  returned: [138, 162, 96, 198, 183, 207, 305, 281],
};

export const delayedSeries = [8, 12, 6, 20, 14, 18, 24, 32];

export const washCycleCategories = [
  { label: "Bed Linen", value: 412 },
  { label: "Bath Towels", value: 286 },
  { label: "Uniforms", value: 174 },
  { label: "Patient Gowns", value: 202 },
  { label: "Pool Towels", value: 96 },
];

export const missingCategories = [
  { label: "Bath Towels", value: 4, color: "var(--color-sky-blue)" },
  { label: "Bed Linen", value: 3, color: "var(--color-aqua-mist)" },
  { label: "Uniforms", value: 2, color: "var(--color-seafoam)" },
  { label: "Pool Towels", value: 2, color: "var(--color-pending)" },
];

export const reportRows = [
  {
    id: "weekly-summary",
    reportType: "Weekly Summary",
    category: "All",
    laundry: "All",
    sent: 312,
    returned: 205,
    delayed: 31,
    missing: 11,
    averageTurnaround: "28h",
    washes: 1248,
    dateRange: "Jun 9–15",
  },
  {
    id: "category-report",
    reportType: "Category Report",
    category: "Bed Linen",
    laundry: "PureWash Industrial",
    sent: 142,
    returned: 118,
    delayed: 8,
    missing: 3,
    averageTurnaround: "26h",
    washes: 412,
    dateRange: "Jun 9–15",
  },
  {
    id: "laundry-report",
    reportType: "Laundry Report",
    category: "All",
    laundry: "CleanFlow Solutions",
    sent: 175,
    returned: 112,
    delayed: 1,
    missing: 4,
    averageTurnaround: "35h",
    washes: 289,
    dateRange: "Jun 9–15",
  },
  {
    id: "delayed-report",
    reportType: "Delayed Report",
    category: "Bath Towels",
    laundry: "All",
    sent: 89,
    returned: 74,
    delayed: 12,
    missing: 1,
    averageTurnaround: "38h",
    washes: 289,
    dateRange: "Jun 1–15",
  },
];

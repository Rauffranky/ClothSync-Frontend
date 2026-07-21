export const turnaroundStats = [
  {
    id: "global-average",
    label: "Global Avg. TAT",
    value: "28h",
    detail: "Across all laundries",
    color: "var(--color-sky-blue)",
  },
  {
    id: "fastest",
    label: "Fastest Laundry",
    value: "22h",
    detail: "Metro Linen Services",
    color: "var(--color-seafoam)",
  },
  {
    id: "slowest",
    label: "Slowest Laundry",
    value: "35h",
    detail: "CleanFlow Solutions",
    color: "#f97316",
  },
];

export const turnaroundRows = [
  {
    id: "purewash",
    laundry: "PureWash",
    p10: 18,
    average: 28,
    p90: 40,
    sla: 72,
    status: "Within SLA",
    statusVariant: "success",
  },
  {
    id: "cleanflow",
    laundry: "CleanFlow",
    p10: 22,
    average: 35,
    p90: 52,
    sla: 72,
    status: "Above Avg",
    statusVariant: "warning",
  },
  {
    id: "metro-linen",
    laundry: "Metro Linen",
    p10: 14,
    average: 22,
    p90: 31,
    sla: 72,
    status: "Within SLA",
    statusVariant: "success",
  },
];

export const turnaroundChartSeries = [
  { key: "p10", label: "P10 (Fastest 10%)", color: "#bfdbfe" },
  { key: "average", label: "Average", color: "var(--color-sky-blue)" },
  { key: "p90", label: "P90 (Slowest 10%)", color: "#fda4af" },
];

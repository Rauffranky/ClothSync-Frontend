export const laundryRows = [
  {
    id: "purewash-industrial",
    laundry: "PureWash Industrial",
    chartLabel: "PureWash Industrial",
    sent: 312,
    returned: 229,
    delayed: 8,
    missing: 0,
    returnRate: 73,
  },
  {
    id: "cleanflow-solutions",
    laundry: "CleanFlow Solutions",
    chartLabel: "CleanFlow Solutions",
    sent: 175,
    returned: 112,
    delayed: 1,
    missing: 4,
    returnRate: 64,
  },
  {
    id: "metro-linen-services",
    laundry: "Metro Linen Services",
    chartLabel: "Metro Linen Services",
    sent: 98,
    returned: 87,
    delayed: 0,
    missing: 0,
    returnRate: 89,
  },
];

export const laundryChartSeries = [
  { key: "sent", label: "Sent", color: "var(--color-sky-blue)" },
  { key: "returned", label: "Returned", color: "var(--color-seafoam)" },
  { key: "delayed", label: "Delayed", color: "var(--color-pending)" },
];

export const laundryMarketShare = [
  { label: "PureWash", value: 312, color: "#2563eb" },
  { label: "CleanFlow", value: 175, color: "#0ea5e9" },
  { label: "Metro", value: 98, color: "var(--color-seafoam)" },
];

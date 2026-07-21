export const sentReturnedStats = [
  {
    id: "total-sent",
    label: "Total Sent",
    value: "1,621",
    change: "+8% vs previous period",
    positive: true,
    color: "var(--color-sky-blue)",
  },
  {
    id: "total-returned",
    label: "Total Returned",
    value: "1,168",
    change: "+5% vs previous period",
    positive: true,
    color: "var(--color-seafoam)",
  },
  {
    id: "return-rate",
    label: "Return Rate",
    value: "72.1%",
    change: "-2% vs previous period",
    positive: false,
    color: "var(--color-pending)",
  },
];

export const weeklySentReturned = [
  { id: "w18", week: "W18", sent: 142, returned: 118, difference: -24, returnRate: 83 },
  { id: "w19", week: "W19", sent: 165, returned: 140, difference: -25, returnRate: 85 },
  { id: "w20", week: "W20", sent: 98, returned: 155, difference: 57, returnRate: 158 },
  { id: "w21", week: "W21", sent: 210, returned: 130, difference: -80, returnRate: 62 },
  { id: "w22", week: "W22", sent: 185, returned: 178, difference: -7, returnRate: 96 },
  { id: "w23", week: "W23", sent: 220, returned: 190, difference: -30, returnRate: 86 },
  { id: "w24", week: "W24", sent: 312, returned: 205, difference: -107, returnRate: 66 },
  { id: "w25", week: "W25", sent: 289, returned: 42, difference: -247, returnRate: 15 },
];

export const weekLabels = weeklySentReturned.map((row) => row.week);

export const sentReturnedSeries = [
  {
    label: "Sent",
    values: weeklySentReturned.map((row) => row.sent),
    color: "var(--color-sky-blue)",
    fill: true,
  },
  {
    label: "Returned",
    values: weeklySentReturned.map((row) => row.returned),
    color: "var(--color-seafoam)",
  },
];

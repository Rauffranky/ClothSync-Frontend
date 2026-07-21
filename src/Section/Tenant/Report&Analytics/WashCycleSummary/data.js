export const washCycleRows = [
  {
    id: "bed-linen",
    category: "Bed Linen",
    totalAssets: 412,
    totalWashes: 412,
    averageWashes: 14,
    maxWashLimit: 200,
    nearRetirement: 7,
  },
  {
    id: "bath-towels",
    category: "Bath Towels",
    totalAssets: 289,
    totalWashes: 289,
    averageWashes: 27,
    maxWashLimit: 150,
    nearRetirement: 18,
  },
  {
    id: "uniforms",
    category: "Uniforms",
    totalAssets: 178,
    totalWashes: 178,
    averageWashes: 8,
    maxWashLimit: 100,
    nearRetirement: 8,
  },
  {
    id: "table-linen",
    category: "Table Linen",
    totalAssets: 203,
    totalWashes: 203,
    averageWashes: 5,
    maxWashLimit: 300,
    nearRetirement: 2,
  },
  {
    id: "pool-towels",
    category: "Pool Towels",
    totalAssets: 95,
    totalWashes: 95,
    averageWashes: 11,
    maxWashLimit: 150,
    nearRetirement: 7,
  },
];

export const washCycleChartData = washCycleRows.map((row) => ({
  label: row.category,
  value: row.totalWashes,
  color: "#bfdbfe",
}));

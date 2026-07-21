import { FileDown } from "lucide-react";
import Dropdown from "../../../Components/UI/Dropdown";

const dateOptions = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 3 months", value: "3m" },
  { label: "Last 6 months", value: "6m" },
  { label: "This Year", value: "1y" },
];

const laundryOptions = [
  { label: "All Laundries", value: "all" },
  { label: "PureWash Industrial", value: "purewash" },
  { label: "CleanFlow Solutions", value: "cleanflow" },
  { label: "Metro Linen Services", value: "metro" },
];

const categoryOptions = [
  { label: "All Categories", value: "all" },
  { label: "Bed Linen", value: "bed" },
  { label: "Towels", value: "towels" },
  { label: "Uniforms", value: "uniforms" },
  { label: "Patient Gowns", value: "gowns" },
];

const ReportsFilters = ({ filters, onFilter }) => (
  <div className="flex flex-wrap items-center gap-3">
    {/* Date filter */}
    <Dropdown
      options={dateOptions}
      value={filters.date}
      onChange={(val) => onFilter("date", val)}
      placeholder="Date"
      width="w-40"
      rounded="10px"
    />

    {/* Laundry filter */}
    <Dropdown
      options={laundryOptions}
      value={filters.laundry}
      onChange={(val) => onFilter("laundry", val)}
      placeholder="Laundries"
      width="w-44"
      rounded="10px"
    />

    {/* Category filter */}
    <Dropdown
      options={categoryOptions}
      value={filters.category}
      onChange={(val) => onFilter("category", val)}
      placeholder="Categories"
      width="w-44"
      rounded="10px"
    />

    {/* Spacer */}
    <div className="flex-1" />

    {/* Quick export */}
    <span
      className="text-xs font-semibold"
      style={{ color: "var(--theme-text-muted)" }}
    >
      Quick export:
    </span>
    {["CSV", "XLSX"].map((fmt) => (
      <button
        key={fmt}
        type="button"
        className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all hover:border-[var(--color-aurora-teal)] hover:text-[var(--color-aurora-teal)]"
        style={{
          borderColor: "var(--theme-border-soft)",
          color: "var(--theme-text-secondary)",
          background: "var(--theme-surface-strong)",
        }}
      >
        <FileDown size={12} />
        {fmt}
      </button>
    ))}
  </div>
);

export default ReportsFilters;

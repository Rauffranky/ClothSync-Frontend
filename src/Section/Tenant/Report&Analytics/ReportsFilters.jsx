import { FileDown } from "lucide-react";
import Dropdown from "../../../Components/UI/Dropdown";
import Button from "../../../Components/UI/Button";

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
      triggerClassName="h-[36px]! min-h-0! py-0!"
    />

    {/* Laundry filter */}
    <Dropdown
      options={laundryOptions}
      value={filters.laundry}
      onChange={(val) => onFilter("laundry", val)}
      placeholder="Laundries"
      width="w-44"
      rounded="10px"
      triggerClassName="h-[36px]! min-h-0! py-0!"
    />

    {/* Category filter */}
    <Dropdown
      options={categoryOptions}
      value={filters.category}
      onChange={(val) => onFilter("category", val)}
      placeholder="Categories"
      width="w-44"
      rounded="10px"
      triggerClassName="h-[36px]! min-h-0! py-0!"
    />

    {/* Spacer */}
    <div className="flex-1" />

    {/* Quick export */}
    {/* <span
      className="text-xs font-semibold"
      style={{ color: "var(--theme-text-muted)" }}
    >
      Quick export:
    </span> */}
    {["CSV", "XLSX"].map((fmt) => (
      <Button
        key={fmt}
        variant="ghost"
        size="sm"
        className="h-[28px]! px-3! text-xs!"
        leftIcon={<FileDown size={12} />}
      >
        {fmt}
      </Button>
    ))}
  </div>
);

export default ReportsFilters;

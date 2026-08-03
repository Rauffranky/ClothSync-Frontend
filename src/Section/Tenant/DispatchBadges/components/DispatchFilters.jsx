import { Download, Search, X } from "lucide-react";
import Button from "../../../../Components/UI/Button";
import DateRangePicker from "../../../../Components/UI/DateRangePicker";
import Dropdown from "../../../../Components/UI/Dropdown";
import Input from "../../../../Components/UI/Input";

const DispatchFilters = ({
  searchValue = "",
  onSearchChange,
  laundryFilter = "all",
  onLaundryChange,
  statusFilter = "all",
  onStatusChange,
  dateRange = { from: "", to: "" },
  onDateRangeChange,
  laundryOptions = [],
  statusOptions = [],
  onReset,
  onExport,
}) => {
  const hasActiveFilters =
    searchValue.trim() !== "" ||
    laundryFilter !== "all" ||
    statusFilter !== "all" ||
    Boolean(dateRange?.from || dateRange?.to);

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-(--theme-surface) p-3 rounded-2xl border border-(--theme-border) shadow-xs">
      <div className="flex flex-wrap items-center gap-3 flex-1">
        {/* Search input */}
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search by Batch ID..."
            value={searchValue}
            onChange={(val) => onSearchChange(val)}
            leftIcon={<Search size={16} className="text-(--theme-text-secondary)" />}
            height="38px"
            rounded="12px"
          />
        </div>

        {/* Laundries filter */}
        <div className="w-full sm:w-48">
          <Dropdown
            options={laundryOptions}
            value={laundryFilter}
            onChange={(val) => onLaundryChange(val)}
            placeholder="Laundries"
            width="w-full"
            triggerClassName="!min-h-[38px] !h-[38px] !py-0"
            rounded="12px"
          />
        </div>

        {/* Status filter */}
        <div className="w-full sm:w-40">
          <Dropdown
            options={statusOptions}
            value={statusFilter}
            onChange={(val) => onStatusChange(val)}
            placeholder="Status"
            width="w-full"
            triggerClassName="!min-h-[38px] !h-[38px] !py-0"
            rounded="12px"
          />
        </div>

        {/* Date range picker */}
        <div className="w-full sm:w-56">
          <DateRangePicker
            value={dateRange}
            onChange={(range) => onDateRangeChange(range)}
            placeholder="Date range..."
            className="!min-h-[38px] !h-[38px] !py-0 w-full"
          />
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onReset}
            leftIcon={<X size={15} />}
            size={{ minHeight: 38, padding: "0 14px" }}
            className="rounded-xl text-xs font-semibold border-(--theme-border) text-(--theme-text-secondary) hover:text-(--theme-text-primary)"
          >
            Reset
          </Button>
        )}
      </div>

      {/* Export button */}
      <div className="flex items-center gap-2 self-end lg:self-auto">
        <Button
          variant="outline"
          onClick={onExport}
          leftIcon={<Download size={15} />}
          size={{ minHeight: 38, padding: "0 16px" }}
          className="rounded-xl text-xs font-semibold border-(--theme-border)"
        >
          Export
        </Button>
      </div>
    </div>
  );
};

export default DispatchFilters;

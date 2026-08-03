import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import Button from "../../../Components/UI/Button";
import { useDebouncedSearch } from "../../../Hooks/useDebouncedSearch";
import { toast } from "../../../Utils/toast";
import DispatchFilters from "./components/DispatchFilters";
import DispatchStats from "./components/DispatchStats";
import DispatchTable from "./components/DispatchTable";
import {
  DISPATCH_BATCH_ITEMS_PER_PAGE,
  INITIAL_DISPATCH_BATCHES,
  getDispatchSummaryCounts,
  laundryOptions,
  statusOptions,
} from "./data";

const DispatchBadges = () => {
  const [batches] = useState(INITIAL_DISPATCH_BATCHES);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedSearch(searchValue);
  const [laundryFilter, setLaundryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(0);

  // Filtered dataset
  const filteredBatches = useMemo(() => {
    return batches.filter((item) => {
      // Search filter
      const searchLower = (debouncedSearch || "").toLowerCase();
      const matchesSearch =
        !debouncedSearch ||
        item.id.toLowerCase().includes(searchLower) ||
        item.laundryName.toLowerCase().includes(searchLower) ||
        item.dispatchLocation.toLowerCase().includes(searchLower) ||
        item.createdBy.toLowerCase().includes(searchLower);

      // Laundry filter
      const matchesLaundry =
        laundryFilter === "all" || item.laundryName === laundryFilter;

      // Status filter
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      // Date range filter
      let matchesDate = true;
      if (dateRange?.from || dateRange?.to) {
        const itemTime = new Date(item.created).getTime();
        if (dateRange.from) {
          const fromTime = new Date(dateRange.from).setHours(0, 0, 0, 0);
          if (itemTime < fromTime) matchesDate = false;
        }
        if (dateRange.to) {
          const toTime = new Date(dateRange.to).setHours(23, 59, 59, 999);
          if (itemTime > toTime) matchesDate = false;
        }
      }

      return matchesSearch && matchesLaundry && matchesStatus && matchesDate;
    });
  }, [batches, dateRange, debouncedSearch, laundryFilter, statusFilter]);

  // Overall summary counts
  const summaryCounts = useMemo(() => {
    return getDispatchSummaryCounts(batches);
  }, [batches]);

  // Pagination calculation
  const totalItems = filteredBatches.length;
  const pageCount = Math.ceil(totalItems / DISPATCH_BATCH_ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const start = currentPage * DISPATCH_BATCH_ITEMS_PER_PAGE;
    return filteredBatches.slice(start, start + DISPATCH_BATCH_ITEMS_PER_PAGE);
  }, [currentPage, filteredBatches]);

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleResetFilters = () => {
    setSearchValue("");
    setLaundryFilter("all");
    setStatusFilter("all");
    setDateRange({ from: "", to: "" });
    setCurrentPage(0);
    toast.success("Filters reset");
  };

  const handleExport = () => {
    toast.success("Dispatch batches manifest exported successfully");
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-(--theme-text-primary)">
            Dispatch Batches
          </h1>
          <p className="mt-1 text-sm font-medium text-(--theme-text-secondary)">
            Create, monitor, and track linen assets sent to linked laundry partners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            leftIcon={<Plus size={18} />}
            onClick={() => toast.info("Create new batch feature initialized")}
            size={{ minHeight: 42, padding: "0 20px" }}
            className="rounded-xl font-semibold shadow-xs"
          >
            Create Batch
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <DispatchStats summary={summaryCounts} />

      {/* Filter Bar */}
      <DispatchFilters
        searchValue={searchValue}
        onSearchChange={(val) => {
          setSearchValue(val);
          setCurrentPage(0);
        }}
        laundryFilter={laundryFilter}
        onLaundryChange={(val) => {
          setLaundryFilter(val);
          setCurrentPage(0);
        }}
        statusFilter={statusFilter}
        onStatusChange={(val) => {
          setStatusFilter(val);
          setCurrentPage(0);
        }}
        dateRange={dateRange}
        onDateRangeChange={(range) => {
          setDateRange(range);
          setCurrentPage(0);
        }}
        laundryOptions={laundryOptions}
        statusOptions={statusOptions}
        onReset={handleResetFilters}
        onExport={handleExport}
      />

      {/* Batches Table */}
      <DispatchTable
        data={paginatedData}
        totalItems={totalItems}
        pageCount={pageCount}
        currentPage={currentPage}
        itemsPerPage={DISPATCH_BATCH_ITEMS_PER_PAGE}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default DispatchBadges;

import { useEffect, useMemo, useRef, useState } from "react";
import { getApiErrorMessage } from "../../../axios/api";
import { getTenantDispatchBatches } from "../../../axios/dispatchBatches/tenantDispatchBatches";
import { useDebouncedSearch } from "../../../Hooks/useDebouncedSearch";
import { toast } from "../../../Utils/toast";
import DispatchFilters from "./components/DispatchFilters";
import DispatchStats from "./components/DispatchStats";
import DispatchTable from "./components/DispatchTable";
import {
  DISPATCH_BATCH_ITEMS_PER_PAGE,
  getTenantDispatchBatchCollection,
  statusOptions,
} from "./data";

const DispatchBadges = () => {
  const [batches, setBatches] = useState([]);
  const [summaryCounts, setSummaryCounts] = useState({
    totalBatches: 0,
    sentToLaundry: 0,
    inLaundry: 0,
    returned: 0,
    delayed: 0,
  });
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedSearch(searchValue);
  const [laundryFilter, setLaundryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    // Loading synchronizes this screen with the external server collection.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    getTenantDispatchBatches({
      page: currentPage + 1,
      limit: DISPATCH_BATCH_ITEMS_PER_PAGE,
    })
      .then((response) => {
        if (requestId !== requestIdRef.current) return;
        const collection = getTenantDispatchBatchCollection(
          response,
          DISPATCH_BATCH_ITEMS_PER_PAGE,
        );
        setBatches(collection.rows);
        setSummaryCounts(collection.counts);
        setTotalItems(collection.pagination.totalItems);
        setPageCount(collection.pagination.totalPages);
      })
      .catch((error) => {
        if (requestId !== requestIdRef.current) return;
        setBatches([]);
        setTotalItems(0);
        setPageCount(0);
        toast.error(getApiErrorMessage(error, "Unable to load dispatch batches"));
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setLoading(false);
      });

    return () => {
      requestIdRef.current += 1;
    };
  }, [currentPage]);

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

  const laundryOptions = useMemo(() => [
    { label: "Laundries", value: "all" },
    ...[...new Set(batches.map((batch) => batch.laundryName).filter((name) => name && name !== "—"))]
      .map((name) => ({ label: name, value: name })),
  ], [batches]);

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
        data={filteredBatches}
        loading={loading}
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

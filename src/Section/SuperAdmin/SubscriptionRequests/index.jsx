import { useEffect, useState } from "react";
import {
  DollarSign,
  Search,
  TriangleAlert,
  RefreshCw,
} from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Card from "../../../Components/UI/Card";
import Dropdown from "../../../Components/UI/Dropdown";
import Input from "../../../Components/UI/Input";
import Pagination from "../../../Components/UI/Pagination";
import { useDebouncedSearch } from "../../../Hooks/useDebouncedSearch";
import { useSortableTableData } from "../../../Hooks/useSortableTableData";
import { getApiErrorMessage } from "../../../axios/api";
import { getAdminSubscriptionsList } from "../../../axios/subscriptions/subscriptions";
import { toast } from "../../../Utils/toast";
import Stats from "./Stats";
import SubscriptionRequestsTable from "./SubscriptionRequestsTable";
import ApproveSubscriptionModal from "./ApproveSubscriptionModal";
import RejectSubscriptionModal from "./RejectSubscriptionModal";
import {
  SUBSCRIPTION_REQUESTS_PER_PAGE,
  subscriptionStatusFilterOptions,
  targetTypeFilterOptions,
  getSubscriptionRequestsPaginatedCollection,
  normalizeSubscriptionRequest,
} from "./data";

const SubscriptionRequests = () => {
  const [requestRows, setRequestRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedSearch(searchValue);
  const [statusFilter, setStatusFilter] = useState("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [approveAction, setApproveAction] = useState(null);
  const [rejectAction, setRejectAction] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    getAdminSubscriptionsList({
      page: currentPage + 1,
      limit: SUBSCRIPTION_REQUESTS_PER_PAGE,
      ...(debouncedSearch ? { keywords: debouncedSearch } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
      ...(targetTypeFilter !== "all" ? { targetType: targetTypeFilter } : {}),
    })
      .then((response) => {
        if (!isActive) return;

        const collection = getSubscriptionRequestsPaginatedCollection(response);
        setRequestRows(collection.rows.map(normalizeSubscriptionRequest));
        setSummary(collection.summary);
        setTotalItems(collection.totalItems);
        setTotalPages(collection.totalPages);
        setLoadError("");
      })
      .catch((error) => {
        if (!isActive) return;

        const message = getApiErrorMessage(
          error,
          "Unable to load subscription requests",
        );
        setRequestRows([]);
        setSummary(null);
        setTotalItems(0);
        setTotalPages(0);
        setLoadError(message);
        toast.error(message);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [currentPage, debouncedSearch, statusFilter, targetTypeFilter, refreshKey]);

  const {
    sortedData,
    sortBy,
    sortDirection,
    handleSort,
  } = useSortableTableData(requestRows, {
    initialSortBy: "created",
    initialDirection: "desc",
  });

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const handlePageChange = (nextPage) => {
    if (nextPage === currentPage) return;
    setCurrentPage(nextPage);
  };

  const handleSearchChange = (value) => {
    setSearchValue(value);
    setCurrentPage(0);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(0);
  };

  const handleTargetTypeFilterChange = (value) => {
    setTargetTypeFilter(value);
    setCurrentPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-(--color-aurora-teal)/10 text-(--color-aurora-teal)">
            <DollarSign size={22} />
          </span>
          <div>
            <h1 className="m-0 text-2xl font-black text-(--theme-text-primary)">
              Subscription Requests & Approvals
            </h1>
            <p className="m-0 text-sm font-medium text-(--theme-text-secondary)">
              Review, approve, and activate subscriptions submitted by Laundries and Businesses.
            </p>
          </div>
        </div>

        <Button
          leftIcon={<RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />}
          onClick={handleRefresh}
          rounded="10px"
          size="sm"
          variant="outline"
        >
          Refresh
        </Button>
      </section>

      {/* Stats Summary */}
      <Stats loading={isLoading && !summary} summary={summary} />

      {/* Filter Ribbon */}
      <Card>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="w-full sm:w-72">
              <Input
                aria-label="Search subscription requests"
                leftIcon={<Search size={16} />}
                onChange={handleSearchChange}
                placeholder="Search by organization or plan..."
                value={searchValue}
              />
            </div>

            <div className="w-full sm:w-48">
              <Dropdown
                ariaLabel="Filter by status"
                name="statusFilter"
                onChange={handleStatusFilterChange}
                options={subscriptionStatusFilterOptions}
                value={statusFilter}
              />
            </div>

            <div className="w-full sm:w-48">
              <Dropdown
                ariaLabel="Filter by organization type"
                name="targetTypeFilter"
                onChange={handleTargetTypeFilterChange}
                options={targetTypeFilterOptions}
                value={targetTypeFilter}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Error state */}
      {loadError && (
        <Alert
          leftIcon={<TriangleAlert size={18} />}
          rounded="rounded-xl"
          variant="danger"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{loadError}</span>
            <Button
              onClick={handleRefresh}
              rounded="8px"
              size="xs"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </Alert>
      )}

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <SubscriptionRequestsTable
          data={sortedData}
          loading={isLoading}
          onApproveAction={(row) => setApproveAction(row)}
          onRejectAction={(row) => setRejectAction(row)}
          onSort={handleSort}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          totalRecords={totalItems}
        />
      )}

      {/* Modals */}
      <ApproveSubscriptionModal
        onClose={() => setApproveAction(null)}
        onSaved={() => {
          setApproveAction(null);
          handleRefresh();
        }}
        requestItem={approveAction}
      />

      <RejectSubscriptionModal
        onClose={() => setRejectAction(null)}
        onSaved={() => {
          setRejectAction(null);
          handleRefresh();
        }}
        requestItem={rejectAction}
      />
    </div>
  );
};

export default SubscriptionRequests;

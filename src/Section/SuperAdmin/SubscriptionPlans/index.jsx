import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Plus,
  Search,
  TriangleAlert,
  LayoutGrid,
  List,
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
import { getAdminSubscriptionPlans } from "../../../axios/adminSubscriptionPlans/adminSubscriptionPlans";
import { toast } from "../../../Utils/toast";
import SubscriptionPlansTable from "./SubscriptionPlansTable";
import PlanCardView from "./PlanCardView";
import SubscriptionPlanStatusModal from "./SubscriptionPlanStatusModal";
import DeleteSubscriptionPlanModal from "./DeleteSubscriptionPlanModal";
import Stats from "./Stats";
import {
  SUBSCRIPTION_PLANS_PER_PAGE,
  subscriptionPlanStatusOptions,
  getSubscriptionPlanPaginatedCollection,
  normalizeSubscriptionPlan,
} from "./data";

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const [planRows, setPlanRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedSearch(searchValue);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("card"); // 'card' or 'table'
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusAction, setStatusAction] = useState(null);
  const [deleteAction, setDeleteAction] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    getAdminSubscriptionPlans({
      page: currentPage + 1,
      limit: SUBSCRIPTION_PLANS_PER_PAGE,
      ...(debouncedSearch ? { keywords: debouncedSearch } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    })
      .then((response) => {
        if (!isActive) return;

        const collection = getSubscriptionPlanPaginatedCollection(response);
        setPlanRows(collection.rows.map(normalizeSubscriptionPlan));
        setSummary({
          total: collection.totalItems,
          active: collection.activeCount,
          inactive: collection.inactiveCount,
        });
        setTotalItems(collection.totalItems);
        setTotalPages(collection.totalPages);
        setLoadError("");
      })
      .catch((error) => {
        if (!isActive) return;

        const message = getApiErrorMessage(
          error,
          "Unable to load subscription plans",
        );
        setPlanRows([]);
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
  }, [currentPage, debouncedSearch, statusFilter, refreshKey]);

  const {
    sortedData,
    sortBy,
    sortDirection,
    handleSort,
  } = useSortableTableData(planRows, {
    initialSortBy: "price",
    initialDirection: "asc",
  });

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const handlePageChange = (nextPage) => {
    if (nextPage === currentPage) return;
    setIsLoading(true);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-(--color-aurora-teal)/10 text-(--color-aurora-teal)">
              <CreditCard size={22} />
            </span>
            <div>
              <h1 className="m-0 text-2xl font-black text-(--theme-text-primary)">
                Laundry Subscription Plans
              </h1>
              <p className="m-0 text-sm font-medium text-(--theme-text-secondary)">
                Create & configure laundry plans, RFID scanner limits, staff quotas, and feature flags.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            leftIcon={<Plus size={16} />}
            onClick={() => navigate("/superadmin/plans/create")}
            rounded="10px"
            size="md"
          >
            Create Plan
          </Button>
        </div>
      </section>

      {/* Stats Summary */}
      <Stats
        loading={isLoading && !summary}
        pageCount={planRows.length}
        summary={summary}
      />

      {/* Filters & View Ribbon */}
      <Card>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="w-full sm:w-72">
              <Input
                aria-label="Search subscription plans"
                leftIcon={<Search size={16} />}
                onChange={handleSearchChange}
                placeholder="Search by name, code..."
                value={searchValue}
              />
            </div>

            <div className="w-full sm:w-48">
              <Dropdown
                ariaLabel="Filter by status"
                name="statusFilter"
                onChange={handleStatusFilterChange}
                options={subscriptionPlanStatusOptions}
                value={statusFilter}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="inline-flex rounded-lg border border-(--theme-border-soft) p-0.5 bg-(--theme-surface-soft)">
              <button
                type="button"
                onClick={() => setViewMode("card")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  viewMode === "card"
                    ? "bg-(--theme-surface) text-(--color-aurora-teal) shadow-sm"
                    : "text-(--theme-text-muted) hover:text-(--theme-text-primary)"
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid size={15} />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  viewMode === "table"
                    ? "bg-(--theme-surface) text-(--color-aurora-teal) shadow-sm"
                    : "text-(--theme-text-muted) hover:text-(--theme-text-primary)"
                }`}
                title="Table View"
              >
                <List size={15} />
                <span>Table</span>
              </button>
            </div>

            <Button
              aria-label="Refresh plans"
              leftIcon={<RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />}
              onClick={handleRefresh}
              rounded="8px"
              size="sm"
              variant="outline"
            >
              Refresh
            </Button>
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

      {/* Main Content: Cards or Table */}
      {viewMode === "card" ? (
        <PlanCardView
          data={sortedData}
          loading={isLoading}
          onDeleteAction={(plan) => setDeleteAction(plan)}
          onEditAction={(plan) => navigate(`/superadmin/plans/edit/${plan.id}`)}
          onStatusAction={(action) => setStatusAction(action)}
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <SubscriptionPlansTable
            data={sortedData}
            loading={isLoading}
            onDeleteAction={(plan) => setDeleteAction(plan)}
            onEditAction={(plan) => navigate(`/superadmin/plans/edit/${plan.id}`)}
            onSort={handleSort}
            onStatusAction={(action) => setStatusAction(action)}
            sortBy={sortBy}
            sortDirection={sortDirection}
          />
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          totalRecords={totalItems}
        />
      )}

      {/* Confirmation Modals */}

      <SubscriptionPlanStatusModal
        actionData={statusAction}
        onClose={() => setStatusAction(null)}
        onSaved={() => {
          setStatusAction(null);
          handleRefresh();
        }}
      />

      <DeleteSubscriptionPlanModal
        onClose={() => setDeleteAction(null)}
        onSaved={() => {
          setDeleteAction(null);
          handleRefresh();
        }}
        planItem={deleteAction}
      />
    </div>
  );
};

export default SubscriptionPlans;

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  MapPin,
  RefreshCw,
  Search,
  TriangleAlert,
} from "lucide-react";
import ActionDropdown from "../../../Components/UI/ActionDropdown";
import Alert from "../../../Components/UI/Alert";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import Dropdown from "../../../Components/UI/Dropdown";
import InitialsAvatar from "../../../Components/UI/InitialsAvatar";
import Input from "../../../Components/UI/Input";
import Pagination from "../../../Components/UI/Pagination";
import Table from "../../../Components/UI/Table";
import {
  getSearchQuery,
  useDebouncedSearch,
} from "../../../Hooks/useDebouncedSearch";
import { useSortableTableData } from "../../../Hooks/useSortableTableData";
import { getApiErrorMessage } from "../../../axios/api";
import { getLaundryTenants } from "../../../axios/laundryTenants/laundryTenants";
import { formatDateWithUserPreferences } from "../../../Utils/date";
import { toast } from "../../../Utils/toast";
import {
  businessTypeOptions,
  getLaundryTenantCollection,
  linkedBusinessStatusOptions,
  normalizeLaundryTenant,
  normalizeLaundryTenantCounts,
} from "./data";

const ITEMS_PER_PAGE = 10;

const LinkedBusinessesTable = ({ onSummaryChange, refreshKey = 0 }) => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [localRefreshKey, setLocalRefreshKey] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedSearch(searchValue);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    let isActive = true;

    getLaundryTenants({
      page: currentPage + 1,
      limit: ITEMS_PER_PAGE,
      ...(debouncedSearch ? { keywords: debouncedSearch } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
      ...(typeFilter !== "all" ? { businessType: typeFilter } : {}),
    })
      .then((response) => {
        if (!isActive) return;
        const collection = getLaundryTenantCollection(response, ITEMS_PER_PAGE);

        setBusinesses(collection.rows.map(normalizeLaundryTenant));
        setTotalItems(collection.totalItems);
        setTotalPages(collection.totalPages);
        setLoadError("");
        onSummaryChange?.(normalizeLaundryTenantCounts(collection.counts));
      })
      .catch((error) => {
        if (!isActive) return;
        const message = getApiErrorMessage(
          error,
          "Unable to load linked businesses",
        );
        setBusinesses([]);
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
  }, [
    currentPage,
    debouncedSearch,
    localRefreshKey,
    onSummaryChange,
    refreshKey,
    statusFilter,
    typeFilter,
  ]);

  const { handleSort, sortedData, sortBy, sortDirection } =
    useSortableTableData(businesses);
  const activePage = totalPages > 0 ? Math.min(currentPage, totalPages - 1) : 0;

  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Business",
        render: (_, row) => (
          <div className="flex min-w-0 items-center gap-3">
            <InitialsAvatar initials={row.initials} />
            <div className="min-w-0">
              <p className="m-0 truncate font-black text-(--theme-text-primary)">
                {row.name}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "businessType",
        label: "Type",
      },
      {
        key: "location",
        label: "Location",
        render: (value) => (
          <span className="flex items-center gap-1.5">
            <MapPin size={14} />
            {value}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (_, row) => (
          <Badge size="sm" variant={row.statusVariant}>
            {row.status}
          </Badge>
        ),
      },
      {
        align: "center",
        key: "activeBatches",
        label: "Batches",
      },
      {
        align: "center",
        key: "itemsInLaundry",
        label: "In Laundry",
        render: (value) => (
          <span className="font-black text-(--badge-purple-text)">{value}</span>
        ),
      },
      {
        align: "center",
        key: "sentToBusiness",
        label: "Sent To Business",
        render: (value) => (
          <span className="font-black text-(--color-fresh-mint)">{value}</span>
        ),
      },
      {
        key: "lastActivityAt",
        label: "Last Activity",
        render: (value) => (
          <span className="text-xs font-semibold text-(--theme-text-muted)">
            {value ? formatDateWithUserPreferences(value) : "-"}
          </span>
        ),
      },
      {
        align: "center",
        key: "actions",
        label: "Actions",
        render: (_, row) => (
          <ActionDropdown
            disabled={!row.apiId}
            items={[
              {
                icon: Eye,
                label: "View Details",
                onClick: () =>
                  navigate(`/laundry/linked-businesses/${row.apiId}`),
              },
            ]}
            triggerAriaLabel={`Open actions for ${row.name}`}
            width={220}
          />
        ),
      },
    ],
    [navigate],
  );

  const resetPage = () => setCurrentPage(0);

  const handleSearchChange = (value) => {
    if (getSearchQuery(value) !== debouncedSearch) setIsLoading(true);
    setSearchValue(value);
    resetPage();
  };

  const handleFilterChange = (setter, value) => {
    setIsLoading(true);
    setter(value || "all");
    resetPage();
  };

  return (
    <div className="space-y-4 px-4 py-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_200px_220px]">
        <Input
          leftIcon={<Search size={16} />}
          onChange={handleSearchChange}
          placeholder="Search business name..."
          value={searchValue}
        />
        <Dropdown
          onChange={(value) => handleFilterChange(setStatusFilter, value)}
          options={linkedBusinessStatusOptions}
          value={statusFilter}
        />
        <Dropdown
          onChange={(value) => handleFilterChange(setTypeFilter, value)}
          options={businessTypeOptions}
          value={typeFilter}
        />
      </div>

      {loadError && (
        <Alert leftIcon={<TriangleAlert size={18} />} variant="danger">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{loadError}</span>
            <Button
              leftIcon={<RefreshCw size={15} />}
              onClick={() => {
                setIsLoading(true);
                setLoadError("");
                setLocalRefreshKey((current) => current + 1);
              }}
              size="sm"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </Alert>
      )}

      <Table
        columns={columns}
        data={sortedData}
        emptyText="No linked businesses found"
        loading={isLoading}
        onSort={handleSort}
        rowKey="id"
        sortBy={sortBy}
        sortDirection={sortDirection}
      />
      <Pagination
        forcePage={activePage}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={({ selected }) => {
          setIsLoading(true);
          setCurrentPage(selected);
        }}
        pageCount={totalPages}
        totalItems={totalItems}
      />
    </div>
  );
};

export default LinkedBusinessesTable;

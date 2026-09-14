import { useEffect, useState } from "react";
import { Tag, Plus, Search, TriangleAlert } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Card from "../../../Components/UI/Card";
import Dropdown from "../../../Components/UI/Dropdown";
import Input from "../../../Components/UI/Input";
import Pagination from "../../../Components/UI/Pagination";
import { useDebouncedSearch } from "../../../Hooks/useDebouncedSearch";
import { useSortableTableData } from "../../../Hooks/useSortableTableData";
import { getApiErrorMessage } from "../../../axios/api";
import { getAdminBusinessTypes } from "../../../axios/adminBusinessTypes/adminBusinessTypes";
import { toast } from "../../../Utils/toast";
import AddBusinessTypeModal from "./AddBusinessTypeModal";
import BusinessTypesTable from "./BusinessTypesTable";
import BusinessTypeStatusModal from "./BusinessTypeStatusModal";
import DeleteBusinessTypeModal from "./DeleteBusinessTypeModal";
import Stats from "./Stats";
import {
  BUSINESS_TYPES_PER_PAGE,
  businessTypeStatusOptions,
  getBusinessTypePaginatedCollection,
  normalizeBusinessType,
} from "./data";

const BusinessTypes = () => {
  const [typeRows, setTypeRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedSearch(searchValue);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusAction, setStatusAction] = useState(null);
  const [deleteAction, setDeleteAction] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    getAdminBusinessTypes({
      page: currentPage + 1,
      limit: BUSINESS_TYPES_PER_PAGE,
      ...(debouncedSearch ? { keywords: debouncedSearch } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    })
      .then((response) => {
        if (!isActive) return;

        const collection = getBusinessTypePaginatedCollection(response);
        setTypeRows(collection.rows.map(normalizeBusinessType));
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
          "Unable to load business types",
        );
        setTypeRows([]);
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
  } = useSortableTableData(typeRows, {
    initialSortBy: "name",
    initialDirection: "asc",
  });

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const hasActiveFilters = searchValue || statusFilter !== "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-(--color-aurora-teal)/12 text-(--color-aurora-teal)">
              <Tag size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-(--theme-text-primary) md:text-3xl">
                Business Types
              </h1>
              <p className="m-0 mt-0.5 text-xs text-(--theme-text-muted)">
                Define organization categories available across registration, signup, and reporting
              </p>
            </div>
          </div>
        </div>

        <Button
          leftIcon={<Plus size={16} />}
          onClick={() => setIsAddModalOpen(true)}
          rounded="12px"
          size="sm"
        >
          Add Business Type
        </Button>
      </div>

      {/* Summary Stats */}
      <Stats
        loading={isLoading && !summary}
        pageCount={typeRows.length}
        summary={summary}
      />

      {/* Main Table Card */}
      <Card padding="0" rounded="20px">
        {/* Filters and Controls */}
        <div className="border-b border-(--theme-border) p-4 md:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full lg:max-w-md">
              <Input
                aria-label="Search business types"
                leftIcon={<Search size={16} />}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setCurrentPage(0);
                }}
                placeholder="Search by name, identifier code, or description..."
                value={searchValue}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="w-40">
                <Dropdown
                  aria-label="Filter by status"
                  label=""
                  onChange={(val) => {
                    setIsLoading(true);
                    setStatusFilter(val);
                    setCurrentPage(0);
                  }}
                  options={businessTypeStatusOptions}
                  value={statusFilter}
                />
              </div>

              {hasActiveFilters && (
                <Button
                  onClick={() => {
                    setIsLoading(true);
                    setSearchValue("");
                    setStatusFilter("all");
                    setCurrentPage(0);
                  }}
                  size="sm"
                  variant="outline"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Load Error Alert */}
        {loadError && (
          <div className="p-4 md:p-5">
            <Alert
              action={
                <Button
                  onClick={handleRefresh}
                  size="sm"
                  variant="outline"
                >
                  Retry
                </Button>
              }
              leftIcon={<TriangleAlert size={18} />}
              variant="danger"
            >
              <span className="font-bold">Failed to load business types:</span>{" "}
              {loadError}
            </Alert>
          </div>
        )}

        {/* Table View */}
        <BusinessTypesTable
          data={sortedData}
          loading={isLoading}
          onDeleteAction={(typeItem) => setDeleteAction(typeItem)}
          onSort={handleSort}
          onStatusAction={(action) => setStatusAction(action)}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-(--theme-border) p-4">
            <Pagination
              currentPage={currentPage}
              onPageChange={(page) => {
                setIsLoading(true);
                setCurrentPage(page);
              }}
              totalPages={totalPages}
              totalRecords={totalItems}
            />
          </div>
        )}
      </Card>

      {/* Add Modal */}
      <AddBusinessTypeModal
        onClose={() => setIsAddModalOpen(false)}
        onSaved={() => {
          setIsAddModalOpen(false);
          handleRefresh();
        }}
        open={isAddModalOpen}
      />

      {/* Status Toggle Modal */}
      {statusAction && (
        <BusinessTypeStatusModal
          actionData={statusAction}
          onClose={() => setStatusAction(null)}
          onSaved={() => {
            setStatusAction(null);
            handleRefresh();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteAction && (
        <DeleteBusinessTypeModal
          onClose={() => setDeleteAction(null)}
          onSaved={() => {
            setDeleteAction(null);
            handleRefresh();
          }}
          typeItem={deleteAction}
        />
      )}
    </div>
  );
};

export default BusinessTypes;

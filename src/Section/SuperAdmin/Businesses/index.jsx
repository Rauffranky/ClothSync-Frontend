import { useEffect, useState } from "react";
import { Building2, Plus, Search, TriangleAlert } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Card from "../../../Components/UI/Card";
import Dropdown from "../../../Components/UI/Dropdown";
import Input from "../../../Components/UI/Input";
import Pagination from "../../../Components/UI/Pagination";
import { useDebouncedSearch } from "../../../Hooks/useDebouncedSearch";
import { useSortableTableData } from "../../../Hooks/useSortableTableData";
import { getApiErrorMessage } from "../../../axios/api";
import { getAdminTenants } from "../../../axios/adminTenants/adminTenants";
import { getPublicBusinessTypes } from "../../../axios/adminBusinessTypes/adminBusinessTypes";
import { toast } from "../../../Utils/toast";
import AddBusinessModal from "./AddBusinessModal";
import BusinessesTable from "./BusinessesTable";
import BusinessDetailsModal from "./BusinessDetailsModal";
import BusinessStatusModal from "./BusinessStatusModal";
import Stats from "./Stats";
import {
  BUSINESS_ITEMS_PER_PAGE,
  businessStatusOptions,
  businessTypeOptions,
  getBusinessPaginatedCollection,
  normalizeBusiness,
} from "./data";

const Businesses = () => {
  const [businessRows, setBusinessRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedSearch(searchValue);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [filterTypeOptions, setFilterTypeOptions] = useState(businessTypeOptions);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [statusAction, setStatusAction] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;
    getPublicBusinessTypes()
      .then((res) => {
        if (!isActive) return;
        const list = res?.data?.data || res?.data || [];
        if (Array.isArray(list) && list.length > 0) {
          const dynamicOptions = [
            { label: "All Types", value: "all" },
            ...list.map((item) => ({
              label: item.label || item.name,
              value: item.value || item.code,
            })),
          ];
          setFilterTypeOptions(dynamicOptions);
        }
      })
      .catch(() => {});

    return () => {
      isActive = false;
    };
  }, [refreshKey]);

  useEffect(() => {
    let isActive = true;

    getAdminTenants({
      page: currentPage + 1,
      limit: BUSINESS_ITEMS_PER_PAGE,
      ...(debouncedSearch ? { keywords: debouncedSearch, search: debouncedSearch } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
      ...(typeFilter !== "all" ? { businessType: typeFilter } : {}),
    })
      .then((response) => {
        if (!isActive) return;

        const collection = getBusinessPaginatedCollection(response);
        setBusinessRows(collection.rows.map(normalizeBusiness));
        setSummary(collection.summary);
        setTotalItems(collection.totalItems);
        setTotalPages(collection.totalPages);
        setLoadError("");
      })
      .catch((error) => {
        if (!isActive) return;

        const message = getApiErrorMessage(error, "Unable to load businesses");
        setBusinessRows([]);
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
  }, [currentPage, debouncedSearch, refreshKey, statusFilter, typeFilter]);

  const { handleSort, sortedData, sortBy, sortDirection } =
    useSortableTableData(businessRows);

  const activePage = totalPages > 0 ? Math.min(currentPage, totalPages - 1) : 0;

  const reloadBusinesses = () => {
    setIsLoading(true);
    setRefreshKey((current) => current + 1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-(--color-aurora-teal)/12 text-(--color-aurora-teal)">
              <Building2 size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-(--theme-text-primary) md:text-3xl">
                Businesses
              </h1>
            </div>
          </div>
        </div>

        <Button
          leftIcon={<Plus size={16} />}
          onClick={() => setIsAddModalOpen(true)}
          rounded="12px"
          size="sm"
        >
          Create Business
        </Button>
      </div>

      {/* Summary Stats */}
      <Stats
        loading={isLoading && !summary}
        pageCount={businessRows.length}
        summary={summary}
      />

      {/* Main Table Card */}
      <Card padding="0" rounded="20px">
        {/* Filters and Controls */}
        <div className="border-b border-(--theme-border) p-4 md:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="w-full xl:max-w-md">
              <Input
                aria-label="Search businesses"
                leftIcon={<Search size={16} />}
                onChange={(val) => {
                  const text = typeof val === "string" ? val : val?.target?.value || "";
                  setSearchValue(text);
                  setCurrentPage(0);
                }}
                placeholder="Search by business name, email, phone, location..."
                value={searchValue}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="w-full sm:w-44">
                <Dropdown
                  aria-label="Filter by business type"
                  label=""
                  onChange={(val) => {
                    setIsLoading(true);
                    setTypeFilter(val);
                    setCurrentPage(0);
                  }}
                  options={filterTypeOptions}
                  value={typeFilter}
                />
              </div>

              <div className="w-full sm:w-44">
                <Dropdown
                  aria-label="Filter by status"
                  label=""
                  onChange={(val) => {
                    setIsLoading(true);
                    setStatusFilter(val);
                    setCurrentPage(0);
                  }}
                  options={businessStatusOptions}
                  value={statusFilter}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {loadError && (
          <div className="p-4 md:p-5">
            <Alert
              leftIcon={<TriangleAlert size={18} />}
              rounded="rounded-xl"
              variant="danger"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="m-0 text-sm font-semibold">{loadError}</p>
                <Button onClick={reloadBusinesses} size="xs" variant="outline">
                  Retry
                </Button>
              </div>
            </Alert>
          </div>
        )}

        {/* Table View */}
        <div className="p-4 md:p-5">
          <BusinessesTable
            data={sortedData}
            loading={isLoading}
            onSort={handleSort}
            onStatusAction={setStatusAction}
            onViewDetails={setSelectedBusiness}
            sortBy={sortBy}
            sortDirection={sortDirection}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 border-t border-(--theme-border) pt-4">
              <Pagination
                currentPage={activePage}
                onPageChange={(nextPage) => {
                  setIsLoading(true);
                  setCurrentPage(nextPage);
                }}
                totalItems={totalItems}
                totalPages={totalPages}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Details Modal */}
      {selectedBusiness && (
        <BusinessDetailsModal
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
        />
      )}

      {/* Status Toggle Modal */}
      {statusAction && (
        <BusinessStatusModal
          actionData={statusAction}
          onClose={() => setStatusAction(null)}
          onSaved={() => {
            setStatusAction(null);
            reloadBusinesses();
          }}
        />
      )}

      {/* Add Business Modal */}
      <AddBusinessModal
        onClose={() => setIsAddModalOpen(false)}
        onSaved={() => {
          setIsAddModalOpen(false);
          reloadBusinesses();
        }}
        open={isAddModalOpen}
      />
    </div>
  );
};

export default Businesses;

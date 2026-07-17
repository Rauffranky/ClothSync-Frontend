import { useEffect, useState } from "react";
import { Plus, RefreshCw, Search, TriangleAlert } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Card from "../../../Components/UI/Card";
import Dropdown from "../../../Components/UI/Dropdown";
import Input from "../../../Components/UI/Input";
import Pagination from "../../../Components/UI/Pagination";
import {
  getSearchQuery,
  useDebouncedSearch,
} from "../../../Hooks/useDebouncedSearch";
import { useSortableTableData } from "../../../Hooks/useSortableTableData";
import { getApiErrorMessage } from "../../../axios/api";
import { getTenantStaffRoles } from "../../../axios/staffRoles/tenantStaffRoles";
import {
  getTenantStaff,
  updateTenantStaffStatus,
} from "../../../axios/staff/tenantStaff";
import { toast } from "../../../Utils/toast";
import {
  createStaffRoleOptions,
  getStaffPaginatedCollection,
  normalizeStaffMember,
  normalizeStaffSummary,
  statusOptions,
} from "./data";
import {
  getStaffRolePaginatedCollection,
  normalizeStaffRole,
} from "../StaffRoles/data";
import StaffDetailModal from "./StaffDetailModal";
import StaffFormModal from "./StaffFormModal";
import StaffStats from "./StaffStats";
import StaffStatusModal from "./StaffStatusModal";
import StaffTable from "./StaffTable";

const ITEMS_PER_PAGE = 10;

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [summary, setSummary] = useState(null);
  const [roleOptions, setRoleOptions] = useState([
    { label: "All Roles", value: "all" },
  ]);
  const [activeRoleOptions, setActiveRoleOptions] = useState([
    { label: "All Roles", value: "all" },
  ]);
  const [rolesError, setRolesError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedSearch(searchValue);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [formMode, setFormMode] = useState("add");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [viewingStaff, setViewingStaff] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [statusActionData, setStatusActionData] = useState(null);
  const [isStatusSubmitting, setIsStatusSubmitting] = useState(false);

  useEffect(() => {
    let isActive = true;

    getTenantStaff({
      page: currentPage + 1,
      limit: ITEMS_PER_PAGE,
      ...(debouncedSearch ? { keywords: debouncedSearch } : {}),
      ...(roleFilter !== "all" ? { staffRoleId: roleFilter } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    })
      .then((response) => {
        if (!isActive) return;
        const collection = getStaffPaginatedCollection(
          response,
          currentPage + 1,
          ITEMS_PER_PAGE,
        );
        setStaffList(collection.rows.map(normalizeStaffMember));
        setSummary(normalizeStaffSummary(collection.summary));
        setTotalItems(collection.totalItems);
        setTotalPages(collection.totalPages);
        setLoadError("");
      })
      .catch((error) => {
        if (!isActive) return;
        const message = getApiErrorMessage(
          error,
          "Unable to load staff members",
        );
        setStaffList([]);
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
  }, [currentPage, debouncedSearch, refreshKey, roleFilter, statusFilter]);

  useEffect(() => {
    let isActive = true;

    getTenantStaffRoles({ page: 1, limit: 100 })
      .then((rolesResponse) => {
        if (!isActive) return;
        const roles = getStaffRolePaginatedCollection(
          rolesResponse,
          100,
        ).rows.map(normalizeStaffRole);
        const activeRoles = roles.filter((role) => role.status === "Active");

        setRoleOptions(createStaffRoleOptions(roles));
        setActiveRoleOptions(createStaffRoleOptions(activeRoles));
        setRolesError("");
      })
      .catch((error) => {
        if (!isActive) return;
        const message = getApiErrorMessage(error, "Unable to load staff roles");
        setRoleOptions([{ label: "All Roles", value: "all" }]);
        setActiveRoleOptions([{ label: "All Roles", value: "all" }]);
        setRolesError(message);
        toast.error(message);
      });

    return () => {
      isActive = false;
    };
  }, [refreshKey]);

  const { handleSort, sortedData, sortBy, sortDirection } =
    useSortableTableData(staffList);
  const activePage = totalPages > 0 ? Math.min(currentPage, totalPages - 1) : 0;

  const resetCurrentPage = () => setCurrentPage(0);

  const retryLoad = () => {
    setIsLoading(true);
    setLoadError("");
    setRolesError("");
    setRefreshKey((current) => current + 1);
  };

  const refreshStaff = () => {
    setIsFormModalOpen(false);
    setSelectedStaff(null);
    setIsLoading(true);
    resetCurrentPage();
    setRefreshKey((current) => current + 1);
  };

  const handleSearchChange = (value) => {
    if (getSearchQuery(value) !== debouncedSearch) setIsLoading(true);
    setSearchValue(value);
    resetCurrentPage();
  };

  const handleStatusFilterChange = (value) => {
    setIsLoading(true);
    setStatusFilter(value);
    resetCurrentPage();
  };

  const handleRoleFilterChange = (value) => {
    setIsLoading(true);
    setRoleFilter(value);
    resetCurrentPage();
  };

  const handleTableSort = (nextSortBy, nextSortDirection) => {
    handleSort(nextSortBy, nextSortDirection);
    resetCurrentPage();
  };

  const openAddModal = () => {
    setFormMode("add");
    setSelectedStaff(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (staff) => {
    setFormMode("edit");
    setSelectedStaff(staff);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedStaff(null);
  };

  const handleStatusConfirm = async ({ action, staff }) => {
    const nextStatus = action === "deactivate" ? "inactive" : "active";

    setIsStatusSubmitting(true);
    try {
      const response = await updateTenantStaffStatus(
        staff.apiId || staff.id,
        nextStatus,
      );
      toast.success(
        response?.message ||
          `Staff member ${nextStatus === "active" ? "activated" : "deactivated"} successfully`,
      );
      setStatusActionData(null);
      refreshStaff();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update staff member status"),
      );
    } finally {
      setIsStatusSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <StaffStats loading={isLoading && !summary} summary={summary} />

      {(loadError || rolesError) && (
        <Alert leftIcon={<TriangleAlert size={18} />} variant="danger">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{loadError || rolesError}</span>
            <Button
              leftIcon={<RefreshCw size={15} />}
              onClick={retryLoad}
              size="sm"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </Alert>
      )}

      <Card padding="0" rounded="18px">
        <div className="grid gap-3 border-b border-(--theme-border) px-4 py-4 md:grid-cols-2 lg:grid-cols-[minmax(240px,1fr)_220px_180px_auto]">
          <Input
            leftIcon={<Search size={16} />}
            onChange={handleSearchChange}
            placeholder="Search staff..."
            value={searchValue}
          />
          <Dropdown
            search
            onChange={handleRoleFilterChange}
            options={activeRoleOptions}
            value={roleFilter}
          />
          <Dropdown
            onChange={handleStatusFilterChange}
            options={statusOptions}
            value={statusFilter}
          />
          <Button
            disabled={activeRoleOptions.length <= 1}
            leftIcon={<Plus size={16} />}
            onClick={openAddModal}
          >
            Add Staff
          </Button>
        </div>

        <div className="px-4 py-4">
          <StaffTable
            data={sortedData}
            loading={isLoading}
            onEditStaff={openEditModal}
            onSort={handleTableSort}
            onStatusAction={setStatusActionData}
            onViewStaff={setViewingStaff}
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
      </Card>

      {isFormModalOpen && (
        <StaffFormModal
          mode={formMode}
          onClose={closeFormModal}
          onSaved={refreshStaff}
          open
          roleOptions={formMode === "add" ? activeRoleOptions : roleOptions}
          staff={selectedStaff}
        />
      )}
      {viewingStaff && (
        <StaffDetailModal
          onClose={() => setViewingStaff(null)}
          staff={viewingStaff}
        />
      )}
      {statusActionData && (
        <StaffStatusModal
          actionData={statusActionData}
          isSubmitting={isStatusSubmitting}
          onClose={() => setStatusActionData(null)}
          onConfirm={handleStatusConfirm}
        />
      )}
    </div>
  );
};

export default Staff;

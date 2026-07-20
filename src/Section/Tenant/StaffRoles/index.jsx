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
import { getApiErrorMessage } from "../../../axios/api";
import {
  createTenantStaffRole,
  getTenantAccessSections,
  getTenantStaffRoleDetails,
  getTenantStaffRoles,
  updateTenantStaffRole,
  updateTenantStaffRoleStatus,
} from "../../../axios/staffRoles/tenantStaffRoles";
import { toast } from "../../../Utils/toast";
import {
  accessLevelOptions,
  accessLevelApiValues,
  deriveStaffRoleSummary,
  getStaffRolePaginatedCollection,
  normalizeStaffRole,
  normalizeStaffRoleSummary,
  roleStatusOptions,
} from "./data";
import CreateRoleModal from "./CreateRoleModal";
import RoleStatusModal from "./RoleStatusModal";
import RoleViewModal from "./RoleViewModal";
import StaffRoleStats from "./StaffRoleStats";
import StaffRolesTable from "./StaffRolesTable";

const ITEMS_PER_PAGE = 10;

const StaffRoles = ({
  createStaffRole = createTenantStaffRole,
  getAccessSections = getTenantAccessSections,
  getStaffRoleDetails = getTenantStaffRoleDetails,
  getStaffRoles = getTenantStaffRoles,
  updateStaffRole = updateTenantStaffRole,
  updateStaffRoleStatus = updateTenantStaffRoleStatus,
  permissions = { create: true, edit: true },
}) => {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [summary, setSummary] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedRole, setSelectedRole] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [statusAction, setStatusAction] = useState(null);
  const [isStatusSubmitting, setIsStatusSubmitting] = useState(false);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedSearch(searchValue);
  const [statusFilter, setStatusFilter] = useState("all");
  const [accessFilter, setAccessFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    let isActive = true;

    getStaffRoles({
      page: currentPage + 1,
      limit: ITEMS_PER_PAGE,
      ...(debouncedSearch ? { keywords: debouncedSearch } : {}),
      ...(statusFilter !== "all"
        ? { status: statusFilter.toLowerCase() }
        : {}),
      ...(accessFilter !== "all"
        ? { accessLevel: accessLevelApiValues[accessFilter] }
        : {}),
    })
      .then((response) => {
        if (!isActive) return;
        const collection = getStaffRolePaginatedCollection(
          response,
          ITEMS_PER_PAGE,
          currentPage + 1,
        );
        const normalizedRoles = collection.rows.map(normalizeStaffRole);
        const allNormalizedRoles = collection.allRows.map(normalizeStaffRole);
        const serverSummary = normalizeStaffRoleSummary(collection.summary);
        const hasServerSummary = Object.values(serverSummary).some(
          (value) => value !== null,
        );
        setRoles(normalizedRoles);
        setSummary(
          hasServerSummary
            ? serverSummary
            : deriveStaffRoleSummary(allNormalizedRoles),
        );
        setTotalItems(collection.totalItems);
        setTotalPages(collection.totalPages);
        setLoadError("");
      })
      .catch((error) => {
        if (!isActive) return;
        const message = getApiErrorMessage(error, "Unable to load staff roles");
        setRoles([]);
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
    accessFilter,
    currentPage,
    debouncedSearch,
    getStaffRoles,
    refreshKey,
    statusFilter,
  ]);

  const activePage = totalPages > 0 ? Math.min(currentPage, totalPages - 1) : 0;

  const retryLoad = () => {
    setIsLoading(true);
    setLoadError("");
    setRefreshKey((current) => current + 1);
  };

  const refreshRoleData = () => {
    setIsCreateRoleOpen(false);
    setEditingRole(null);
    setIsLoading(true);
    setCurrentPage(0);
    setRefreshKey((current) => current + 1);
  };

  const handleSearchChange = (value) => {
    if (getSearchQuery(value) !== debouncedSearch) {
      setIsLoading(true);
    }
    setSearchValue(value);
    setCurrentPage(0);
  };

  const handleStatusFilterChange = (value) => {
    setIsLoading(true);
    setStatusFilter(value);
    setCurrentPage(0);
  };

  const handleAccessFilterChange = (value) => {
    setIsLoading(true);
    setAccessFilter(value);
    setCurrentPage(0);
  };

  const handleToggleStatus = (role) => {
    setStatusAction({
      action: role.status === "Active" ? "deactivate" : "activate",
      role,
    });
  };

  const handleStatusConfirm = async (actionData) => {
    const nextStatus =
      actionData.action === "deactivate" ? "inactive" : "active";
    const roleId = actionData.role.apiId || actionData.role.id;

    setIsStatusSubmitting(true);
    try {
      const response = await updateStaffRoleStatus(roleId, nextStatus);
      toast.success(
        response?.message ||
          `Staff role ${nextStatus === "active" ? "activated" : "deactivated"} successfully`,
      );
      setStatusAction(null);
      refreshRoleData();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update staff role status"),
      );
    } finally {
      setIsStatusSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <StaffRoleStats loading={isLoading && !summary} summary={summary} />

      {loadError && (
        <Alert leftIcon={<TriangleAlert size={18} />} variant="danger">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{loadError}</span>
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
        <div className="grid gap-3 border-b border-(--theme-border) px-4 py-4 md:grid-cols-[minmax(260px,1fr)_200px_220px_auto]">
          <Input
            leftIcon={<Search size={16} />}
            onChange={handleSearchChange}
            placeholder="Search staff roles..."
            value={searchValue}
          />
          <Dropdown
            onChange={handleStatusFilterChange}
            options={roleStatusOptions}
            value={statusFilter}
          />
          <Dropdown
            onChange={handleAccessFilterChange}
            options={accessLevelOptions}
            value={accessFilter}
          />
          {permissions.create && (
            <Button
              className="w-full md:w-auto"
              leftIcon={<Plus size={17} />}
              onClick={() => setIsCreateRoleOpen(true)}
            >
              Create Role
            </Button>
          )}
        </div>

        <div className="px-4 py-4">
          <StaffRolesTable
            loading={isLoading}
            onEdit={setEditingRole}
            onToggleStatus={handleToggleStatus}
            onView={setSelectedRole}
            canEdit={permissions.edit}
            roles={roles}
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

      {selectedRole && (
        <RoleViewModal
          getStaffRoleDetails={getStaffRoleDetails}
          onClose={() => setSelectedRole(null)}
          role={selectedRole}
        />
      )}
      {isCreateRoleOpen && permissions.create && (
        <CreateRoleModal
          createStaffRole={createStaffRole}
          getAccessSections={getAccessSections}
          getStaffRoleDetails={getStaffRoleDetails}
          onClose={() => setIsCreateRoleOpen(false)}
          onSaved={refreshRoleData}
          open
          updateStaffRole={updateStaffRole}
        />
      )}
      {editingRole && permissions.edit && (
        <CreateRoleModal
          createStaffRole={createStaffRole}
          getAccessSections={getAccessSections}
          getStaffRoleDetails={getStaffRoleDetails}
          onClose={() => setEditingRole(null)}
          onSaved={refreshRoleData}
          open
          role={editingRole}
          updateStaffRole={updateStaffRole}
        />
      )}
      {statusAction && permissions.edit && (
        <RoleStatusModal
          actionData={statusAction}
          isSubmitting={isStatusSubmitting}
          onClose={() => setStatusAction(null)}
          onConfirm={handleStatusConfirm}
        />
      )}
    </div>
  );
};

export default StaffRoles;

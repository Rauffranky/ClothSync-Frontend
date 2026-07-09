import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Button from "../../../Components/UI/Button";
import Card from "../../../Components/UI/Card";
import Dropdown from "../../../Components/UI/Dropdown";
import Input from "../../../Components/UI/Input";
import Pagination from "../../../Components/UI/Pagination";
import { useSortableTableData } from "../../../Hooks/useSortableTableData";
import {
  permissionOptions,
  roleOptions,
  staffMembers,
  statusOptions,
} from "./data";
import StaffStats from "./StaffStats";
import StaffFormModal from "./StaffFormModal";
import StaffStatusModal from "./StaffStatusModal";
import StaffTable from "./StaffTable";

const ITEMS_PER_PAGE = 5;
const avatarVariants = ["info", "purple", "success", "warning", "danger"];

const getInitials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const getPermissionForRole = (role, fallback = "Limited Access") => {
  if (role === "Admin") return "Admin";
  if (role === "Operations Manager" || role === "Category Manager") {
    return "Full Access";
  }

  return fallback;
};

const getPermissionVariant = (permission) => {
  if (permission === "Admin") return "purple";
  if (permission === "Full Access") return "info";
  return "neutral";
};

const getStatusVariant = (status) => {
  if (status === "Active") return "success";
  if (status === "Pending Invite") return "warning";
  return "neutral";
};

const Staff = () => {
  const [staffList, setStaffList] = useState(staffMembers);
  const [searchValue, setSearchValue] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [permissionFilter, setPermissionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [formMode, setFormMode] = useState("add");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [statusActionData, setStatusActionData] = useState(null);

  const filteredStaff = useMemo(() => {
    const search = searchValue.trim().toLowerCase();

    return staffList.filter((staff) => {
      const matchesSearch =
        !search ||
        [
          staff.name,
          staff.email,
          staff.phone,
          staff.role,
          staff.location,
          staff.permission,
          staff.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search);
      const matchesRole = roleFilter === "all" || staff.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || staff.status === statusFilter;
      const matchesPermission =
        permissionFilter === "all" || staff.permission === permissionFilter;

      return matchesSearch && matchesRole && matchesStatus && matchesPermission;
    });
  }, [permissionFilter, roleFilter, searchValue, staffList, statusFilter]);

  const { handleSort, sortedData, sortBy, sortDirection } =
    useSortableTableData(filteredStaff);
  const pageCount = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const activePage = pageCount > 0 ? Math.min(currentPage, pageCount - 1) : 0;
  const paginatedStaff = useMemo(() => {
    const startIndex = activePage * ITEMS_PER_PAGE;
    return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [activePage, sortedData]);

  const resetCurrentPage = () => setCurrentPage(0);

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

  const handleSaveStaff = (staffData) => {
    const permission = getPermissionForRole(
      staffData.role,
      staffData.permission ?? "Limited Access",
    );

    if (formMode === "edit") {
      setStaffList((current) =>
        current.map((staff) =>
          staff.id === staffData.id
            ? {
                ...staff,
                ...staffData,
                initials: getInitials(staffData.name),
                permission,
                permissionVariant: getPermissionVariant(permission),
              }
            : staff,
        ),
      );
      return;
    }

    setStaffList((current) => {
      const status = staffData.sendInvite ? "Pending Invite" : "Active";
      const nextStaff = {
        ...staffData,
        id: `STF-${String(current.length + 1).padStart(3, "0")}`,
        initials: getInitials(staffData.name),
        permission,
        permissionVariant: getPermissionVariant(permission),
        status,
        statusVariant: getStatusVariant(status),
        lastActive: staffData.sendInvite ? "Never" : "Just now",
        avatarVariant: avatarVariants[current.length % avatarVariants.length],
      };

      return [nextStaff, ...current];
    });
    resetCurrentPage();
  };

  const handleStatusConfirm = ({ action, staff }) => {
    const nextStatus = action === "deactivate" ? "Inactive" : "Active";

    setStaffList((current) =>
      current.map((item) =>
        item.id === staff.id
          ? {
              ...item,
              status: nextStatus,
              statusVariant: getStatusVariant(nextStatus),
              lastActive: nextStatus === "Active" ? "Just now" : item.lastActive,
            }
          : item,
      ),
    );
  };

  return (
    <div className="space-y-5">
      <StaffStats data={staffList} />

      <Card padding="0" rounded="18px">
        <div className="grid gap-2 border-b border-(--theme-border) px-4 py-4 lg:grid-cols-[minmax(220px,1fr)_180px_160px_180px_120px] xl:grid-cols-[minmax(220px,1fr)_200px_180px_200px_140px]">
          <Input
            leftIcon={<Search size={16} />}
            onChange={(value) => {
              setSearchValue(value);
              resetCurrentPage();
            }}
            placeholder="Search staff..."
            value={searchValue}
          />
          <Dropdown
            onChange={(value) => {
              setRoleFilter(value);
              resetCurrentPage();
            }}
            options={roleOptions}
            value={roleFilter}
          />
          <Dropdown
            onChange={(value) => {
              setStatusFilter(value);
              resetCurrentPage();
            }}
            options={statusOptions}
            value={statusFilter}
          />
          <Dropdown
            onChange={(value) => {
              setPermissionFilter(value);
              resetCurrentPage();
            }}
            options={permissionOptions}
            value={permissionFilter}
          />
          <Button onClick={openAddModal} size="lg">
            Add Staff
          </Button>
        </div>

        <div className="px-4 py-4">
          <StaffTable
            data={paginatedStaff}
            onEditStaff={openEditModal}
            onSort={handleTableSort}
            onStatusAction={setStatusActionData}
            sortBy={sortBy}
            sortDirection={sortDirection}
          />
          <Pagination
            forcePage={activePage}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={({ selected }) => setCurrentPage(selected)}
            pageCount={pageCount}
            totalItems={sortedData.length}
          />
        </div>
      </Card>

      <StaffFormModal
        mode={formMode}
        onClose={closeFormModal}
        onSubmit={handleSaveStaff}
        open={isFormModalOpen}
        staff={selectedStaff}
      />
      <StaffStatusModal
        actionData={statusActionData}
        isOpen={Boolean(statusActionData)}
        onClose={() => setStatusActionData(null)}
        onConfirm={handleStatusConfirm}
      />
    </div>
  );
};

export default Staff;

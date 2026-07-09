import { Edit3, MapPin, MoreHorizontal, Power, UserRound } from "lucide-react";
import ActionDropdown from "../../../Components/UI/ActionDropdown";
import Badge from "../../../Components/UI/Badge";
import InitialsAvatar from "../../../Components/UI/InitialsAvatar";
import Table from "../../../Components/UI/Table";

const StaffTable = ({
  data = [],
  onEditStaff,
  onSort,
  onStatusAction,
  sortBy,
  sortDirection,
}) => {
  const columns = [
    {
      key: "name",
      label: "Staff Name",
      sortable: true,
      render: (_, row) => (
        <div className="flex min-w-0 items-center gap-3">
          <InitialsAvatar initials={row.initials} variant={row.avatarVariant} />
          <span className="truncate text-sm font-bold text-(--theme-text-primary)">
            {row.name}
          </span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (value) => (
        <span className="font-mono text-xs font-semibold text-(--theme-text-muted)">
          {value}
        </span>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      sortable: true,
      render: (value) => (
        <span className="font-mono text-xs font-semibold text-(--theme-text-muted)">
          {value}
        </span>
      ),
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (value) => (
        <span className="text-sm font-semibold text-(--theme-text-primary)">
          {value}
        </span>
      ),
    },
    {
      key: "location",
      label: "Location",
      sortable: true,
      render: (value) => (
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--theme-text-muted)">
          <MapPin size={13} />
          {value}
        </span>
      ),
    },
    {
      key: "permission",
      label: "Permission",
      sortable: true,
      align: "center",
      render: (_, row) => (
        <Badge size="sm" variant={row.permissionVariant}>
          {row.permission}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      align: "center",
      render: (_, row) => (
        <Badge  size="sm" variant={row.statusVariant}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "lastActive",
      label: "Last Active",
      sortable: true,
      align: "center",
      render: (value) => (
        <span className="font-mono text-xs font-semibold text-(--theme-text-muted)">
          {value}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (_, row) => (
        <ActionDropdown
          align="right"
          triggerIcon={<MoreHorizontal size={16} />}
          items={[
            { icon: UserRound, label: "View Profile" },
            {
              icon: Edit3,
              label: "Edit Staff",
              onClick: () => onEditStaff?.(row),
            },
            {
              icon: Power,
              label: row.status === "Active" ? "Deactivate" : "Activate",
              danger: row.status === "Active",
              onClick: () =>
                onStatusAction?.({
                  action: row.status === "Active" ? "deactivate" : "activate",
                  staff: row,
                }),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      emptyText="No staff members found"
      onSort={onSort}
      rowKey="id"
      sortBy={sortBy}
      sortDirection={sortDirection}
    />
  );
};

export default StaffTable;

import {
  Eye,
  MoreHorizontal,
  Pencil,
  Power,
  UsersRound,
} from "lucide-react";
import ActionDropdown from "../../../Components/UI/ActionDropdown";
import Badge from "../../../Components/UI/Badge";
import Table from "../../../Components/UI/Table";
import { formatDateWithUserPreferences } from "../../../Utils/date";

const StaffRolesTable = ({
  loading = false,
  onEdit,
  onToggleStatus,
  onView,
  roles = [],
}) => {
  const columns = [
    {
      key: "name",
      label: "Role Name",
      render: (value) => (
        <span className="font-bold text-(--theme-text-primary)">{value}</span>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (value) => (
        <span className="block max-w-72 truncate text-sm font-semibold text-(--theme-text-muted)">
          {value}
        </span>
      ),
    },
    {
      key: "staffMembersCount",
      label: "Staff",
      align: "center",
      render: (value) => (
        <Badge leftIcon={<UsersRound size={13} />} size="sm" variant="neutral">
          {value}
        </Badge>
      ),
    },
    {
      key: "accessLevel",
      label: "Access Level",
      render: (_, row) => (
        <Badge size="sm" variant={row.accessVariant}>
          {row.accessLevel}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_, row) => (
        <Badge dot size="sm" variant={row.statusVariant}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "lastUpdated",
      label: "Last Updated",
      render: (value) => (
        <span className="font-mono text-xs font-semibold text-(--theme-text-muted)">
          {formatDateWithUserPreferences(value)}
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
          items={[
            {
              icon: Eye,
              label: "View Role",
              onClick: () => onView?.(row),
            },
            {
              disabled: !onEdit,
              icon: Pencil,
              label: "Edit Role",
              onClick: () => onEdit?.(row),
            },
            {
              disabled: !onToggleStatus,
              danger: row.status === "Active",
              icon: Power,
              label: row.status === "Active" ? "Deactivate" : "Activate",
              onClick: () => onToggleStatus?.(row),
            },
           
          ]}
          triggerAriaLabel={`Open actions for ${row.name}`}
          triggerIcon={<MoreHorizontal size={16} />}
        />
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={roles}
      emptyText="No staff roles found"
      loading={loading}
      rowKey="id"
    />
  );
};

export default StaffRolesTable;

import { useNavigate } from "react-router-dom";
import { CircleCheck, CircleX, Eye, Pencil, Tag } from "lucide-react";
import ActionDropdown from "../../../Components/UI/ActionDropdown";
import Badge from "../../../Components/UI/Badge";
import Table from "../../../Components/UI/Table";

const CategoriesTable = ({
  data = [],
  onSort,
  onEditCategory,
  onStatusAction,
  loading = false,
  sortBy,
  sortDirection,
}) => {
  const navigate = useNavigate();

  const columns = [
    {
      key: "name",
      label: "Category Name",
      sortable: true,
      render: (_, row) => (
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
            style={{
              color:
                row.status === "Active" ? "#2563eb" : "var(--theme-text-muted)",
              background:
                row.status === "Active"
                  ? "rgba(37, 99, 235, 0.1)"
                  : "rgba(148, 163, 184, 0.12)",
            }}
          >
            <Tag size={17} />
          </span>
          <div className="min-w-0">
            <p className="m-0 truncate font-bold text-(--theme-text-primary)">
              {row.name}
            </p>
            <p className="m-0 mt-0.5 text-xs text-(--theme-text-muted)">
              {row.categoryCode}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      sortable: true,
      render: (_, row) => (
        <Badge
          leftIcon={
            row.status === "Active" ? (
              <CircleCheck size={12} />
            ) : (
              <CircleX size={12} />
            )
          }
          size="sm"
          variant={row.statusVariant}
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: "totalMappedAssets",
      label: "Assets",
      align: "center",
      sortable: true,
      render: (_, row) => (
        <span className="text-sm font-bold text-(--theme-text-secondary)">
          {row.assets}
        </span>
      ),
    },
    {
      key: "usage",
      label: "Usage",
      align: "center",
      sortable: true,
      render: (_, row) => (
        <Badge
          size="sm"
          variant={row.usageState === "used" ? "info" : "neutral"}
        >
          {row.usage}
        </Badge>
      ),
    },
    {
      key: "created",
      label: "Created",
      sortable: true,
      render: (value) => (
        <span className="text-sm font-bold text-(--theme-text-secondary)">
          {value}
        </span>
      ),
    },
    {
      key: "lastUpdated",
      label: "Last Updated",
      sortable: true,
      render: (value) => (
        <span className="text-sm font-bold text-(--theme-text-secondary)">
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
          items={[
            {
              label: "View Details",
              icon: Eye,
              onClick: () =>
                navigate(`/business/categories/${row.apiId || row.id}`),
            },
            {
              label: "Edit Category",
              icon: Pencil,
              onClick: () => onEditCategory?.(row),
            },
            {
              label: row.status === "Active" ? "Set Inactive" : "Set Active",
              icon: row.status === "Active" ? CircleX : CircleCheck,
              danger: row.status === "Active",
              onClick: () =>
                onStatusAction?.({
                  action: row.status === "Active" ? "inactive" : "active",
                  category: row,
                }),
            },
          ]}
          width={210}
        />
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      emptyText="No categories found"
      loading={loading}
      onSort={onSort}
      rowKey="id"
      sortBy={sortBy}
      sortDirection={sortDirection}
    />
  );
};

export default CategoriesTable;

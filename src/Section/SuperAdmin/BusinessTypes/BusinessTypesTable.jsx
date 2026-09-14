import {
  Tag,
  CircleCheck,
  CircleX,
  Trash2,
} from "lucide-react";
import ActionDropdown from "../../../Components/UI/ActionDropdown";
import Badge from "../../../Components/UI/Badge";
import Table from "../../../Components/UI/Table";

const BusinessTypesTable = ({
  data = [],
  onSort,
  onStatusAction,
  onDeleteAction,
  loading = false,
  sortBy,
  sortDirection,
}) => {
  const columns = [
    {
      key: "name",
      label: "Type Name",
      sortable: true,
      render: (_, row) => (
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
            style={{
              color:
                row.status === "Active"
                  ? "var(--color-aurora-teal)"
                  : "var(--theme-text-muted)",
              background:
                row.status === "Active"
                  ? "rgba(20, 184, 166, 0.12)"
                  : "rgba(148, 163, 184, 0.12)",
            }}
          >
            <Tag size={18} />
          </span>
          <div className="min-w-0">
            <p className="m-0 truncate font-bold text-(--theme-text-primary)">
              {row.name}
            </p>
            <p className="m-0 mt-0.5 text-xs text-(--theme-text-muted)">
              Identifier: <code className="font-mono text-xs">{row.code}</code>
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      sortable: true,
      render: (value) => (
        <span className="text-xs font-medium text-(--theme-text-secondary)">
          {value || "—"}
        </span>
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
      key: "created",
      label: "Created",
      sortable: true,
      render: (value) => (
        <span className="text-xs font-semibold text-(--theme-text-muted)">
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
              label: row.status === "Active" ? "Deactivate" : "Activate",
              icon: row.status === "Active" ? CircleX : CircleCheck,
              danger: row.status === "Active",
              onClick: () =>
                onStatusAction?.({
                  action: row.status === "Active" ? "inactive" : "active",
                  typeItem: row,
                }),
            },
            {
              label: "Delete",
              icon: Trash2,
              danger: true,
              onClick: () => onDeleteAction?.(row),
            },
          ]}
          width={160}
        />
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      emptyText="No business types found"
      loading={loading}
      onSort={onSort}
      rowKey="id"
      sortBy={sortBy}
      sortDirection={sortDirection}
    />
  );
};

export default BusinessTypesTable;

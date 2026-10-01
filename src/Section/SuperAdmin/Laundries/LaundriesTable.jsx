import {
  CircleCheck,
  CircleX,
  ExternalLink,
  Eye,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  TowelRack,
} from "lucide-react";
import ActionDropdown from "../../../Components/UI/ActionDropdown";
import Badge from "../../../Components/UI/Badge";
import Table from "../../../Components/UI/Table";

const LaundriesTable = ({
  data = [],
  onSort,
  onViewDetails,
  onStatusAction,
  onAccessPortal,
  accessingId = null,
  loading = false,
  sortBy,
  sortDirection,
}) => {
  const columns = [
    {
      key: "companyName",
      label: "Laundry / Contact",
      sortable: true,
      render: (_, row) => (
        <div className="flex min-w-0 max-w-55 items-center gap-3">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
            style={{
              color:
                row.rawStatus === "active"
                  ? "var(--color-aurora-teal)"
                  : "var(--theme-text-muted)",
              background:
                row.rawStatus === "active"
                  ? "rgba(20, 184, 166, 0.12)"
                  : "rgba(148, 163, 184, 0.12)",
            }}
          >
            <TowelRack size={19} />
          </span>
          <div className="min-w-0">
            <p className="m-0 truncate font-bold text-(--theme-text-primary)">
              {row.companyName}
            </p>
            <p className="m-0 mt-0.5 truncate text-xs text-(--theme-text-muted)">
              Contact: {row.contactName}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Contact Info",
      sortable: true,
      render: (_, row) => (
        <div className="max-w-52.5 space-y-1 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-(--theme-text-primary)">
            <Mail size={13} className="shrink-0 text-(--color-aurora-teal)" />
            <span className="truncate" title={row.email}>
              {row.email}
            </span>
          </div>
          {row.phone && row.phone !== "—" && (
            <div className="flex items-center gap-1.5 text-(--theme-text-muted)">
              <Phone size={13} className="shrink-0" />
              <span className="truncate">{row.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "location",
      label: "Location",
      sortable: true,
      render: (value) => (
        <div
          className="flex max-w-50 items-center gap-1.5 text-xs font-medium text-(--theme-text-secondary)"
          title={value || ""}
        >
          <MapPin size={13} className="shrink-0 text-(--theme-text-muted)" />
          <span className="truncate">{value || "—"}</span>
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
            row.rawStatus === "active" ? (
              <CircleCheck size={12} />
            ) : row.rawStatus === "suspend" || row.rawStatus === "suspended" ? (
              <ShieldAlert size={12} />
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
      label: "Registered",
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
      render: (_, row) => {
        const isActive = row.rawStatus === "active";
        return (
          <ActionDropdown
            align="right"
            items={[
              {
                label: accessingId === row.id ? "Accessing..." : "Access Portal",
                icon: ExternalLink,
                disabled: Boolean(accessingId),
                onClick: () => onAccessPortal?.(row),
              },
              {
                label: "View Details",
                icon: Eye,
                onClick: () => onViewDetails?.(row),
              },
              {
                label: isActive ? "Deactivate" : "Activate",
                icon: isActive ? CircleX : CircleCheck,
                danger: isActive,
                onClick: () =>
                  onStatusAction?.({
                    action: isActive ? "inactive" : "active",
                    laundry: row,
                  }),
              },
              ...(row.rawStatus !== "suspend" && row.rawStatus !== "suspended"
                ? [
                    {
                      label: "Suspend Partner",
                      icon: ShieldAlert,
                      danger: true,
                      onClick: () =>
                        onStatusAction?.({
                          action: "suspend",
                          laundry: row,
                        }),
                    },
                  ]
                : []),
            ]}
            width={180}
          />
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      emptyText="No laundries found"
      loading={loading}
      onSort={onSort}
      rowKey="id"
      sortBy={sortBy}
      sortDirection={sortDirection}
    />
  );
};

export default LaundriesTable;

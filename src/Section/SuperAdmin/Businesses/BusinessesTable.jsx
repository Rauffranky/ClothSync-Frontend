import {
  Building2,
  CircleCheck,
  CircleX,
  Clock,
  Eye,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import ActionDropdown from "../../../Components/UI/ActionDropdown";
import Badge from "../../../Components/UI/Badge";
import Table from "../../../Components/UI/Table";

const BusinessesTable = ({
  data = [],
  onSort,
  onViewDetails,
  onStatusAction,
  loading = false,
  sortBy,
  sortDirection,
}) => {
  const columns = [
    {
      key: "businessName",
      label: "Business / Owner",
      sortable: true,
      render: (_, row) => (
        <div className="flex min-w-0 max-w-55 items-center gap-3">
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
            <Building2 size={19} />
          </span>
          <div className="min-w-0">
            <p className="m-0 truncate font-bold text-(--theme-text-primary)">
              {row.businessName}
            </p>
            <p className="m-0 mt-0.5 truncate text-xs text-(--theme-text-muted)">
              Owner: {row.contactName}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Contact",
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
      key: "businessType",
      label: "Type",
      align: "center",
      sortable: true,
      render: (value) => (
        <Badge size="sm" variant="info">
          {value || "General"}
        </Badge>
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
      key: "isVerified",
      label: "Verification",
      align: "center",
      sortable: true,
      render: (_, row) => (
        <Badge
          leftIcon={
            row.isVerified ? (
              <ShieldCheck size={12} />
            ) : (
              <ShieldAlert size={12} />
            )
          }
          size="sm"
          variant={row.isVerified ? "success" : "warning"}
        >
          {row.isVerified ? "Verified" : "Unverified"}
        </Badge>
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
            ) : row.status === "Unverified" ? (
              <Clock size={12} />
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
        const isVerified = row.isVerified;
        return (
          <ActionDropdown
            align="right"
            items={[
              {
                label: "View Details",
                icon: Eye,
                onClick: () => onViewDetails?.(row),
              },
              {
                label: row.status === "Active" ? "Deactivate" : "Activate",
                icon: row.status === "Active" ? CircleX : CircleCheck,
                danger: row.status === "Active",
                disabled: !isVerified && row.status !== "Active",
                tooltip: !isVerified ? "Cannot activate unverified business" : undefined,
                onClick: () =>
                  onStatusAction?.({
                    action: row.status === "Active" ? "inactive" : "active",
                    business: row,
                  }),
              },
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
      emptyText="No businesses found"
      loading={loading}
      onSort={onSort}
      rowKey="id"
      sortBy={sortBy}
      sortDirection={sortDirection}
    />
  );
};

export default BusinessesTable;

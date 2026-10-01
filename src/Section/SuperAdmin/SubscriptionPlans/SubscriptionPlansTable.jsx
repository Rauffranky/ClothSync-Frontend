import {
  CircleCheck,
  CircleX,
  CreditCard,
  Edit2,
  Trash2,
  Infinity as InfinityIcon,
  Building2,
  ScanLine,
  Users,
  ShieldAlert,
} from "lucide-react";
import ActionDropdown from "../../../Components/UI/ActionDropdown";
import Badge from "../../../Components/UI/Badge";
import Table from "../../../Components/UI/Table";
import { formatQuota } from "./data";

const QuotaBadge = ({ icon: Icon, label, value }) => {
  const isUnlimited = value === null || value === undefined || value === -1;
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-(--theme-text-muted)">
        <Icon size={13} />
      </span>
      <span className="text-(--theme-text-secondary)">{label}:</span>
      {isUnlimited ? (
        <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 text-[11px] font-bold text-(--color-aurora-teal) bg-(--color-aurora-teal)/10">
          <InfinityIcon size={12} /> Unlimited
        </span>
      ) : (
        <span className="font-bold text-(--theme-text-primary)">
          {formatQuota(value)}
        </span>
      )}
    </div>
  );
};

const SubscriptionPlansTable = ({
  data = [],
  onSort,
  onEditAction,
  onStatusAction,
  onDeleteAction,
  loading = false,
  sortBy,
  sortDirection,
}) => {
  const columns = [
    {
      key: "name",
      label: "Plan Tier",
      sortable: true,
      render: (_, row) => (
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
              row.status === "Active"
                ? "bg-(--color-aurora-teal)/10 text-(--color-aurora-teal)"
                : "bg-(--theme-surface-strong) text-(--theme-text-muted)"
            }`}
          >
            <CreditCard size={18} />
          </span>
          <div className="min-w-0">
            <p className="m-0 truncate font-bold text-(--theme-text-primary)">
              {row.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-(--theme-surface-strong) text-(--theme-text-muted)">
                {row.code}
              </span>
            </div>
            {row.description && row.description !== "—" && (
              <p className="m-0 mt-1 max-w-xs truncate text-xs text-(--theme-text-muted)">
                {row.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "price",
      label: "Price / Cycle",
      sortable: true,
      render: (_, row) => (
        <div>
          <span className="text-sm font-extrabold text-(--theme-text-primary)">
            {row.formattedPrice}
          </span>
          <span className="text-xs text-(--theme-text-muted) block capitalize">
            / {row.formattedBillingCycle}
          </span>
        </div>
      ),
    },
    {
      key: "quotas",
      label: "Resource Quotas",
      render: (_, row) => (
        <div className="space-y-1 py-1">
          <QuotaBadge
            icon={Building2}
            label="Linked Laundries"
            value={row.maxLinkedBusinesses}
          />
          <QuotaBadge
            icon={ScanLine}
            label="Scanners"
            value={row.maxScanners}
          />
          <QuotaBadge icon={Users} label="Staff" value={row.maxStaff} />
          <QuotaBadge
            icon={ShieldAlert}
            label="Roles"
            value={row.maxStaffRoles}
          />
        </div>
      ),
    },
    {
      key: "features",
      label: "Features Included",
      render: (_, row) => (
        <div className="flex flex-wrap items-center gap-1.5 max-w-64">
          <Badge
            size="sm"
            variant={row.allowBulkScan ? "success" : "neutral"}
            leftIcon={
              row.allowBulkScan ? (
                <CircleCheck size={11} />
              ) : (
                <CircleX size={11} />
              )
            }
            className={!row.allowBulkScan ? "opacity-60 line-through" : ""}
          >
            Bulk Scan
          </Badge>
          <Badge
            size="sm"
            variant={row.allowBatchDispatch ? "success" : "neutral"}
            leftIcon={
              row.allowBatchDispatch ? (
                <CircleCheck size={11} />
              ) : (
                <CircleX size={11} />
              )
            }
            className={!row.allowBatchDispatch ? "opacity-60 line-through" : ""}
          >
            Batch Dispatch
          </Badge>
          <Badge
            size="sm"
            variant={row.allowReports ? "success" : "neutral"}
            leftIcon={
              row.allowReports ? (
                <CircleCheck size={11} />
              ) : (
                <CircleX size={11} />
              )
            }
            className={!row.allowReports ? "opacity-60 line-through" : ""}
          >
            Analytics
          </Badge>
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
      key: "actions",
      label: "Actions",
      align: "center",
      render: (_, row) => (
        <ActionDropdown
          align="right"
          items={[
            {
              label: "Edit Plan",
              icon: Edit2,
              onClick: () => onEditAction?.(row),
            },
            {
              label: row.status === "Active" ? "Deactivate" : "Activate",
              icon: row.status === "Active" ? CircleX : CircleCheck,
              danger: row.status === "Active",
              onClick: () =>
                onStatusAction?.({
                  action: row.status === "Active" ? "inactive" : "active",
                  planItem: row,
                }),
            },
            {
              label: "Delete Plan",
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
      emptyText="No subscription plans found"
      loading={loading}
      onSort={onSort}
      rowKey="id"
      sortBy={sortBy}
      sortDirection={sortDirection}
    />
  );
};

export default SubscriptionPlansTable;

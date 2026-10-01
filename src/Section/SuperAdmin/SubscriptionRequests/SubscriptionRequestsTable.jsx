import {
  CircleCheck,
  CircleX,
  Clock,
  Building2,
  TowelRack,
  MessageSquare,
} from "lucide-react";
import ActionDropdown from "../../../Components/UI/ActionDropdown";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import Table from "../../../Components/UI/Table";

const SubscriptionRequestsTable = ({
  data = [],
  onApproveAction,
  onRejectAction,
  loading = false,
  onSort,
  sortBy,
  sortDirection,
}) => {
  const columns = [
    {
      key: "orgName",
      label: "Organization",
      sortable: true,
      render: (_, row) => (
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
              row.targetType === "laundry"
                ? "bg-(--color-aurora-teal)/10 text-(--color-aurora-teal)"
                : "bg-(--color-sky-blue)/10 text-(--color-sky-blue)"
            }`}
          >
            {row.targetType === "laundry" ? (
              <TowelRack size={18} />
            ) : (
              <Building2 size={18} />
            )}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="m-0 truncate font-bold text-(--theme-text-primary)">
                {row.orgName}
              </p>
              <span className="rounded px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider bg-(--theme-surface-strong) text-(--theme-text-muted)">
                {row.targetTypeLabel}
              </span>
            </div>
            <p className="m-0 mt-0.5 text-xs text-(--theme-text-muted)">
              {row.orgEmail}
            </p>
            {row.notes && (
              <p className="m-0 mt-1 flex items-center gap-1 text-[11px] text-(--theme-text-secondary) italic">
                <MessageSquare size={11} className="shrink-0" /> Note: "
                {row.notes}"
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "planName",
      label: "Requested Tier",
      sortable: true,
      render: (_, row) => (
        <div>
          <span className="text-sm font-bold text-(--theme-text-primary)">
            {row.planName}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-semibold text-(--theme-text-muted)">
              {row.formattedPrice} / {row.billingCycle}
            </span>
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
            row.rawStatus === "active" ? (
              <CircleCheck size={12} />
            ) : row.rawStatus === "rejected" ? (
              <CircleX size={12} />
            ) : (
              <Clock size={12} />
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
      label: "Submitted Date",
      sortable: true,
      render: (value) => (
        <span className="text-xs font-semibold text-(--theme-text-muted)">
          {value}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Decision",
      align: "center",
      render: (_, row) => {
        if (row.rawStatus === "pending") {
          return (
            <div className="flex items-center justify-center gap-1.5">
              <Button
                leftIcon={<CircleCheck size={14} />}
                onClick={() => onApproveAction?.(row)}
                rounded="8px"
                size="xs"
                variant="success"
              >
                Approve
              </Button>
              <Button
                leftIcon={<CircleX size={14} />}
                onClick={() => onRejectAction?.(row)}
                rounded="8px"
                size="xs"
                variant="danger"
              >
                Reject
              </Button>
            </div>
          );
        }

        return (
          <ActionDropdown
            align="right"
            items={[
              {
                label: "Re-Approve / Renew",
                icon: CircleCheck,
                onClick: () => onApproveAction?.(row),
              },
              {
                label: "Decline / Revoke",
                icon: CircleX,
                danger: true,
                onClick: () => onRejectAction?.(row),
              },
            ]}
            width={170}
          />
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      emptyText="No subscription requests found"
      loading={loading}
      onSort={onSort}
      rowKey="id"
      sortBy={sortBy}
      sortDirection={sortDirection}
    />
  );
};

export default SubscriptionRequestsTable;

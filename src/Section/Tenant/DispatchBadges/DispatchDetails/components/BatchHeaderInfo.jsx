import {
  AlertCircle,
  Building2,
  Package,
  PackageCheck,
  Tag,
} from "lucide-react";
import Badge from "../../../../../Components/UI/Badge";
import Card from "../../../../../Components/UI/Card";
import IconWrapper from "../../../../../Components/UI/IconWrapper";

const BatchHeaderInfo = ({ details }) => {
  const summary = details?.summary || {};

  const statsCards = [
    {
      id: "total",
      label: "Total Batch Items",
      value: summary.totalItems ?? 0,
      icon: Package,
      variant: "teal",
      color: "var(--color-aurora-teal)",
    },
    {
      id: "unlinked",
      label: "New Unlinked Tags",
      value: summary.unlinkedTags ?? 2,
      icon: Tag,
      variant: "purple",
      color: "var(--color-purple-accent, #a855f7)",
    },
    {
      id: "checked_in",
      label: "Checked In at Laundry",
      value: summary.checkedInLaundry ?? 0,
      icon: Building2,
      variant: "purple",
      color: "var(--color-purple-accent, #a855f7)",
    },
    {
      id: "returned",
      label: "Items Returned",
      value: summary.itemsReturned ?? 0,
      icon: PackageCheck,
      variant: "neutral",
      color: "var(--theme-text-primary)",
    },
    {
      id: "delayed",
      label: "Delayed",
      value: summary.delayed ?? 0,
      icon: AlertCircle,
      variant: "danger",
      color: "var(--color-overdue)",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Back button & Page Title */}
      <div>
        {/* <Button
          variant="outline"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate("/business/dispatch-batches")}
          size={{ minHeight: 36, padding: "0 14px" }}
          className="rounded-xl border-(--theme-border) text-xs font-semibold mb-3 text-(--theme-text-secondary) hover:text-(--theme-text-primary)"
        >
          Back to Dispatch Batches
        </Button> */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-(--theme-text-primary)">
              {details.id}
            </h1>
            <Badge variant={details.statusVariant || "info"} size="md" dot>
              {details.status}
            </Badge>
          </div>

          <div className="text-xs font-medium text-(--theme-text-secondary)">
            Last activity:{" "}
            <span className="font-semibold text-(--theme-text-primary)">
              {details.lastActivity}
            </span>
          </div>
        </div>

        <p className="mt-1 text-sm font-medium text-(--theme-text-secondary)">
          Track scanned linen/assets, dispatch progress, and related activity.
        </p>
      </div>

      {/* Main Metadata Overview Card */}
      <Card padding="20px 24px" rounded="20px">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-6">
          <div>
            <div className="text-xs font-semibold text-(--theme-text-secondary) mb-1">
              Batch ID
            </div>
            <div className="text-sm font-bold text-(--theme-text-primary)">
              {details.id}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-(--theme-text-secondary) mb-1">
              Selected Laundry
            </div>
            <div className="text-sm font-bold text-(--theme-text-primary)">
              {details.selectedLaundry}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-(--theme-text-secondary) mb-1">
              Dispatch Location
            </div>
            <div className="text-sm font-bold text-(--theme-text-primary)">
              {details.dispatchLocation}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-(--theme-text-secondary) mb-1">
              Created By
            </div>
            <div className="text-sm font-bold text-(--theme-text-primary)">
              {details.createdBy}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-(--theme-text-secondary) mb-1">
              Dispatch Date & Time
            </div>
            <div className="text-sm font-bold text-(--theme-text-primary)">
              {details.dispatchDateTime}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-(--theme-text-secondary) mb-1">
              Current Batch Status
            </div>
            <Badge variant={details.statusVariant || "info"} size="sm" dot>
              {details.status}
            </Badge>
          </div>

          <div>
            <div className="text-xs font-semibold text-(--theme-text-secondary) mb-1">
              Last Activity
            </div>
            <div className="text-sm font-bold text-(--theme-text-primary)">
              {details.lastActivity}
            </div>
          </div>
        </div>
      </Card>

      {/* 5 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {statsCards.map((item) => (
          <Card key={item.id} padding="18px 20px" rounded="18px">
            <div className="flex flex-col gap-3">
              <IconWrapper
                icon={item.icon}
                variant={item.variant}
                sizeClassName="h-10 w-10"
                iconSize={20}
                roundedClassName="rounded-xl"
              />
              <div>
                <div
                  className="text-2xl font-bold leading-none tracking-tight mb-1"
                  style={{ color: item.color }}
                >
                  {item.value}
                </div>
                <div className="text-xs font-medium text-(--theme-text-secondary)">
                  {item.label}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BatchHeaderInfo;

import {
  Building2,
  CircleCheck,
  CircleX,
  CreditCard,
  Edit2,
  Infinity as InfinityIcon,
  Layers,
  ScanLine,
  ShieldAlert,
  Sparkles,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import Card from "../../../Components/UI/Card";
import CardSkeleton from "../../../Components/UI/CardSkeleton";
import { formatQuota } from "./data";

const PlanCardView = ({
  data = [],
  loading = false,
  onEditAction,
  onStatusAction,
  onDeleteAction,
}) => {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <CardSkeleton key={n} lines={8} />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-(--theme-border-soft) p-12 text-center">
        <CreditCard className="mx-auto mb-3 h-10 w-10 text-(--theme-text-muted)" />
        <h4 className="font-bold text-(--theme-text-primary)">No Subscription Plans Found</h4>
        <p className="mt-1 text-sm text-(--theme-text-muted)">
          Create your first subscription tier to define quotas and features for Laundries.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((plan) => {
        const isPro = plan.code.includes("pro") || plan.code.includes("enterprise");
        const isEnterprise = plan.code.includes("enterprise");

        return (
          <Card
            key={plan.id}
            className={`relative flex flex-col justify-between overflow-hidden border transition-all duration-200 hover:shadow-lg ${
              isEnterprise
                ? "border-(--color-pending)/40"
                : isPro
                ? "border-(--color-aurora-teal)/40"
                : "border-(--theme-border-soft)"
            }`}
          >
            {/* Top decorative accent */}
            <div
              className={`absolute top-0 inset-x-0 h-1 ${
                isEnterprise
                  ? "bg-(--color-pending)"
                  : isPro
                  ? "bg-(--color-aurora-teal)"
                  : "bg-(--theme-border-soft)"
              }`}
            />

            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pt-2">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="m-0 text-xl font-black text-(--theme-text-primary)">
                      {plan.name}
                    </h3>
                    <Badge size="xs" variant={plan.targetType === "business" ? "primary" : "neutral"}>
                      {plan.targetType === "business" ? "Business" : "Laundry"}
                    </Badge>
                    {isEnterprise && (
                      <span className="flex items-center gap-1 rounded-full bg-(--color-pending-bg) border border-(--badge-pending-border) px-2 py-0.5 text-[10px] font-bold text-(--badge-pending-text)">
                        <Sparkles size={11} /> Top Tier
                      </span>
                    )}
                  </div>
                  <span className="mt-1 inline-block font-mono text-xs text-(--theme-text-muted)">
                    {plan.code}
                  </span>
                </div>

                <Badge
                  leftIcon={
                    plan.status === "Active" ? (
                      <CircleCheck size={12} />
                    ) : (
                      <CircleX size={12} />
                    )
                  }
                  size="sm"
                  variant={plan.statusVariant}
                >
                  {plan.status}
                </Badge>
              </div>

              {/* Price */}
              <div className="my-5 flex items-baseline gap-1.5">
                <span className="text-3xl font-black tracking-tight text-(--theme-text-primary)">
                  {plan.formattedPrice}
                </span>
                <span className="text-sm font-semibold text-(--theme-text-muted)">
                  / {plan.formattedBillingCycle.toLowerCase()}
                </span>
              </div>

              {plan.description && plan.description !== "—" && (
                <p className="mb-5 text-xs text-(--theme-text-secondary) leading-relaxed">
                  {plan.description}
                </p>
              )}

              {/* Resource Quotas */}
              <div className="mb-5 rounded-xl bg-(--theme-surface-soft) p-3.5 space-y-2 border border-(--theme-border-soft)/50">
                <p className="m-0 mb-2 text-[11px] font-bold uppercase tracking-wider text-(--theme-text-muted)">
                  {plan.targetType === "business" ? "Business Quotas" : "Laundry Quotas"}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-(--theme-text-secondary)">
                    <Building2 size={14} className="text-(--color-aurora-teal)" />
                    {plan.targetType === "business" ? "Linked Laundries" : "Linked Businesses"}
                  </span>
                  <span className="font-bold text-(--theme-text-primary)">
                    {plan.maxLinkedBusinesses == null ? (
                      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-(--color-aurora-teal)">
                        <InfinityIcon size={12} /> Unlimited
                      </span>
                    ) : (
                      formatQuota(plan.maxLinkedBusinesses)
                    )}
                  </span>
                </div>

                {plan.targetType === "business" && (
                  <>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-(--theme-text-secondary)">
                        <Tag size={14} className="text-(--color-seafoam)" />
                        Linen Assets / Items
                      </span>
                      <span className="font-bold text-(--theme-text-primary)">
                        {plan.maxAssets == null ? (
                          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-(--color-aurora-teal)">
                            <InfinityIcon size={12} /> Unlimited
                          </span>
                        ) : (
                          formatQuota(plan.maxAssets)
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-(--theme-text-secondary)">
                        <Layers size={14} className="text-(--color-sky-blue)" />
                        Linen Categories
                      </span>
                      <span className="font-bold text-(--theme-text-primary)">
                        {plan.maxCategories == null ? (
                          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-(--color-aurora-teal)">
                            <InfinityIcon size={12} /> Unlimited
                          </span>
                        ) : (
                          formatQuota(plan.maxCategories)
                        )}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-(--theme-text-secondary)">
                    <ScanLine size={14} className="text-(--color-sky-blue)" />
                    RFID Scanners
                  </span>
                  <span className="font-bold text-(--theme-text-primary)">
                    {plan.maxScanners == null ? (
                      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-(--color-aurora-teal)">
                        <InfinityIcon size={12} /> Unlimited
                      </span>
                    ) : (
                      formatQuota(plan.maxScanners)
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-(--theme-text-secondary)">
                    <Users size={14} className="text-(--color-seafoam)" />
                    Staff Accounts
                  </span>
                  <span className="font-bold text-(--theme-text-primary)">
                    {plan.maxStaff == null ? (
                      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-(--color-aurora-teal)">
                        <InfinityIcon size={12} /> Unlimited
                      </span>
                    ) : (
                      formatQuota(plan.maxStaff)
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-(--theme-text-secondary)">
                    <ShieldAlert size={14} className="text-(--admin-primary)" />
                    Custom Staff Roles
                  </span>
                  <span className="font-bold text-(--theme-text-primary)">
                    {plan.maxStaffRoles == null ? (
                      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-(--color-aurora-teal)">
                        <InfinityIcon size={12} /> Unlimited
                      </span>
                    ) : (
                      formatQuota(plan.maxStaffRoles)
                    )}
                  </span>
                </div>
              </div>

              {/* Feature Capabilities */}
              <div className="mb-6 space-y-1.5 text-xs">
                <p className="m-0 mb-2 text-[11px] font-bold uppercase tracking-wider text-(--theme-text-muted)">
                  Features
                </p>

                {plan.targetType !== "business" && (
                  <div className="flex items-center gap-2">
                    {plan.allowBulkScan ? (
                      <CircleCheck size={14} className="text-(--color-ready) shrink-0" />
                    ) : (
                      <CircleX size={14} className="text-(--theme-text-muted) shrink-0" />
                    )}
                    <span className={plan.allowBulkScan ? "text-(--theme-text-primary) font-medium" : "text-(--theme-text-muted) line-through"}>
                      Bulk RFID Scanning
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {plan.allowBatchDispatch ? (
                    <CircleCheck size={14} className="text-(--color-ready) shrink-0" />
                  ) : (
                    <CircleX size={14} className="text-(--theme-text-muted) shrink-0" />
                  )}
                  <span className={plan.allowBatchDispatch ? "text-(--theme-text-primary) font-medium" : "text-(--theme-text-muted) line-through"}>
                    {plan.targetType === "business" ? "Batch Dispatch to Laundries" : "Batch Dispatch Operations"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {plan.allowReports ? (
                    <CircleCheck size={14} className="text-(--color-ready) shrink-0" />
                  ) : (
                    <CircleX size={14} className="text-(--theme-text-muted) shrink-0" />
                  )}
                  <span className={plan.allowReports ? "text-(--theme-text-primary) font-medium" : "text-(--theme-text-muted) line-through"}>
                    Advanced Reports & Analytics
                  </span>
                </div>
              </div>
            </div>

            {/* Actions footer */}
            <div className="flex items-center gap-2 border-t border-(--theme-border-soft) pt-3">
              <Button
                leftIcon={<Edit2 size={13} />}
                onClick={() => onEditAction?.(plan)}
                rounded="8px"
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
              >
                Edit
              </Button>

              <Button
                leftIcon={plan.status === "Active" ? <CircleX size={13} /> : <CircleCheck size={13} />}
                onClick={() =>
                  onStatusAction?.({
                    action: plan.status === "Active" ? "inactive" : "active",
                    planItem: plan,
                  })
                }
                rounded="8px"
                size="sm"
                variant={plan.status === "Active" ? "outline" : "secondary"}
                className="flex-1 text-xs"
              >
                {plan.status === "Active" ? "Deactivate" : "Activate"}
              </Button>

              <Button
                aria-label="Delete plan"
                leftIcon={<Trash2 size={13} />}
                onClick={() => onDeleteAction?.(plan)}
                rounded="8px"
                size="sm"
                variant="danger"
                className="px-2.5"
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default PlanCardView;

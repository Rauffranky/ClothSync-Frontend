import { useEffect, useState } from "react";
import {
  Building2,
  Check,
  CircleCheck,
  CircleX,
  Clock,
  CreditCard,
  DollarSign,
  Infinity as InfinityIcon,
  RefreshCw,
  ScanLine,
  ShieldAlert,
  Sparkles,
  Users,
  AlertTriangle,
} from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import Card from "../../../Components/UI/Card";
import CardSkeleton from "../../../Components/UI/CardSkeleton";
import Modal from "../../../Components/UI/Modal";
import Input from "../../../Components/UI/Input";
import { getApiErrorMessage } from "../../../axios/api";
import { getAuthSessionUser } from "../../../axios/auth/authSession";
import {
  getAvailableSubscriptionPlans,
  requestSubscription,
} from "../../../axios/subscriptions/subscriptions";
import useOrganizationSubscription, {
  notifySubscriptionUpdated,
} from "../../../Hooks/useOrganizationSubscription";
import { toast } from "../../../Utils/toast";
import { formatDateWithUserPreferences } from "../../../Utils/date";

const SubscriptionBilling = () => {
  const sessionUser = getAuthSessionUser();
  const isBusinessPortal = Boolean(
    sessionUser?.tenantId ||
    sessionUser?.role?.includes("tenant") ||
    !sessionUser?.laundryId,
  );

  const {
    subscription,
    plan: activePlan,
    hasActiveSubscription,
    isPending,
    isRejected,
    isLoading: isSubLoading,
    refreshSubscription,
  } = useOrganizationSubscription();

  const [availablePlans, setAvailablePlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [selectedPlanForSubscribe, setSelectedPlanForSubscribe] = useState(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isActive = true;

    getAvailableSubscriptionPlans()
      .then((res) => {
        if (!isActive) return;
        const plans = res?.data?.data || res?.data || [];
        setAvailablePlans(plans);
      })
      .catch((err) => {
        if (!isActive) return;
        toast.error(getApiErrorMessage(err, "Unable to load subscription plans"));
      })
      .finally(() => {
        if (isActive) setIsLoadingPlans(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const handleSubscribe = async () => {
    if (!selectedPlanForSubscribe) return;
    setIsSubmitting(true);

    try {
      const response = await requestSubscription({
        subscriptionPlanId: selectedPlanForSubscribe.id,
        notes: notes.trim() || undefined,
      });

      toast.success(
        response?.message ||
          "Subscription request submitted. Awaiting Super Admin approval.",
      );
      setSelectedPlanForSubscribe(null);
      setNotes("");
      notifySubscriptionUpdated();
      refreshSubscription();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Unable to submit subscription request"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPlanId = subscription?.subscriptionPlanId || activePlan?.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-(--color-aurora-teal)/10 text-(--color-aurora-teal)">
              <DollarSign size={22} />
            </span>
            <div>
              <h1 className="m-0 text-2xl font-black text-(--theme-text-primary)">
                Subscription & Billing
              </h1>
              <p className="m-0 text-sm font-medium text-(--theme-text-secondary)">
                Select your operational subscription tier to unlock platform access, scanner quotas, and features.
              </p>
            </div>
          </div>
        </div>

        <Button
          leftIcon={<RefreshCw size={14} className={isSubLoading ? "animate-spin" : ""} />}
          onClick={refreshSubscription}
          rounded="10px"
          size="sm"
          variant="outline"
        >
          Refresh Status
        </Button>
      </section>

      {/* Subscription Status Banners */}
      {!hasActiveSubscription && !isPending && !isRejected && (
        <Alert
          leftIcon={<AlertTriangle size={20} />}
          rounded="rounded-2xl"
          variant="warning"
        >
          <div className="space-y-1">
            <h4 className="m-0 font-black text-current">
              Subscription Required
            </h4>
            <p className="m-0 text-sm opacity-90">
              You must subscribe to a plan to unlock operational tools (Dashboard, Scanners, Batches, Staff, etc.).
              Choose your preferred tier below and submit your request. The Super Admin will review and activate your account.
            </p>
          </div>
        </Alert>
      )}

      {isPending && (
        <Alert
          leftIcon={<Clock size={20} className="animate-pulse" />}
          rounded="rounded-2xl"
          variant="info"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="m-0 font-black text-current">
                Subscription Request Pending Approval
              </h4>
              <Badge size="xs" variant="primary">
                Under Review
              </Badge>
            </div>
            <p className="m-0 text-sm opacity-90">
              Your request for{" "}
              <span className="font-black">{activePlan?.name || "selected plan"}</span>{" "}
              (${Number(subscription?.price || 0).toFixed(2)} / {subscription?.billingCycle}) has been submitted
              and is waiting for Super Admin approval. Once approved, all platform features will unlock automatically.
            </p>
          </div>
        </Alert>
      )}

      {isRejected && (
        <Alert
          leftIcon={<CircleX size={20} />}
          rounded="rounded-2xl"
          variant="danger"
        >
          <div className="space-y-1">
            <h4 className="m-0 font-black text-current">
              Subscription Request Rejected
            </h4>
            <p className="m-0 text-sm opacity-90">
              Reason:{" "}
              <span className="font-semibold">
                {subscription?.rejectionReason || "No specific reason provided."}
              </span>
              . You may select a different tier below or contact platform support.
            </p>
          </div>
        </Alert>
      )}

      {hasActiveSubscription && (
        <Alert
          leftIcon={<CircleCheck size={20} />}
          rounded="rounded-2xl"
          variant="success"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="m-0 font-black text-current">
                Active Plan: {activePlan?.name} Tier
              </h4>
              <Badge size="xs" variant="success">
                Active
              </Badge>
            </div>
            <p className="m-0 text-sm opacity-90">
              ${Number(subscription?.price || 0).toFixed(2)} / {subscription?.billingCycle}.
              {subscription?.endDate && (
                <> Valid through {formatDateWithUserPreferences(subscription.endDate)}.</>
              )}{" "}
              All portal tools and resource quotas are unlocked.
            </p>
          </div>
        </Alert>
      )}

      {/* Available Plans Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="m-0 text-lg font-bold text-(--theme-text-primary)">
            Available Subscription Tiers
          </h2>
          <p className="m-0 text-xs text-(--theme-text-muted)">
            Select the plan that fits your facility size and RFID scanning workflow.
          </p>
        </div>

        {isLoadingPlans ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <CardSkeleton key={n} lines={8} />
            ))}
          </div>
        ) : availablePlans.length === 0 ? (
          <Card className="p-8 text-center border-(--theme-border-soft)">
            <DollarSign size={32} className="mx-auto mb-2 text-(--theme-text-muted)" />
            <h3 className="m-0 text-base font-bold text-(--theme-text-primary)">
              No Subscription Plans Available
            </h3>
            <p className="m-0 mt-1 text-xs text-(--theme-text-secondary)">
              No subscription tiers are currently configured for your account type. Please contact support or your system administrator.
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {availablePlans.map((plan) => {
              const isCurrent = currentPlanId === plan.id;
              const isEnterprise =
                plan.code.includes("enterprise") ||
                plan.name.toLowerCase().includes("enterprise");
              const isPro =
                plan.code.includes("pro") ||
                plan.name.toLowerCase().includes("pro");

              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col justify-between overflow-hidden border transition-all duration-200 hover:shadow-xl ${
                    isCurrent
                      ? "border-(--color-aurora-teal) ring-2 ring-(--color-aurora-teal)/20 shadow-md"
                      : isEnterprise
                      ? "border-(--color-pending)/40"
                      : isPro
                      ? "border-(--color-aurora-teal)/40"
                      : "border-(--theme-border-soft)"
                  }`}
                >
                  {/* Top accent */}
                  <div
                    className={`absolute top-0 inset-x-0 h-1.5 ${
                      isCurrent
                        ? "bg-(--color-aurora-teal)"
                        : isEnterprise
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
                        <div className="flex items-center gap-2">
                          <h3 className="m-0 text-xl font-black text-(--theme-text-primary)">
                            {plan.name}
                          </h3>
                          {isEnterprise && (
                            <span className="flex items-center gap-1 rounded-full bg-(--color-pending-bg) border border-(--badge-pending-border) px-2 py-0.5 text-[10px] font-bold text-(--badge-pending-text)">
                              <Sparkles size={11} /> Enterprise
                            </span>
                          )}
                        </div>
                        <span className="mt-1 inline-block font-mono text-xs text-(--theme-text-muted)">
                          {plan.code}
                        </span>
                      </div>

                      {isCurrent && (
                        <Badge
                          leftIcon={
                            hasActiveSubscription ? (
                              <CircleCheck size={12} />
                            ) : (
                              <Clock size={12} />
                            )
                          }
                          size="sm"
                          variant={hasActiveSubscription ? "success" : "primary"}
                        >
                          {hasActiveSubscription ? "Active Plan" : "Requested"}
                        </Badge>
                      )}
                    </div>

                    {/* Price */}
                    <div className="my-5 flex items-baseline gap-1.5">
                      <span className="text-3xl font-black tracking-tight text-(--theme-text-primary)">
                        ${Number(plan.price || 0).toFixed(2)}
                      </span>
                      <span className="text-sm font-semibold text-(--theme-text-muted) capitalize">
                        / {plan.billingCycle}
                      </span>
                    </div>

                    {plan.description && (
                      <p className="mb-5 text-xs text-(--theme-text-secondary) leading-relaxed">
                        {plan.description}
                      </p>
                    )}

                    {/* Resource Quotas */}
                    <div className="mb-5 rounded-xl bg-(--theme-surface-soft) p-3.5 space-y-2 border border-(--theme-border-soft)/50">
                      <p className="m-0 mb-2 text-[11px] font-bold uppercase tracking-wider text-(--theme-text-muted)">
                        Included Quotas
                      </p>

                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-(--theme-text-secondary)">
                          <Building2 size={14} className="text-(--color-aurora-teal)" />
                          {isBusinessPortal ? "Linked Laundries" : "Linked Businesses"}
                        </span>
                        <span className="font-bold text-(--theme-text-primary)">
                          {plan.maxLinkedBusinesses == null ? (
                            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-(--color-aurora-teal)">
                              <InfinityIcon size={12} /> Unlimited
                            </span>
                          ) : (
                            Number(plan.maxLinkedBusinesses).toLocaleString()
                          )}
                        </span>
                      </div>

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
                            Number(plan.maxScanners).toLocaleString()
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-(--theme-text-secondary)">
                          <Users size={14} className="text-(--color-seafoam)" />
                          Staff Members
                        </span>
                        <span className="font-bold text-(--theme-text-primary)">
                          {plan.maxStaff == null ? (
                            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-(--color-aurora-teal)">
                              <InfinityIcon size={12} /> Unlimited
                            </span>
                          ) : (
                            Number(plan.maxStaff).toLocaleString()
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-(--theme-text-secondary)">
                          <ShieldAlert size={14} className="text-(--admin-primary)" />
                          Staff Roles
                        </span>
                        <span className="font-bold text-(--theme-text-primary)">
                          {plan.maxStaffRoles == null ? (
                            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-(--color-aurora-teal)">
                              <InfinityIcon size={12} /> Unlimited
                            </span>
                          ) : (
                            Number(plan.maxStaffRoles).toLocaleString()
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Features checklist */}
                    <div className="mb-6 space-y-2 text-xs">
                      <p className="m-0 mb-2 text-[11px] font-bold uppercase tracking-wider text-(--theme-text-muted)">
                        Capabilities
                      </p>

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

                      <div className="flex items-center gap-2">
                        {plan.allowBatchDispatch ? (
                          <CircleCheck size={14} className="text-(--color-ready) shrink-0" />
                        ) : (
                          <CircleX size={14} className="text-(--theme-text-muted) shrink-0" />
                        )}
                        <span className={plan.allowBatchDispatch ? "text-(--theme-text-primary) font-medium" : "text-(--theme-text-muted) line-through"}>
                          Batch Dispatch Operations
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

                  {/* Subscribe Action Button */}
                  <div className="pt-3 border-t border-(--theme-border-soft)">
                    {isCurrent && hasActiveSubscription ? (
                      <Button
                        disabled
                        leftIcon={<Check size={15} />}
                        rounded="10px"
                        size="sm"
                        variant="outline"
                        className="w-full text-xs font-bold"
                      >
                        Active Plan
                      </Button>
                    ) : isCurrent && isPending ? (
                      <Button
                        disabled
                        leftIcon={<Clock size={15} />}
                        rounded="10px"
                        size="sm"
                        variant="outline"
                        className="w-full text-xs font-bold"
                      >
                        Requested (Under Review)
                      </Button>
                    ) : (
                      <Button
                        leftIcon={<CreditCard size={15} />}
                        onClick={() => setSelectedPlanForSubscribe(plan)}
                        rounded="10px"
                        size="sm"
                        variant={isEnterprise ? "secondary" : "primary"}
                        className="w-full text-xs font-bold"
                      >
                        {hasActiveSubscription ? "Switch to this Plan" : "Subscribe to Plan"}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {selectedPlanForSubscribe && (
        <Modal
          closeOnBackdrop={!isSubmitting}
          footer={
            <>
              <Button
                disabled={isSubmitting}
                onClick={() => setSelectedPlanForSubscribe(null)}
                rounded="10px"
                size="sm"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                leftIcon={<CreditCard size={15} />}
                loading={isSubmitting}
                onClick={handleSubscribe}
                rounded="10px"
                size="sm"
                variant="primary"
              >
                Confirm Subscription Request
              </Button>
            </>
          }
          onClose={() => {
            if (!isSubmitting) setSelectedPlanForSubscribe(null);
          }}
          open
          title={`Subscribe to ${selectedPlanForSubscribe.name} Plan`}
          width={520}
        >
          <div className="space-y-4">
            <Alert variant="info" rounded="rounded-xl">
              <p className="m-0 font-bold">
                ${Number(selectedPlanForSubscribe.price || 0).toFixed(2)} / {selectedPlanForSubscribe.billingCycle}
              </p>
              <p className="m-0 mt-1 text-xs">
                Your subscription request will be sent to the Super Admin for approval.
                Once approved, all feature quotas for this tier will be unlocked.
              </p>
            </Alert>

            <div>
              <Input
                label="Optional Note for Administrator"
                name="notes"
                onChange={(val) => setNotes(val)}
                placeholder="e.g. Offline payment made, bank transfer reference, or PO number..."
                value={notes}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SubscriptionBilling;

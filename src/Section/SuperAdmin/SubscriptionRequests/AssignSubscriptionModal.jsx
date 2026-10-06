import { useEffect, useState, useMemo } from "react";
import {
  Building2,
  CircleCheck,
  Infinity as InfinityIcon,
  Layers,
  ScanLine,
  ShieldAlert,
  Sparkles,
  Tag,
  TowelRack,
  Users,
} from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import Dropdown from "../../../Components/UI/Dropdown";
import Modal from "../../../Components/UI/Modal";
import { getApiErrorMessage } from "../../../axios/api";
import { getAdminTenants } from "../../../axios/adminTenants/adminTenants";
import { getAdminLaundries } from "../../../axios/laundries/adminLaundries";
import { getAdminSubscriptionPlans } from "../../../axios/adminSubscriptionPlans/adminSubscriptionPlans";
import { assignAdminSubscription } from "../../../axios/subscriptions/subscriptions";
import { toast } from "../../../Utils/toast";

const AssignSubscriptionModalDialog = ({
  onClose,
  onSaved,
  initialTargetType = "business",
  initialTargetId = null,
  initialTargetName = "",
}) => {
  const [targetType, setTargetType] = useState(initialTargetType || "business");
  const [targetId, setTargetId] = useState(
    initialTargetId ? String(initialTargetId) : "",
  );
  const [selectedPlanId, setSelectedPlanId] = useState("");

  const [organizations, setOrganizations] = useState([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);

  const [plans, setPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch organizations based on targetType
  useEffect(() => {
    let isActive = true;

    const fetchPromise =
      targetType === "laundry"
        ? getAdminLaundries({ limit: 100 })
        : getAdminTenants({ limit: 100 });

    fetchPromise
      .then((res) => {
        if (!isActive) return;
        const rows =
          res?.data?.data?.rows || res?.data?.data || res?.data || [];
        setOrganizations(Array.isArray(rows) ? rows : []);
      })
      .catch((err) => {
        if (!isActive) return;
        toast.error(
          getApiErrorMessage(
            err,
            `Unable to load ${targetType === "laundry" ? "laundries" : "businesses"} list`,
          ),
        );
        setOrganizations([]);
      })
      .finally(() => {
        if (isActive) setIsLoadingOrgs(false);
      });

    return () => {
      isActive = false;
    };
  }, [targetType]);

  // Fetch active plans for selected targetType
  useEffect(() => {
    let isActive = true;

    getAdminSubscriptionPlans({
      limit: 100,
      status: "active",
      targetType: targetType,
    })
      .then((res) => {
        if (!isActive) return;
        const rows =
          res?.data?.data?.rows ||
          res?.data?.data?.items ||
          res?.data?.rows ||
          res?.data?.items ||
          res?.data?.data ||
          (Array.isArray(res?.data) ? res.data : []);
        setPlans(Array.isArray(rows) ? rows : []);
      })
      .catch((err) => {
        if (!isActive) return;
        toast.error(
          getApiErrorMessage(err, "Unable to load subscription plans"),
        );
        setPlans([]);
      })
      .finally(() => {
        if (isActive) setIsLoadingPlans(false);
      });

    return () => {
      isActive = false;
    };
  }, [targetType]);

  const organizationOptions = useMemo(() => {
    return organizations.map((org) => ({
      label: org.businessName || org.companyName || org.name || `ID #${org.id}`,
      value: String(org.id),
      subtext: org.email || org.contactEmail || org.phone || "",
    }));
  }, [organizations]);

  const planOptions = useMemo(() => {
    return plans.map((p) => {
      const priceText =
        p.price === 0 || p.price === "0.00"
          ? "Free"
          : `$${Number(p.price || 0).toFixed(2)}`;
      const cycleText = p.billingCycle || "monthly";
      return {
        label: `${p.name} (${priceText} / ${cycleText})`,
        value: String(p.id),
      };
    });
  }, [plans]);

  const selectedPlan = useMemo(() => {
    return plans.find((p) => String(p.id) === String(selectedPlanId)) || null;
  }, [plans, selectedPlanId]);

  const selectedOrg = useMemo(() => {
    return organizations.find((o) => String(o.id) === String(targetId)) || null;
  }, [organizations, targetId]);

  const handleTargetTypeChange = (newType) => {
    setTargetType(newType);
    setTargetId("");
    setSelectedPlanId("");
    setIsLoadingOrgs(true);
    setIsLoadingPlans(true);
  };

  const handleSubmit = async () => {
    if (!targetId) {
      toast.error(
        `Please select a ${targetType === "laundry" ? "laundry facility" : "business"} to assign`,
      );
      return;
    }
    if (!selectedPlanId) {
      toast.error("Please select a subscription plan to assign");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await assignAdminSubscription({
        targetType: targetType === "business" ? "business" : "laundry",
        targetId: Number(targetId),
        subscriptionPlanId: Number(selectedPlanId),
        status: "active",
      });

      toast.success(
        response?.message ||
          `Subscription plan assigned and activated for ${
            selectedOrg?.name || initialTargetName || "organization"
          }!`,
      );
      onSaved?.();
      onClose?.();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Failed to assign subscription plan"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      closeOnBackdrop={!isSubmitting}
      footer={
        <>
          <Button
            disabled={isSubmitting}
            onClick={onClose}
            rounded="10px"
            size="sm"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={!targetId || !selectedPlanId || isSubmitting}
            leftIcon={<CircleCheck size={15} />}
            loading={isSubmitting}
            onClick={handleSubmit}
            rounded="10px"
            size="sm"
            variant="primary"
          >
            Assign & Activate Plan
          </Button>
        </>
      }
      onClose={onClose}
      open={open}
      title="Assign Subscription Plan"
      width={580}
    >
      <div className="space-y-5">
        {/* Intro */}
        <p className="m-0 text-xs text-(--theme-text-secondary)">
          Directly allocate an active subscription tier to a business or laundry
          facility. This immediately activates their account, grants module
          access, and configures resource quotas without requiring an invitation
          or user request.
        </p>

        {/* Organization Type Selector */}
        {!initialTargetId && (
          <div>
            <label className="mb-1.5 block text-xs font-bold text-(--theme-text-primary)">
              Organization Type <span className="text-(--color-danger)">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTargetTypeChange("business")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                  targetType === "business"
                    ? "border-(--color-aurora-teal) bg-(--color-aurora-teal)/10 text-(--color-aurora-teal) shadow-xs"
                    : "border-(--theme-border-soft) bg-(--theme-surface-subtle) text-(--theme-text-secondary) hover:border-(--color-aurora-teal)/50"
                }`}
              >
                <Building2 size={16} />
                Business / Client
              </button>

              <button
                type="button"
                onClick={() => handleTargetTypeChange("laundry")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                  targetType === "laundry"
                    ? "border-(--color-aurora-teal) bg-(--color-aurora-teal)/10 text-(--color-aurora-teal) shadow-xs"
                    : "border-(--theme-border-soft) bg-(--theme-surface-subtle) text-(--theme-text-secondary) hover:border-(--color-aurora-teal)/50"
                }`}
              >
                <TowelRack size={16} />
                Commercial Laundry
              </button>
            </div>
          </div>
        )}

        {/* Target Organization */}
        {initialTargetId ? (
          <div>
            <label className="mb-1 block text-xs font-bold text-(--theme-text-primary)">
              Target Organization
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-(--theme-border-soft) bg-(--theme-surface-soft) px-3 py-2.5">
              {targetType === "laundry" ? (
                <TowelRack size={16} className="text-(--color-aurora-teal)" />
              ) : (
                <Building2 size={16} className="text-(--color-aurora-teal)" />
              )}
              <span className="text-sm font-bold text-(--theme-text-primary)">
                {initialTargetName || `ID #${initialTargetId}`}
              </span>
              <Badge size="xs" variant="teal" className="ml-auto capitalize">
                {targetType}
              </Badge>
            </div>
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-xs font-bold text-(--theme-text-primary)">
              Select{" "}
              {targetType === "laundry" ? "Laundry Facility" : "Business"}{" "}
              <span className="text-(--color-danger)">*</span>
            </label>
            <Dropdown
              disabled={isLoadingOrgs}
              name="targetId"
              onChange={(val) => setTargetId(val)}
              options={organizationOptions}
              placeholder={
                isLoadingOrgs
                  ? "Loading organizations..."
                  : `Choose a ${targetType === "laundry" ? "laundry" : "business"}...`
              }
              search
              value={targetId}
            />
            {organizationOptions.length === 0 && !isLoadingOrgs && (
              <p className="mt-1 text-xs text-(--color-danger)">
                No {targetType === "laundry" ? "laundries" : "businesses"}{" "}
                found.
              </p>
            )}
          </div>
        )}

        {/* Subscription Plan */}
        <div>
          <label className="mb-1 block text-xs font-bold text-(--theme-text-primary)">
            Select Plan to Allocate{" "}
            <span className="text-(--color-danger)">*</span>
          </label>
          <Dropdown
            disabled={isLoadingPlans}
            name="selectedPlanId"
            onChange={(val) => setSelectedPlanId(val)}
            options={planOptions}
            placeholder={
              isLoadingPlans
                ? "Loading available plans..."
                : `Choose a ${targetType} plan tier...`
            }
            search
            value={selectedPlanId}
          />
          {planOptions.length === 0 && !isLoadingPlans && (
            <p className="mt-1 text-xs text-(--theme-text-muted)">
              No active {targetType} subscription plans configured. Please
              create an active plan first.
            </p>
          )}
        </div>

        {/* Selected Plan Details Preview Card */}
        {selectedPlan && (
          <div className="rounded-2xl border border-(--color-aurora-teal)/30 bg-(--color-aurora-teal)/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-(--theme-text-muted)">
                  Selected Tier
                </span>
                <h4 className="m-0 text-base font-extrabold text-(--theme-text-primary)">
                  {selectedPlan.name}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-(--color-aurora-teal)">
                  {selectedPlan.price === 0 || selectedPlan.price === "0.00"
                    ? "Free"
                    : `$${Number(selectedPlan.price || 0).toFixed(2)}`}
                </span>
                <span className="block text-xs font-semibold text-(--theme-text-muted) capitalize">
                  / {selectedPlan.billingCycle || "monthly"}
                </span>
              </div>
            </div>

            {/* Quota overview */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-(--theme-border-soft)/50">
              <div className="flex items-center justify-between rounded-lg bg-(--theme-surface-card) p-2 border border-(--theme-border-soft)/50">
                <span className="flex items-center gap-1.5 text-(--theme-text-secondary)">
                  <Building2 size={13} className="text-(--color-aurora-teal)" />
                  {targetType === "business" ? "Laundries" : "Businesses"}
                </span>
                <span className="font-bold text-(--theme-text-primary)">
                  {selectedPlan.maxLinkedBusinesses == null ? (
                    <span className="inline-flex items-center gap-0.5 text-(--color-aurora-teal)">
                      <InfinityIcon size={12} /> Unlimited
                    </span>
                  ) : (
                    selectedPlan.maxLinkedBusinesses
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-(--theme-surface-card) p-2 border border-(--theme-border-soft)/50">
                <span className="flex items-center gap-1.5 text-(--theme-text-secondary)">
                  <ScanLine size={13} className="text-(--color-sky-blue)" />
                  RFID Scanners
                </span>
                <span className="font-bold text-(--theme-text-primary)">
                  {selectedPlan.maxScanners == null ? (
                    <span className="inline-flex items-center gap-0.5 text-(--color-aurora-teal)">
                      <InfinityIcon size={12} /> Unlimited
                    </span>
                  ) : (
                    selectedPlan.maxScanners
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-(--theme-surface-card) p-2 border border-(--theme-border-soft)/50">
                <span className="flex items-center gap-1.5 text-(--theme-text-secondary)">
                  <Users size={13} className="text-(--color-seafoam)" />
                  Staff Members
                </span>
                <span className="font-bold text-(--theme-text-primary)">
                  {selectedPlan.maxStaff == null ? (
                    <span className="inline-flex items-center gap-0.5 text-(--color-aurora-teal)">
                      <InfinityIcon size={12} /> Unlimited
                    </span>
                  ) : (
                    selectedPlan.maxStaff
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-(--theme-surface-card) p-2 border border-(--theme-border-soft)/50">
                <span className="flex items-center gap-1.5 text-(--theme-text-secondary)">
                  <ShieldAlert size={13} className="text-(--admin-primary)" />
                  Staff Roles
                </span>
                <span className="font-bold text-(--theme-text-primary)">
                  {selectedPlan.maxStaffRoles == null ? (
                    <span className="inline-flex items-center gap-0.5 text-(--color-aurora-teal)">
                      <InfinityIcon size={12} /> Unlimited
                    </span>
                  ) : (
                    selectedPlan.maxStaffRoles
                  )}
                </span>
              </div>

              {targetType === "business" && (
                <>
                  <div className="flex items-center justify-between rounded-lg bg-(--theme-surface-card) p-2 border border-(--theme-border-soft)/50">
                    <span className="flex items-center gap-1.5 text-(--theme-text-secondary)">
                      <Tag size={13} className="text-(--color-seafoam)" />
                      Linen Assets
                    </span>
                    <span className="font-bold text-(--theme-text-primary)">
                      {selectedPlan.maxAssets == null ? (
                        <span className="inline-flex items-center gap-0.5 text-(--color-aurora-teal)">
                          <InfinityIcon size={12} /> Unlimited
                        </span>
                      ) : (
                        selectedPlan.maxAssets
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-(--theme-surface-card) p-2 border border-(--theme-border-soft)/50">
                    <span className="flex items-center gap-1.5 text-(--theme-text-secondary)">
                      <Layers size={13} className="text-(--color-sky-blue)" />
                      Categories
                    </span>
                    <span className="font-bold text-(--theme-text-primary)">
                      {selectedPlan.maxCategories == null ? (
                        <span className="inline-flex items-center gap-0.5 text-(--color-aurora-teal)">
                          <InfinityIcon size={12} /> Unlimited
                        </span>
                      ) : (
                        selectedPlan.maxCategories
                      )}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Capabilities */}
            <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
              {selectedPlan.allowBulkScan && (
                <span className="inline-flex items-center gap-1 rounded-md bg-(--color-aurora-teal)/10 px-2 py-0.5 font-bold text-(--color-aurora-teal)">
                  <Sparkles size={11} /> Bulk Scanning
                </span>
              )}
              {selectedPlan.allowBatchDispatch && (
                <span className="inline-flex items-center gap-1 rounded-md bg-(--color-sky-blue)/10 px-2 py-0.5 font-bold text-(--color-sky-blue)">
                  <Sparkles size={11} /> Batch Dispatch
                </span>
              )}
              {selectedPlan.allowReportsAnalytics && (
                <span className="inline-flex items-center gap-1 rounded-md bg-(--color-seafoam)/10 px-2 py-0.5 font-bold text-(--color-seafoam)">
                  <Sparkles size={11} /> Reports & Analytics
                </span>
              )}
            </div>
          </div>
        )}

        <Alert
          leftIcon={<Sparkles size={18} />}
          rounded="rounded-xl"
          variant="info"
        >
          <p className="m-0 text-xs">
            <strong>Instant Activation:</strong> Once submitted, the
            organization will be granted an active subscription valid for 30
            days. Any existing active subscription will be cleanly superseded.
          </p>
        </Alert>
      </div>
    </Modal>
  );
};

const AssignSubscriptionModal = (props) => {
  if (!props.open) return null;

  return (
    <AssignSubscriptionModalDialog
      key={`${props.initialTargetType || "business"}-${props.initialTargetId || "new"}`}
      {...props}
    />
  );
};

export default AssignSubscriptionModal;

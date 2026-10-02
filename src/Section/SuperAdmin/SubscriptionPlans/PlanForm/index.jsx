import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import {
  ArrowLeft,
  Building2,
  Check,
  CircleCheck,
  CircleX,
  Code2,
  CreditCard,
  DollarSign,
  FileText,
  Infinity as InfinityIcon,
  Layers,
  Plus,
  Save,
  ScanLine,
  ShieldAlert,
  Sparkles,
  Tag,
  Users,
} from "lucide-react";
import Alert from "../../../../Components/UI/Alert";
import Badge from "../../../../Components/UI/Badge";
import Button from "../../../../Components/UI/Button";
import Card from "../../../../Components/UI/Card";
import CardSkeleton from "../../../../Components/UI/CardSkeleton";
import Dropdown from "../../../../Components/UI/Dropdown";
import Input from "../../../../Components/UI/Input";
import Toggle from "../../../../Components/UI/Toggle";
import { getApiErrorMessage } from "../../../../axios/api";
import {
  createAdminSubscriptionPlan,
  getAdminSubscriptionPlanDetails,
  updateAdminSubscriptionPlan,
} from "../../../../axios/adminSubscriptionPlans/adminSubscriptionPlans";
import { toast } from "../../../../Utils/toast";
import {
  billingCycleOptions,
  formatBillingCycle,
  formatQuota,
  subscriptionPlanValidationSchema,
} from "../data";

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const defaultInitialValues = {
  targetType: "laundry",
  name: "",
  code: "",
  description: "",
  price: "49.00",
  billingCycle: "monthly",
  maxLinkedBusinesses: 3,
  unlimitedLinkedBusinesses: false,
  maxScanners: 2,
  unlimitedScanners: false,
  maxStaff: 5,
  unlimitedStaff: false,
  maxStaffRoles: 3,
  unlimitedStaffRoles: false,
  maxAssets: 5000,
  unlimitedAssets: false,
  maxCategories: 10,
  unlimitedCategories: false,
  allowBulkScan: true,
  allowBatchDispatch: true,
  allowReports: true,
  status: "active",
};

const PlanForm = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoadingDetails, setIsLoadingDetails] = useState(isEditing);
  const [loadError, setLoadError] = useState("");

  const [planValues, setPlanValues] = useState(defaultInitialValues);

  const formik = useFormik({
    initialValues: planValues,
    validationSchema: subscriptionPlanValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          targetType: values.targetType || "laundry",
          name: values.name.trim(),
          code: values.code.trim().toLowerCase(),
          description: values.description?.trim() || undefined,
          price: Number(values.price),
          billingCycle: values.billingCycle,
          maxLinkedBusinesses: values.unlimitedLinkedBusinesses
            ? null
            : values.maxLinkedBusinesses === ""
              ? null
              : Number(values.maxLinkedBusinesses),
          maxScanners: values.unlimitedScanners
            ? null
            : values.maxScanners === ""
              ? null
              : Number(values.maxScanners),
          maxStaff: values.unlimitedStaff
            ? null
            : values.maxStaff === ""
              ? null
              : Number(values.maxStaff),
          maxStaffRoles: values.unlimitedStaffRoles
            ? null
            : values.maxStaffRoles === ""
              ? null
              : Number(values.maxStaffRoles),
          maxAssets:
            values.targetType === "business"
              ? values.unlimitedAssets
                ? null
                : values.maxAssets === ""
                  ? null
                  : Number(values.maxAssets)
              : null,
          maxCategories:
            values.targetType === "business"
              ? values.unlimitedCategories
                ? null
                : values.maxCategories === ""
                  ? null
                  : Number(values.maxCategories)
              : null,
          allowBulkScan: values.allowBulkScan,
          allowBatchDispatch: values.allowBatchDispatch,
          allowReports: values.allowReports,
          status: values.status,
        };

        if (isEditing && id) {
          const response = await updateAdminSubscriptionPlan(id, payload);
          toast.success(
            response?.message || "Subscription plan updated successfully",
          );
        } else {
          const response = await createAdminSubscriptionPlan(payload);
          toast.success(
            response?.message || "Subscription plan created successfully",
          );
        }

        navigate("/superadmin/plans");
      } catch (error) {
        toast.error(
          getApiErrorMessage(
            error,
            isEditing
              ? "Unable to update subscription plan"
              : "Unable to create subscription plan",
          ),
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!isEditing || !id) return;

    let isActive = true;

    getAdminSubscriptionPlanDetails(id)
      .then((response) => {
        if (!isActive) return;
        const plan = response?.data?.data || response?.data || response || {};

        setPlanValues({
          targetType: plan.targetType || "laundry",
          name: plan.name || "",
          code: plan.code || "",
          description: plan.description || "",
          price: plan.price ?? "0.00",
          billingCycle: plan.billingCycle || "monthly",
          maxLinkedBusinesses:
            plan.maxLinkedBusinesses == null ? "" : plan.maxLinkedBusinesses,
          unlimitedLinkedBusinesses: plan.maxLinkedBusinesses == null,
          maxScanners: plan.maxScanners == null ? "" : plan.maxScanners,
          unlimitedScanners: plan.maxScanners == null,
          maxStaff: plan.maxStaff == null ? "" : plan.maxStaff,
          unlimitedStaff: plan.maxStaff == null,
          maxStaffRoles: plan.maxStaffRoles == null ? "" : plan.maxStaffRoles,
          unlimitedStaffRoles: plan.maxStaffRoles == null,
          maxAssets: plan.maxAssets == null ? "" : plan.maxAssets,
          unlimitedAssets: plan.maxAssets == null,
          maxCategories: plan.maxCategories == null ? "" : plan.maxCategories,
          unlimitedCategories: plan.maxCategories == null,
          allowBulkScan: Boolean(plan.allowBulkScan),
          allowBatchDispatch: Boolean(plan.allowBatchDispatch),
          allowReports: Boolean(plan.allowReports),
          status: String(plan.status || "active").toLowerCase(),
        });
        setLoadError("");
      })
      .catch((error) => {
        if (!isActive) return;
        const message = getApiErrorMessage(
          error,
          "Unable to load plan details",
        );
        setLoadError(message);
        toast.error(message);
      })
      .finally(() => {
        if (isActive) setIsLoadingDetails(false);
      });

    return () => {
      isActive = false;
    };
  }, [id, isEditing]);

  if (isLoadingDetails) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate("/superadmin/plans")}
            rounded="8px"
            size="sm"
            variant="outline"
          >
            Back to Plans
          </Button>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <CardSkeleton lines={6} />
            <CardSkeleton lines={6} />
          </div>
          <div>
            <CardSkeleton lines={10} />
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <Button
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate("/superadmin/plans")}
          rounded="8px"
          size="sm"
          variant="outline"
        >
          Back to Plans
        </Button>
        <Alert variant="danger">
          <p className="m-0 font-bold">Error Loading Plan</p>
          <p className="m-0 mt-1 text-sm">{loadError}</p>
        </Alert>
      </div>
    );
  }

  // Live preview values
  const previewPrice = Number(formik.values.price) || 0;
  const isEnterprise =
    formik.values.code?.includes("enterprise") ||
    formik.values.name?.toLowerCase().includes("enterprise");
  const isPro =
    formik.values.code?.includes("pro") ||
    formik.values.name?.toLowerCase().includes("pro");

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="m-0 text-2xl font-black text-(--theme-text-primary)">
              {isEditing
                ? `Edit Plan: ${formik.values.name || "Subscription Plan"}`
                : "Create New Subscription Plan"}
            </h1>
            <p className="m-0 text-sm font-medium text-(--theme-text-secondary)">
              {isEditing
                ? "Update pricing, resource quotas, and capability entitlements for this plan."
                : "Configure a new laundry tier with quotas, scanner limits, and feature flags."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            disabled={formik.isSubmitting}
            onClick={() => navigate("/superadmin/plans")}
            rounded="10px"
            size="md"
            variant="outline"
          >
            Cancel
          </Button>

          <Button
            leftIcon={isEditing ? <Save size={16} /> : <Plus size={16} />}
            loading={formik.isSubmitting}
            onClick={formik.handleSubmit}
            rounded="10px"
            size="md"
            type="submit"
          >
            {isEditing ? "Save Changes" : "Create Plan"}
          </Button>
        </div>
      </section>

      {/* Main Grid: Form (2 cols) + Live Preview (1 col) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 0: Target Portal & Audience */}
          <Card>
            <div className="mb-3 flex items-center justify-between border-b border-(--theme-border-soft) pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-(--color-aurora-teal)/10 text-(--color-aurora-teal)">
                  <Building2 size={18} />
                </span>
                <div>
                  <h3 className="m-0 text-base font-bold text-(--theme-text-primary)">
                    Target Portal & Audience
                  </h3>
                  <p className="m-0 text-xs text-(--theme-text-muted)">
                    Choose whether this subscription tier is built for commercial Laundries or client Businesses.
                  </p>
                </div>
              </div>
              <Badge
                size="sm"
                variant={formik.values.targetType === "business" ? "secondary" : "teal"}
              >
                {formik.values.targetType === "business" ? "Business Tier" : "Laundry Tier"}
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  formik.setFieldValue("targetType", "laundry");
                  if (!isEditing && formik.values.code.startsWith("business-")) {
                    formik.setFieldValue("code", formik.values.code.replace("business-", "laundry-"));
                  }
                }}
                className={`relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                  formik.values.targetType === "laundry"
                    ? "border-(--color-aurora-teal) bg-(--color-aurora-teal)/8 shadow-sm"
                    : "border-(--theme-border-soft) bg-(--theme-surface-soft) hover:border-(--theme-border-strong)"
                }`}
              >
                <div
                  className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                    formik.values.targetType === "laundry"
                      ? "bg-(--color-aurora-teal) text-white"
                      : "bg-(--theme-surface-strong) text-(--theme-text-muted)"
                  }`}
                >
                  <ScanLine size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-(--theme-text-primary)">
                      Commercial Laundry
                    </span>
                    {formik.values.targetType === "laundry" && (
                      <span className="rounded-full bg-(--color-aurora-teal) p-0.5 text-white">
                        <Check size={11} />
                      </span>
                    )}
                  </div>
                  <p className="m-0 mt-1 text-xs text-(--theme-text-muted) leading-relaxed">
                    Industrial & commercial laundry plants managing client businesses, linen processing, bulk RFID scanning, and dispatch.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  formik.setFieldValue("targetType", "business");
                  if (!isEditing && formik.values.code.startsWith("laundry-")) {
                    formik.setFieldValue("code", formik.values.code.replace("laundry-", "business-"));
                  }
                }}
                className={`relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                  formik.values.targetType === "business"
                    ? "border-(--color-sky-blue) bg-(--color-sky-blue)/8 shadow-sm"
                    : "border-(--theme-border-soft) bg-(--theme-surface-soft) hover:border-(--theme-border-strong)"
                }`}
              >
                <div
                  className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                    formik.values.targetType === "business"
                      ? "bg-(--color-sky-blue) text-white"
                      : "bg-(--theme-surface-strong) text-(--theme-text-muted)"
                  }`}
                >
                  <Building2 size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-(--theme-text-primary)">
                      Business Organization
                    </span>
                    {formik.values.targetType === "business" && (
                      <span className="rounded-full bg-(--color-sky-blue) p-0.5 text-white">
                        <Check size={11} />
                      </span>
                    )}
                  </div>
                  <p className="m-0 mt-1 text-xs text-(--theme-text-muted) leading-relaxed">
                    Hotels, hospitals, and enterprises managing linen assets, categories, tracking items, and sending batches to laundries.
                  </p>
                </div>
              </button>
            </div>
          </Card>

          {/* Card 1: Basic Information */}
          <Card>
            <div className="mb-4 flex items-center gap-2 border-b border-(--theme-border-soft) pb-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-(--color-aurora-teal)/10 text-(--color-aurora-teal)">
                <CreditCard size={18} />
              </span>
              <div>
                <h3 className="m-0 text-base font-bold text-(--theme-text-primary)">
                  Basic Tier Information
                </h3>
                <p className="m-0 text-xs text-(--theme-text-muted)">
                  Public plan name, internal identifier, pricing, and billing
                  cycle.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  error={formik.touched.name && formik.errors.name}
                  helperText={formik.touched.name && formik.errors.name}
                  label="Plan Tier Name"
                  leftIcon={<CreditCard size={16} />}
                  name="name"
                  onBlur={formik.handleBlur}
                  onChange={(value) => {
                    formik.setFieldValue("name", value);
                    if (
                      !isEditing &&
                      !formik.touched.code &&
                      !formik.values.code
                    ) {
                      const prefix =
                        formik.values.targetType === "business"
                          ? "business-"
                          : "laundry-";
                      const slug =
                        prefix +
                        value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-+|-+$/g, "");
                      formik.setFieldValue("code", slug);
                    }
                  }}
                  placeholder="e.g. Starter, Professional, Enterprise"
                  required
                  value={formik.values.name}
                />

                <Input
                  error={formik.touched.code && formik.errors.code}
                  helperText={
                    (formik.touched.code && formik.errors.code) ||
                    `Unique identifier code (e.g. ${
                      formik.values.targetType === "business"
                        ? "business-starter"
                        : "laundry-starter"
                    }).`
                  }
                  label="Identifier Code"
                  leftIcon={<Code2 size={16} />}
                  name="code"
                  onBlur={formik.handleBlur}
                  onChange={(value) =>
                    formik.setFieldValue("code", value.toLowerCase())
                  }
                  placeholder={
                    formik.values.targetType === "business"
                      ? "e.g. business-pro"
                      : "e.g. laundry-pro"
                  }
                  required
                  value={formik.values.code}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  error={formik.touched.price && formik.errors.price}
                  helperText={formik.touched.price && formik.errors.price}
                  label="Price (USD)"
                  leftIcon={<DollarSign size={16} />}
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  onBlur={formik.handleBlur}
                  onChange={(value) => formik.setFieldValue("price", value)}
                  placeholder="49.00"
                  required
                  value={formik.values.price}
                />

                <Dropdown
                  label="Billing Cycle"
                  name="billingCycle"
                  onChange={(value) =>
                    formik.setFieldValue("billingCycle", value)
                  }
                  options={billingCycleOptions}
                  value={formik.values.billingCycle}
                />
              </div>

              <Input
                error={formik.touched.description && formik.errors.description}
                helperText={
                  formik.touched.description && formik.errors.description
                }
                label="Plan Description"
                leftIcon={<FileText size={16} />}
                name="description"
                onBlur={formik.handleBlur}
                onChange={(value) => formik.setFieldValue("description", value)}
                placeholder={
                  formik.values.targetType === "business"
                    ? "e.g. Built for hotels and hospitals managing daily linen quotas."
                    : "e.g. Tailored for commercial laundries needing RFID scanner quotas."
                }
                value={formik.values.description}
              />
            </div>
          </Card>

          {/* Card 2: Quotas & Usage Limits */}
          <Card>
            <div className="mb-4 flex items-center justify-between border-b border-(--theme-border-soft) pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-(--color-sky-blue)/10 text-(--color-sky-blue)">
                  <ScanLine size={18} />
                </span>
                <div>
                  <h3 className="m-0 text-base font-bold text-(--theme-text-primary)">
                    {formik.values.targetType === "business"
                      ? "Business Quotas & Limits"
                      : "Laundry Quotas & Limits"}
                  </h3>
                  <p className="m-0 text-xs text-(--theme-text-muted)">
                    Set maximum resource counts or toggle Unlimited per
                    resource across modules.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Linked Partner Quota */}
              <div className="rounded-xl border border-(--theme-border-soft) p-3.5 bg-(--theme-surface-soft)">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-(--theme-text-primary)">
                    <Building2
                      size={15}
                      className="text-(--color-aurora-teal)"
                    />
                    {formik.values.targetType === "business"
                      ? "Linked Laundries"
                      : "Linked Businesses"}
                  </span>
                  <Toggle
                    checked={formik.values.unlimitedLinkedBusinesses}
                    onChange={(val) => {
                      formik.setFieldValue("unlimitedLinkedBusinesses", val);
                      if (val) formik.setFieldValue("maxLinkedBusinesses", "");
                    }}
                    label="Unlimited"
                    size="sm"
                  />
                </div>
                <Input
                  disabled={formik.values.unlimitedLinkedBusinesses}
                  error={
                    formik.touched.maxLinkedBusinesses &&
                    formik.errors.maxLinkedBusinesses
                  }
                  name="maxLinkedBusinesses"
                  type="number"
                  min="0"
                  onChange={(value) =>
                    formik.setFieldValue("maxLinkedBusinesses", value)
                  }
                  placeholder={
                    formik.values.unlimitedLinkedBusinesses
                      ? "∞ Unlimited"
                      : "e.g. 3"
                  }
                  value={
                    formik.values.unlimitedLinkedBusinesses
                      ? ""
                      : formik.values.maxLinkedBusinesses
                  }
                />
              </div>

              {/* Business-only Quota: Linen Categories */}
              {formik.values.targetType === "business" && (
                <div className="rounded-xl border border-(--theme-border-soft) p-3.5 bg-(--theme-surface-soft)">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-(--theme-text-primary)">
                      <Layers size={15} className="text-(--color-pending)" />
                      Linen Categories
                    </span>
                    <Toggle
                      checked={formik.values.unlimitedCategories}
                      onChange={(val) => {
                        formik.setFieldValue("unlimitedCategories", val);
                        if (val) formik.setFieldValue("maxCategories", "");
                      }}
                      label="Unlimited"
                      size="sm"
                    />
                  </div>
                  <Input
                    disabled={formik.values.unlimitedCategories}
                    error={
                      formik.touched.maxCategories && formik.errors.maxCategories
                    }
                    name="maxCategories"
                    type="number"
                    min="0"
                    onChange={(value) =>
                      formik.setFieldValue("maxCategories", value)
                    }
                    placeholder={
                      formik.values.unlimitedCategories
                        ? "∞ Unlimited"
                        : "e.g. 10"
                    }
                    value={
                      formik.values.unlimitedCategories
                        ? ""
                        : formik.values.maxCategories
                    }
                  />
                </div>
              )}

              {/* Business-only Quota: Linen Assets / Items */}
              {formik.values.targetType === "business" && (
                <div className="rounded-xl border border-(--theme-border-soft) p-3.5 bg-(--theme-surface-soft)">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-(--theme-text-primary)">
                      <Tag size={15} className="text-(--color-sky-blue)" />
                      Linen Assets / Items
                    </span>
                    <Toggle
                      checked={formik.values.unlimitedAssets}
                      onChange={(val) => {
                        formik.setFieldValue("unlimitedAssets", val);
                        if (val) formik.setFieldValue("maxAssets", "");
                      }}
                      label="Unlimited"
                      size="sm"
                    />
                  </div>
                  <Input
                    disabled={formik.values.unlimitedAssets}
                    error={formik.touched.maxAssets && formik.errors.maxAssets}
                    name="maxAssets"
                    type="number"
                    min="0"
                    onChange={(value) =>
                      formik.setFieldValue("maxAssets", value)
                    }
                    placeholder={
                      formik.values.unlimitedAssets
                        ? "∞ Unlimited"
                        : "e.g. 5000"
                    }
                    value={
                      formik.values.unlimitedAssets
                        ? ""
                        : formik.values.maxAssets
                    }
                  />
                </div>
              )}

              {/* Max Scanners */}
              <div className="rounded-xl border border-(--theme-border-soft) p-3.5 bg-(--theme-surface-soft)">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-(--theme-text-primary)">
                    <ScanLine size={15} className="text-(--color-sky-blue)" />
                    RFID Scanners
                  </span>
                  <Toggle
                    checked={formik.values.unlimitedScanners}
                    onChange={(val) => {
                      formik.setFieldValue("unlimitedScanners", val);
                      if (val) formik.setFieldValue("maxScanners", "");
                    }}
                    label="Unlimited"
                    size="sm"
                  />
                </div>
                <Input
                  disabled={formik.values.unlimitedScanners}
                  error={
                    formik.touched.maxScanners && formik.errors.maxScanners
                  }
                  name="maxScanners"
                  type="number"
                  min="0"
                  onChange={(value) =>
                    formik.setFieldValue("maxScanners", value)
                  }
                  placeholder={
                    formik.values.unlimitedScanners ? "∞ Unlimited" : "e.g. 2"
                  }
                  value={
                    formik.values.unlimitedScanners
                      ? ""
                      : formik.values.maxScanners
                  }
                />
              </div>

              {/* Max Staff */}
              <div className="rounded-xl border border-(--theme-border-soft) p-3.5 bg-(--theme-surface-soft)">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-(--theme-text-primary)">
                    <Users size={15} className="text-(--color-seafoam)" />
                    Staff Accounts
                  </span>
                  <Toggle
                    checked={formik.values.unlimitedStaff}
                    onChange={(val) => {
                      formik.setFieldValue("unlimitedStaff", val);
                      if (val) formik.setFieldValue("maxStaff", "");
                    }}
                    label="Unlimited"
                    size="sm"
                  />
                </div>
                <Input
                  disabled={formik.values.unlimitedStaff}
                  error={formik.touched.maxStaff && formik.errors.maxStaff}
                  name="maxStaff"
                  type="number"
                  min="0"
                  onChange={(value) => formik.setFieldValue("maxStaff", value)}
                  placeholder={
                    formik.values.unlimitedStaff ? "∞ Unlimited" : "e.g. 5"
                  }
                  value={
                    formik.values.unlimitedStaff ? "" : formik.values.maxStaff
                  }
                />
              </div>

              {/* Max Staff Roles */}
              <div className="rounded-xl border border-(--theme-border-soft) p-3.5 bg-(--theme-surface-soft)">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-(--theme-text-primary)">
                    <ShieldAlert size={15} className="text-(--admin-primary)" />
                    Staff Custom Roles
                  </span>
                  <Toggle
                    checked={formik.values.unlimitedStaffRoles}
                    onChange={(val) => {
                      formik.setFieldValue("unlimitedStaffRoles", val);
                      if (val) formik.setFieldValue("maxStaffRoles", "");
                    }}
                    label="Unlimited"
                    size="sm"
                  />
                </div>
                <Input
                  disabled={formik.values.unlimitedStaffRoles}
                  error={
                    formik.touched.maxStaffRoles && formik.errors.maxStaffRoles
                  }
                  name="maxStaffRoles"
                  type="number"
                  min="0"
                  onChange={(value) =>
                    formik.setFieldValue("maxStaffRoles", value)
                  }
                  placeholder={
                    formik.values.unlimitedStaffRoles ? "∞ Unlimited" : "e.g. 3"
                  }
                  value={
                    formik.values.unlimitedStaffRoles
                      ? ""
                      : formik.values.maxStaffRoles
                  }
                />
              </div>
            </div>
          </Card>

          {/* Card 3: Capabilities & Features */}
          <Card>
            <div className="mb-4 flex items-center gap-2 border-b border-(--theme-border-soft) pb-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-(--color-ready-bg) text-(--badge-ready-text)">
                <Check size={18} />
              </span>
              <div>
                <h3 className="m-0 text-base font-bold text-(--theme-text-primary)">
                  {formik.values.targetType === "business"
                    ? "Business Capabilities & Permissions"
                    : "Laundry Capabilities & Permissions"}
                </h3>
                <p className="m-0 text-xs text-(--theme-text-muted)">
                  Feature entitlements unlocked when subscribed to this tier.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-center justify-between rounded-xl border border-(--theme-border-soft) p-3.5 bg-(--theme-surface-soft)">
                <div>
                  <p className="m-0 text-xs font-bold text-(--theme-text-primary)">
                    Bulk Scanning
                  </p>
                  <p className="m-0 text-[11px] text-(--theme-text-muted)">
                    Multiple RFID reads
                  </p>
                </div>
                <Toggle
                  checked={formik.values.allowBulkScan}
                  onChange={(val) => formik.setFieldValue("allowBulkScan", val)}
                  size="sm"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-(--theme-border-soft) p-3.5 bg-(--theme-surface-soft)">
                <div>
                  <p className="m-0 text-xs font-bold text-(--theme-text-primary)">
                    Batch Dispatch
                  </p>
                  <p className="m-0 text-[11px] text-(--theme-text-muted)">
                    {formik.values.targetType === "business"
                      ? "Dispatch batches to laundry"
                      : "Bulk packing & delivery"}
                  </p>
                </div>
                <Toggle
                  checked={formik.values.allowBatchDispatch}
                  onChange={(val) =>
                    formik.setFieldValue("allowBatchDispatch", val)
                  }
                  size="sm"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-(--theme-border-soft) p-3.5 bg-(--theme-surface-soft)">
                <div>
                  <p className="m-0 text-xs font-bold text-(--theme-text-primary)">
                    Analytics & Reports
                  </p>
                  <p className="m-0 text-[11px] text-(--theme-text-muted)">
                    {formik.values.targetType === "business"
                      ? "Loss & wash cycle reports"
                      : "Historical data exports"}
                  </p>
                </div>
                <Toggle
                  checked={formik.values.allowReports}
                  onChange={(val) => formik.setFieldValue("allowReports", val)}
                  size="sm"
                />
              </div>
            </div>
          </Card>

          {/* Card 4: Status */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="m-0 text-sm font-bold text-(--theme-text-primary)">
                  Plan Status
                </h3>
                <p className="m-0 text-xs text-(--theme-text-muted)">
                  Active plans are visible for subscription checkout. Inactive
                  plans are archived.
                </p>
              </div>

              <div className="w-48">
                <Dropdown
                  name="status"
                  onChange={(value) => formik.setFieldValue("status", value)}
                  options={statusOptions}
                  value={formik.values.status}
                />
              </div>
            </div>
          </Card>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              disabled={formik.isSubmitting}
              onClick={() => navigate("/superadmin/plans")}
              rounded="10px"
              size="md"
              variant="outline"
            >
              Cancel
            </Button>

            <Button
              leftIcon={isEditing ? <Save size={16} /> : <Plus size={16} />}
              loading={formik.isSubmitting}
              onClick={formik.handleSubmit}
              rounded="10px"
              size="md"
              type="submit"
            >
              {isEditing ? "Save Changes" : "Create Plan"}
            </Button>
          </div>
        </div>

        {/* Right column: Live Plan Card Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-(--theme-text-muted)">
              Live Plan Card Preview
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-(--color-aurora-teal)">
              <Sparkles size={12} /> Real-time
            </span>
          </div>

          <Card
            className={`relative flex flex-col justify-between overflow-hidden border transition-all duration-200 ${
              isEnterprise
                ? "border-(--color-pending)/40"
                : isPro
                  ? "border-(--color-aurora-teal)/40"
                  : "border-(--theme-border-soft)"
            }`}
          >
            {/* Top decorative accent */}
            <div
              className={`absolute top-0 inset-x-0 h-1.5 ${
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
                  <div className="flex items-center gap-1.5 mb-1">
                    <Badge
                      size="xs"
                      variant={formik.values.targetType === "business" ? "secondary" : "teal"}
                    >
                      {formik.values.targetType === "business" ? "Business Plan" : "Laundry Plan"}
                    </Badge>
                  </div>
                  <h3 className="m-0 text-xl font-black text-(--theme-text-primary)">
                    {formik.values.name || "Untitled Tier"}
                  </h3>
                  <span className="mt-1 inline-block font-mono text-xs text-(--theme-text-muted)">
                    {formik.values.code || "plan-code"}
                  </span>
                </div>

                <Badge
                  leftIcon={
                    formik.values.status === "active" ? (
                      <CircleCheck size={12} />
                    ) : (
                      <CircleX size={12} />
                    )
                  }
                  size="sm"
                  variant={
                    formik.values.status === "active" ? "success" : "danger"
                  }
                >
                  {formik.values.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>

              {/* Price */}
              <div className="my-5 flex items-baseline gap-1.5">
                <span className="text-3xl font-black tracking-tight text-(--theme-text-primary)">
                  ${previewPrice.toFixed(2)}
                </span>
                <span className="text-sm font-semibold text-(--theme-text-muted)">
                  /{" "}
                  {formatBillingCycle(formik.values.billingCycle).toLowerCase()}
                </span>
              </div>

              {formik.values.description && (
                <p className="mb-5 text-xs text-(--theme-text-secondary) leading-relaxed">
                  {formik.values.description}
                </p>
              )}

              {/* Resource Quotas */}
              <div className="mb-5 rounded-xl bg-(--theme-surface-soft) p-3.5 space-y-2 border border-(--theme-border-soft)/50">
                <p className="m-0 mb-2 text-[11px] font-bold uppercase tracking-wider text-(--theme-text-muted)">
                  {formik.values.targetType === "business"
                    ? "Business Quotas"
                    : "Laundry Quotas"}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-(--theme-text-secondary)">
                    <Building2
                      size={14}
                      className="text-(--color-aurora-teal)"
                    />
                    {formik.values.targetType === "business"
                      ? "Linked Laundries"
                      : "Linked Businesses"}
                  </span>
                  <span className="font-bold text-(--theme-text-primary)">
                    {formik.values.unlimitedLinkedBusinesses ? (
                      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-(--color-aurora-teal)">
                        <InfinityIcon size={12} /> Unlimited
                      </span>
                    ) : (
                      formatQuota(formik.values.maxLinkedBusinesses)
                    )}
                  </span>
                </div>

                {formik.values.targetType === "business" && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-(--theme-text-secondary)">
                      <Layers size={14} className="text-(--color-pending)" />
                      Linen Categories
                    </span>
                    <span className="font-bold text-(--theme-text-primary)">
                      {formik.values.unlimitedCategories ? (
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-(--color-aurora-teal)">
                          <InfinityIcon size={12} /> Unlimited
                        </span>
                      ) : (
                        formatQuota(formik.values.maxCategories)
                      )}
                    </span>
                  </div>
                )}

                {formik.values.targetType === "business" && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-(--theme-text-secondary)">
                      <Tag size={14} className="text-(--color-sky-blue)" />
                      Linen Assets / Items
                    </span>
                    <span className="font-bold text-(--theme-text-primary)">
                      {formik.values.unlimitedAssets ? (
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-(--color-aurora-teal)">
                          <InfinityIcon size={12} /> Unlimited
                        </span>
                      ) : (
                        formatQuota(formik.values.maxAssets)
                      )}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-(--theme-text-secondary)">
                    <ScanLine size={14} className="text-(--color-sky-blue)" />
                    RFID Scanners
                  </span>
                  <span className="font-bold text-(--theme-text-primary)">
                    {formik.values.unlimitedScanners ? (
                      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-(--color-aurora-teal)">
                        <InfinityIcon size={12} /> Unlimited
                      </span>
                    ) : (
                      formatQuota(formik.values.maxScanners)
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-(--theme-text-secondary)">
                    <Users size={14} className="text-(--color-seafoam)" />
                    Staff Accounts
                  </span>
                  <span className="font-bold text-(--theme-text-primary)">
                    {formik.values.unlimitedStaff ? (
                      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-(--color-aurora-teal)">
                        <InfinityIcon size={12} /> Unlimited
                      </span>
                    ) : (
                      formatQuota(formik.values.maxStaff)
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-(--theme-text-secondary)">
                    <ShieldAlert size={14} className="text-(--admin-primary)" />
                    Custom Staff Roles
                  </span>
                  <span className="font-bold text-(--theme-text-primary)">
                    {formik.values.unlimitedStaffRoles ? (
                      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-(--color-aurora-teal)">
                        <InfinityIcon size={12} /> Unlimited
                      </span>
                    ) : (
                      formatQuota(formik.values.maxStaffRoles)
                    )}
                  </span>
                </div>
              </div>

              {/* Feature Capabilities */}
              <div className="mb-2 space-y-1.5 text-xs">
                <p className="m-0 mb-2 text-[11px] font-bold uppercase tracking-wider text-(--theme-text-muted)">
                  Features
                </p>

                <div className="flex items-center gap-2">
                  {formik.values.allowBulkScan ? (
                    <CircleCheck
                      size={14}
                      className="text-(--color-ready) shrink-0"
                    />
                  ) : (
                    <CircleX size={14} className="text-(--theme-text-muted) shrink-0" />
                  )}
                  <span
                    className={
                      formik.values.allowBulkScan
                        ? "text-(--theme-text-primary) font-medium"
                        : "text-(--theme-text-muted) line-through"
                    }
                  >
                    Bulk RFID Scanning
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {formik.values.allowBatchDispatch ? (
                    <CircleCheck
                      size={14}
                      className="text-(--color-ready) shrink-0"
                    />
                  ) : (
                    <CircleX size={14} className="text-(--theme-text-muted) shrink-0" />
                  )}
                  <span
                    className={
                      formik.values.allowBatchDispatch
                        ? "text-(--theme-text-primary) font-medium"
                        : "text-(--theme-text-muted) line-through"
                    }
                  >
                    {formik.values.targetType === "business"
                      ? "Batch Dispatch to Laundries"
                      : "Batch Dispatch Operations"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {formik.values.allowReports ? (
                    <CircleCheck
                      size={14}
                      className="text-(--color-ready) shrink-0"
                    />
                  ) : (
                    <CircleX size={14} className="text-(--theme-text-muted) shrink-0" />
                  )}
                  <span
                    className={
                      formik.values.allowReports
                        ? "text-(--theme-text-primary) font-medium"
                        : "text-(--theme-text-muted) line-through"
                    }
                  >
                    {formik.values.targetType === "business"
                      ? "Loss & Wash Cycle Reports"
                      : "Advanced Reports & Analytics"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlanForm;

import { useState } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  HouseWifi,
  Mail,
  PackageCheck,
  Radio,
  Tag,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../Components/UI/Button";
import Card from "../Components/UI/Card";
import Dropdown from "../Components/UI/Dropdown";
import Input from "../Components/UI/Input";
import OtpInput from "./components/OtpInput";

const businessSignupSteps = [
  { key: "account", label: "Account" },
  { key: "verify", label: "Verify" },
  { key: "profile", label: "Profile" },
  { key: "plan", label: "Plan" },
  { key: "done", label: "Done" },
];

const businessTypeOptions = [
  { label: "Hotel", value: "Hotel" },
  { label: "Hospital", value: "Hospital" },
  { label: "Spa & Wellness", value: "Spa & Wellness" },
  { label: "Restaurant", value: "Restaurant" },
  { label: "Commercial Laundry", value: "Commercial Laundry" },
];

const countryOptions = [
  { label: "United States", value: "United States" },
  { label: "Pakistan", value: "Pakistan" },
  { label: "United Kingdom", value: "United Kingdom" },
  { label: "United Arab Emirates", value: "United Arab Emirates" },
];

const planOptions = [
  {
    name: "Starter",
    icon: Zap,
    price: "$49",
    assets: "500",
    scanners: "2",
    staff: "5",
    reports: "Basic Reports",
    features: [
      "500 RFID-tagged assets",
      "2 scanner devices",
      "5 staff user accounts",
      "Basic inventory reports",
      "Email support",
    ],
  },
  {
    name: "Professional",
    icon: Radio,
    price: "$149",
    assets: "2,000",
    scanners: "8",
    staff: "20",
    reports: "Advanced Analytics",
    popular: true,
    features: [
      "2,000 RFID-tagged assets",
      "8 scanner devices",
      "20 staff user accounts",
      "Advanced analytics & exports",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    icon: Building2,
    price: "Custom",
    assets: "Unlimited",
    scanners: "Unlimited",
    staff: "Unlimited",
    reports: "Full Suite + Custom",
    features: [
      "Unlimited RFID assets",
      "Unlimited scanner devices",
      "Unlimited staff accounts",
      "Custom reporting & dashboards",
      "Dedicated account manager",
    ],
  },
];

const maskBusinessEmail = (email) => {
  if (!email || !email.includes("@")) return "your business email";
  const [name, domain] = email.split("@");
  const visible = name.slice(0, 2) || "ja";
  return `${visible}***@${domain}`;
};

const SummaryRow = ({ label, value, accent = false }) => (
  <div className="flex items-center justify-between gap-4 py-1">
    <span className="text-sm font-semibold text-(--theme-text-muted)">{label}</span>
    <span
      className="text-right text-sm font-black"
      style={{
        color: accent ? "var(--color-aurora-teal)" : "var(--theme-text-primary)",
      }}
    >
      {value}
    </span>
  </div>
);

const BusinessSignupStepper = ({ currentStep }) => (
  <div className="mx-auto mb-8 flex w-full max-w-2xl items-center justify-center px-2">
    {businessSignupSteps.map((step, index) => {
      const isComplete = index < currentStep;
      const isActive = index === currentStep;

      return (
        <div className="flex min-w-0 flex-1 items-center last:flex-none" key={step.key}>
          <div className="flex min-w-0 flex-col items-center gap-2">
            <div
              className="grid h-9 w-9 place-items-center rounded-full border text-sm font-black transition-all duration-200"
              style={{
                color: isComplete || isActive ? "#ffffff" : "var(--theme-text-muted)",
                background:
                  isComplete || isActive
                    ? "var(--gradient-aurora-flow)"
                    : "var(--theme-surface-strong)",
                borderColor:
                  isComplete || isActive
                    ? "rgba(20, 184, 166, 0.45)"
                    : "var(--theme-border-soft)",
                boxShadow:
                  isComplete || isActive
                    ? "0 10px 22px rgba(20, 184, 166, 0.22)"
                    : "inset 0 1px 0 rgba(255,255,255,0.28)",
              }}
            >
              {isComplete ? <Check size={16} strokeWidth={3} /> : index + 1}
            </div>
            <span
              className="max-w-16 truncate text-xs font-black"
              style={{
                color:
                  isActive || isComplete
                    ? "var(--color-aurora-teal)"
                    : "var(--theme-text-muted)",
              }}
            >
              {step.label}
            </span>
          </div>
          {index < businessSignupSteps.length - 1 && (
            <div
              className="mx-3 -mt-5 h-px flex-1"
              style={{
                background:
                  index < currentStep
                    ? "var(--gradient-aurora-flow)"
                    : "var(--theme-border-soft)",
              }}
            />
          )}
        </div>
      );
    })}
  </div>
);

const BusinessSignup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState("Professional");
  const [values, setValues] = useState({
    fullName: "",
    businessEmail: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
    otp: "",
    businessName: "",
    businessType: "Hospital",
    businessPhone: "",
    profileEmail: "",
    address: "",
    city: "",
    state: "",
    country: "United States",
    postalCode: "",
  });

  const setField = (field, value) => {
    setValues((current) => ({
      ...current,
      [field]: value,
      ...(field === "businessEmail" && !current.profileEmail
        ? { profileEmail: value }
        : null),
    }));
  };

  const nextStep = () =>
    setCurrentStep((step) => Math.min(step + 1, businessSignupSteps.length - 1));

  const handleAccountSubmit = (event) => {
    event.preventDefault();
    nextStep();
  };

  const selectedPlanData =
    planOptions.find((plan) => plan.name === selectedPlan) || planOptions[1];

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <form className="grid gap-4" onSubmit={handleAccountSubmit}>
          <div>
            <h1 className="m-0 text-2xl text-center font-black text-(--theme-text-primary)">
              Create Business Account
            </h1>
            
          </div>
          <Input
            label="Full Name"
            onChange={(value) => setField("fullName", value)}
            placeholder="Jane Smith"
            required
            value={values.fullName}
          />
          <Input
            label="Business Email"
            onChange={(value) => setField("businessEmail", value)}
            placeholder="jane@yourcompany.com"
            required
            type="email"
            value={values.businessEmail}
          />
          <Input
            label="Phone Number"
            onChange={(value) => setField("phone", value)}
            placeholder="+1 (555) 000-0000"
            required
            value={values.phone}
          />
          <Input
            label="Password"
            onChange={(value) => setField("password", value)}
            placeholder="Min. 8 characters"
            required
            type="password"
            value={values.password}
          />
          <Input
            label="Confirm Password"
            onChange={(value) => setField("confirmPassword", value)}
            placeholder="Re-enter your password"
            required
            type="password"
            value={values.confirmPassword}
          />
          <label className="flex items-start gap-3 text-sm font-semibold text-(--theme-text-secondary)">
            <input
              checked={values.acceptedTerms}
              className="mt-0.5 h-5 w-5 accent-(--color-aurora-teal)"
              onChange={(event) => setField("acceptedTerms", event.target.checked)}
              type="checkbox"
            />
            <span>
              I agree to the{" "}
              <button className="border-0 bg-transparent p-0 font-black text-(--color-aurora-teal)" type="button">
                Terms & Conditions
              </button>{" "}
              and{" "}
              <button className="border-0 bg-transparent p-0 font-black text-(--color-aurora-teal)" type="button">
                Privacy Policy
              </button>
            </span>
          </label>
          <Button fullWidth rightIcon={<ArrowRight size={17} />} size="lg" type="submit">
            Create Account
          </Button>
          <p className="m-0 text-center text-sm font-semibold text-(--theme-text-secondary)">
            Already have an account?{" "}
            <button
              className="border-0 bg-transparent p-0 font-black text-(--color-aurora-teal)"
              onClick={() => navigate("/business/login")}
              type="button"
            >
              Login
            </button>
          </p>
        </form>
      );
    }

    if (currentStep === 1) {
      return (
        <div className="grid gap-6 text-center">
          <div className="text-left">
            <h1 className="m-0 text-2xl font-black text-(--theme-text-primary)">
              Verify Your Email
            </h1>
            <p className="m-0 mt-2 text-sm font-semibold text-(--theme-text-secondary)">
              Enter the 6-digit code sent to your business email.
            </p>
          </div>
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-(--theme-border-soft) bg-(--button-secondary-bg) text-(--color-aurora-teal)">
            <Mail size={27} />
          </div>
          <p className="m-0 text-sm font-semibold text-(--theme-text-secondary)">
            We sent a 6-digit verification code to{" "}
            <span className="font-black text-(--theme-text-primary)">
              {maskBusinessEmail(values.businessEmail)}
            </span>
          </p>
          <OtpInput
            autoFocus
            label={null}
            onChange={(value) => setField("otp", value)}
            size="lg"
            value={values.otp}
          />
          <Button fullWidth onClick={nextStep} rightIcon={<ArrowRight size={17} />} size="lg">
            Verify Email
          </Button>
          <div className="grid gap-3 text-sm font-semibold text-(--theme-text-secondary)">
            <p className="m-0">
              Didn't receive it?{" "}
              <button className="border-0 bg-transparent p-0 font-black text-(--color-aurora-teal)" type="button">
                Resend code
              </button>
            </p>
            <p className="m-0">
              Wrong address?{" "}
              <button
                className="border-0 bg-transparent p-0 font-black text-(--color-aurora-teal)"
                onClick={() => setCurrentStep(0)}
                type="button"
              >
                Change email
              </button>
            </p>
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            nextStep();
          }}
        >
          <div>
            <h1 className="m-0 text-2xl font-black text-(--theme-text-primary)">
              Set Up Business Profile
            </h1>
            <p className="m-0 mt-2 text-sm font-semibold text-(--theme-text-secondary)">
              Add your business details to continue to plan selection.
            </p>
          </div>
          <Input
            label="Business Name"
            onChange={(value) => setField("businessName", value)}
            placeholder="e.g. Grand Hyatt Hotel"
            required
            value={values.businessName}
          />
          <Dropdown
            label="Business Type"
            onChange={(value) => setField("businessType", value)}
            options={businessTypeOptions}
            value={values.businessType}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Business Phone"
              onChange={(value) => setField("businessPhone", value)}
              placeholder="+1 (555) 000-0000"
              value={values.businessPhone}
            />
            <Input
              label="Business Email"
              onChange={(value) => setField("profileEmail", value)}
              placeholder="ops@company.com"
              type="email"
              value={values.profileEmail}
            />
          </div>
          <Input
            label="Business Address"
            onChange={(value) => setField("address", value)}
            placeholder="Street address"
            value={values.address}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="City"
              onChange={(value) => setField("city", value)}
              placeholder="City"
              value={values.city}
            />
            <Input
              label="State / Province"
              onChange={(value) => setField("state", value)}
              placeholder="State"
              value={values.state}
            />
            <Dropdown
              label="Country"
              onChange={(value) => setField("country", value)}
              options={countryOptions}
              value={values.country}
            />
            <Input
              label="Postal Code"
              onChange={(value) => setField("postalCode", value)}
              placeholder="00000"
              value={values.postalCode}
            />
          </div>
          <Button fullWidth rightIcon={<ArrowRight size={17} />} size="lg" type="submit">
            Continue
          </Button>
        </form>
      );
    }

    if (currentStep === 3) {
      return (
        <div className="grid gap-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="m-0 text-3xl font-black text-(--theme-text-primary)">
              Choose Your Plan
            </h1>
            <p className="m-0 mt-3 text-sm font-semibold leading-6 text-(--theme-text-secondary)">
              Select a plan to access the Business Admin portal, or start a 14-day
              free trial. No credit card required for trials.
            </p>
            <div className="mt-6 inline-flex rounded-xl border border-(--theme-border-soft) bg-(--button-ghost-bg) p-1">
              {["monthly", "yearly"].map((cycle) => (
                <button
                  className="rounded-lg border-0 px-5 py-2 text-sm font-black transition-all"
                  key={cycle}
                  onClick={() => setBillingCycle(cycle)}
                  style={{
                    color:
                      billingCycle === cycle
                        ? "var(--theme-text-primary)"
                        : "var(--theme-text-muted)",
                    background:
                      billingCycle === cycle
                        ? "var(--theme-surface-strong)"
                        : "transparent",
                    boxShadow:
                      billingCycle === cycle
                        ? "0 8px 18px rgba(21, 88, 96, 0.1)"
                        : "none",
                  }}
                  type="button"
                >
                  {cycle === "monthly" ? "Monthly" : "Yearly"}
                  {cycle === "yearly" && (
                    <span className="ml-2 text-[10px] text-(--color-ready)">
                      SAVE 20%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {planOptions.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlan === plan.name;

              return (
                <div
                  className="relative flex min-h-[480px] flex-col rounded-2xl border p-6 transition-all duration-200"
                  key={plan.name}
                  style={{
                    background:
                      "linear-gradient(145deg, var(--theme-surface-strong), var(--theme-surface))",
                    borderColor: isSelected
                      ? "rgba(20, 184, 166, 0.58)"
                      : "var(--theme-border-soft)",
                    boxShadow: isSelected
                      ? "0 18px 46px rgba(20, 184, 166, 0.18), inset 0 1px 0 rgba(255,255,255,0.24)"
                      : "var(--card-glass-shadow)",
                  }}
                >
                  {plan.popular && (
                    <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--color-aurora-teal) px-4 py-1 text-xs font-black text-white shadow-(--button-primary-shadow)">
                      MOST POPULAR
                    </span>
                  )}
                  <div className="grid h-9 w-9 place-items-center rounded-lg border border-(--theme-border-soft) bg-(--button-secondary-bg) text-(--color-aurora-teal)">
                    <Icon size={18} />
                  </div>
                  <h2 className="m-0 mt-5 text-xl font-black text-(--theme-text-primary)">
                    {plan.name}
                  </h2>
                  <p className="m-0 mt-5 text-3xl font-black text-(--theme-text-primary)">
                    {plan.price}
                    {plan.price !== "Custom" && (
                      <span className="text-sm font-bold text-(--theme-text-muted)"> / mo</span>
                    )}
                  </p>
                  <div className="mt-5 rounded-xl border border-(--theme-border-soft) bg-(--button-ghost-bg) p-4">
                    <SummaryRow label="Assets" value={plan.assets} />
                    <SummaryRow label="Scanners" value={plan.scanners} />
                    <SummaryRow label="Staff" value={plan.staff} />
                    <SummaryRow label="Reports" value={plan.reports} />
                  </div>
                  <ul className="m-0 mt-5 grid list-none gap-3 p-0">
                    {plan.features.map((feature) => (
                      <li
                        className="flex items-start gap-2 text-sm font-semibold text-(--theme-text-secondary)"
                        key={feature}
                      >
                        <Check size={15} className="mt-0.5 shrink-0 text-(--color-aurora-teal)" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto grid gap-3 pt-6">
                    <Button
                      fullWidth
                      onClick={() => {
                        setSelectedPlan(plan.name);
                        nextStep();
                      }}
                      variant={plan.name === "Enterprise" ? "outline" : "primary"}
                    >
                      {plan.name === "Enterprise" ? "Contact Sales" : "Start 14-Day Trial"}
                    </Button>
                    {plan.name !== "Enterprise" && (
                      <Button
                        fullWidth
                        onClick={() => setSelectedPlan(plan.name)}
                        variant={isSelected ? "secondary" : "outline"}
                      >
                        {isSelected ? "Selected" : "Select Plan"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="grid gap-6 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-(--badge-ready-border) bg-(--badge-ready-bg) text-(--color-ready)">
          <CheckCircle2 size={34} />
        </div>
        <div>
          <h1 className="m-0 text-2xl font-black text-(--theme-text-primary)">
            Business Account Created Successfully
          </h1>
          <p className="m-0 mt-3 text-sm font-semibold leading-6 text-(--theme-text-secondary)">
            Your ClothSync Business Admin portal is ready. Start adding assets,
            scanners, and linked laundry partners.
          </p>
        </div>
        <div className="rounded-2xl border border-(--theme-border-soft) bg-(--button-ghost-bg) p-4 text-left">
          <SummaryRow label="Business Name" value={values.businessName || "Grand Hotel"} />
          <SummaryRow label="Business Type" value={values.businessType || "Hospital"} />
          <SummaryRow
            accent
            label="Plan"
            value={`${selectedPlanData.name} - 14-Day Trial`}
          />
          <SummaryRow accent label="Account Status" value="Active" />
        </div>
        <div className="text-left">
          <p className="m-0 mb-3 text-xs font-black uppercase tracking-[0.16em] text-(--theme-text-muted)">
            Getting Started
          </p>
          {[
            { icon: Tag, text: "Add RFID assets and link tags" },
            { icon: HouseWifi, text: "Register your scanner devices" },
            { icon: PackageCheck, text: "Link laundry partners for dispatch" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div className="mt-3 flex items-center gap-3" key={item.text}>
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-(--button-secondary-bg) text-(--color-aurora-teal)">
                  <Icon size={15} />
                </span>
                <span className="text-sm font-semibold text-(--theme-text-secondary)">
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>
        <Button
          fullWidth
          onClick={() => navigate("/business/dashboard")}
          rightIcon={<ArrowRight size={17} />}
          size="lg"
        >
          Go to Dashboard
        </Button>
      </div>
    );
  };

  const isPlanStep = currentStep === 3;
  const isDoneStep = currentStep === 4;

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-8">
      <div className={`w-full ${isPlanStep ? "max-w-6xl" : "max-w-xl"}`}>
        <BusinessSignupStepper currentStep={currentStep} />
        <Card
          padding={isPlanStep ? "28px" : "32px"}
          rounded={isDoneStep ? "22px" : "18px"}
          shadow="shadow-(--layout-panel-shadow)"
        >
          {renderStepContent()}
        </Card>
      </div>
    </main>
  );
};

export default BusinessSignup;

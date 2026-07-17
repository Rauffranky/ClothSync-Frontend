import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
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
import Tabs from "../Components/UI/Tabs";
import { portalTabs } from "./authConfig";
import { getApiErrorMessage } from "../axios/api";
import {
  completeTenantProfile,
  resendTenantSignupOtp,
  signupTenant,
  verifyTenantSignupOtp,
} from "../axios/auth/tenantAuth";
import { storeAuthSessionFromResponse } from "../axios/auth/authSession";
import { toast } from "../Utils/toast";
import OtpInput from "./components/OtpInput";

const SHOW_PRICING_STEP = false;

const businessSignupSteps = [
  { key: "account", label: "Account" },
  { key: "verify", label: "Verify" },
  { key: "profile", label: "Profile" },
  ...(SHOW_PRICING_STEP ? [{ key: "plan", label: "Plan" }] : []),
  { key: "done", label: "Done" },
];

const OTP_EXPIRY_SECONDS = 10 * 60;

const formatOtpTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const accountSignupSchema = Yup.object({
  fullName: Yup.string().trim().required("Full name is required"),
  businessEmail: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Business email is required"),
  password: Yup.string()
    .required("Password is required")
    .matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, {
      message:
        "Password must be at least 8 characters and include both letters and numbers",
      excludeEmptyString: true,
    }),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm password is required"),
  acceptedTerms: Yup.boolean().oneOf(
    [true],
    "Please accept the Terms & Conditions and Privacy Policy",
  ),
});

const accountInitialValues = {
  fullName: "",
  businessEmail: "",
  password: "",
  confirmPassword: "",
  acceptedTerms: false,
};

const profileSchema = Yup.object({
  businessName: Yup.string().trim().required("Business name is required"),
  businessType: Yup.string().required("Business type is required"),
  businessPhone: Yup.string().trim().required("Business phone is required"),
  phoneCountryCode: Yup.string().required("Country code is required"),
  address: Yup.string().trim().required("Business address is required"),
  city: Yup.string().trim().required("City is required"),
  state: Yup.string().trim().required("State / province is required"),
  country: Yup.string().required("Country is required"),
  postalCode: Yup.string().trim().required("Postal code is required"),
});

const profileInitialValues = {
  businessName: "",
  businessType: "hospital",
  phoneCountryCode: "+1",
  businessPhone: "",
  address: "",
  city: "",
  state: "",
  country: "United States",
  postalCode: "",
};

const businessTypeOptions = [
  { label: "Hotel", value: "hotel" },
  { label: "Hospital", value: "hospital" },
  // { label: "Spa & Wellness", value: "Spa & Wellness" },
  // { label: "Restaurant", value: "Restaurant" },
  // { label: "Commercial Laundry", value: "Commercial Laundry" },
];

const phoneCountryOptions = [
  { label: "🇺🇸 +1", value: "+1" },
  { label: "🇵🇰 +92", value: "+92" },
  { label: "🇬🇧 +44", value: "+44" },
  { label: "🇦🇪 +971", value: "+971" },
];

const countryOptions = [
  { label: "United States", value: "United States" },
  { label: "Pakistan", value: "Pakistan" },
  { label: "United Kingdom", value: "United Kingdom" },
  { label: "United Arab Emirates", value: "United Arab Emirates" },
];

const TENANT_SIGNUP_PROGRESS_KEY = "tenant-signup-progress";

const writeTenantSignupProgress = (progress) => {
  try {
    sessionStorage.setItem(TENANT_SIGNUP_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Signup remains usable when browser storage is unavailable.
  }
};

const clearTenantSignupProgress = () => {
  try {
    sessionStorage.removeItem(TENANT_SIGNUP_PROGRESS_KEY);
  } catch {
    // Navigation should not be blocked when browser storage is unavailable.
  }
};

const readTenantSignupProgress = () => {
  try {
    const storedProgress = JSON.parse(
      sessionStorage.getItem(TENANT_SIGNUP_PROGRESS_KEY),
    );
    const storedStep = Number(storedProgress?.currentStep);
    const restoredStep =
      !SHOW_PRICING_STEP && storedStep === 4
        ? businessSignupSteps.length - 1
        : storedStep;

    return {
      currentStep:
        Number.isInteger(restoredStep) &&
        restoredStep >= 0 &&
        restoredStep < businessSignupSteps.length
          ? restoredStep
          : 0,
      fullName:
        typeof storedProgress?.fullName === "string"
          ? storedProgress.fullName
          : "",
      email:
        typeof storedProgress?.email === "string" ? storedProgress.email : "",
      verifiedTenantUserId:
        typeof storedProgress?.verifiedTenantUserId === "string"
          ? storedProgress.verifiedTenantUserId
          : "",
      otpExpiresAt:
        Number.isFinite(storedProgress?.otpExpiresAt)
          ? storedProgress.otpExpiresAt
          : null,
      profile: {
        ...profileInitialValues,
        ...(storedProgress?.profile && typeof storedProgress.profile === "object"
          ? storedProgress.profile
          : null),
      },
      completedProfile:
        storedProgress?.completedProfile &&
        typeof storedProgress.completedProfile === "object"
          ? {
              businessName:
                typeof storedProgress.completedProfile.businessName === "string"
                  ? storedProgress.completedProfile.businessName
                  : "",
              businessType:
                typeof storedProgress.completedProfile.businessType === "string"
                  ? storedProgress.completedProfile.businessType
                  : "",
              status:
                typeof storedProgress.completedProfile.status === "string"
                  ? storedProgress.completedProfile.status
                  : "Active",
            }
          : null,
    };
  } catch {
    return {
      currentStep: 0,
      fullName: "",
      email: "",
      verifiedTenantUserId: "",
      otpExpiresAt: null,
      profile: profileInitialValues,
      completedProfile: null,
    };
  }
};

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

const getTenantUserId = (response) =>
  response?.userId ??
  response?.data?.userId ??
  response?.user?.id ??
  response?.user?._id ??
  response?.data?.user?.id ??
  response?.data?.user?._id;

const getCompletedProfileDisplay = (response, submittedProfile) => {
  const payload = response?.data ?? response;
  const identity = payload?.user ?? payload?.tenant ?? payload;
  const profile =
    payload?.businessProfile ??
    payload?.business ??
    identity?.businessProfile ??
    identity?.business ??
    identity?.profile ??
    identity;

  return {
    businessName: profile?.businessName ?? submittedProfile.businessName,
    businessType: profile?.businessType ?? submittedProfile.businessType,
    status: identity?.status ?? profile?.status ?? "Active",
  };
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

const BusinessSignup = ({ portal }) => {
  const navigate = useNavigate();
  const [savedProgress] = useState(readTenantSignupProgress);
  const [currentStep, setCurrentStep] = useState(savedProgress.currentStep);
  const [otpSecondsRemaining, setOtpSecondsRemaining] = useState(() =>
    savedProgress.otpExpiresAt
      ? Math.max(0, Math.ceil((savedProgress.otpExpiresAt - Date.now()) / 1000))
      : 0,
  );
  const [otpExpiresAt, setOtpExpiresAt] = useState(savedProgress.otpExpiresAt);
  const [otpError, setOtpError] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [verifiedTenantUserId, setVerifiedTenantUserId] = useState(
    savedProgress.verifiedTenantUserId,
  );
  const [completedProfile, setCompletedProfile] = useState(
    savedProgress.completedProfile,
  );
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState("Professional");
  const [values, setValues] = useState({
    fullName: savedProgress.fullName,
    businessEmail: savedProgress.email,
    phone: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
    otp: "",
    businessName: savedProgress.profile.businessName,
    businessType: savedProgress.profile.businessType,
    businessPhone: savedProgress.profile.businessPhone,
    profileEmail: savedProgress.email,
    address: savedProgress.profile.address,
    city: savedProgress.profile.city,
    state: savedProgress.profile.state,
    country: savedProgress.profile.country,
    postalCode: savedProgress.profile.postalCode,
    timezone: "",
    avatar: "",
  });

  const startOtpTimer = () => {
    setOtpSecondsRemaining(OTP_EXPIRY_SECONDS);
    setOtpExpiresAt(Date.now() + OTP_EXPIRY_SECONDS * 1000);
  };

  useEffect(() => {
    if (currentStep !== 1 || !otpExpiresAt || otpSecondsRemaining <= 0) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setOtpSecondsRemaining(
        Math.max(0, Math.ceil((otpExpiresAt - Date.now()) / 1000)),
      );
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [currentStep, otpExpiresAt, otpSecondsRemaining]);

  const accountFormik = useFormik({
    initialValues: {
      ...accountInitialValues,
      fullName: savedProgress.fullName,
      businessEmail: savedProgress.email,
    },
    validationSchema: accountSignupSchema,
    onSubmit: async (accountValues) => {
      const fullName = accountValues.fullName.trim();
      const email = accountValues.businessEmail.trim();

      try {
        const response = await signupTenant({
          fullName,
          email,
          password: accountValues.password,
          confirmPassword: accountValues.confirmPassword,
        });

        setValues((current) => ({
          ...current,
          ...accountValues,
          fullName,
          businessEmail: email,
          profileEmail: email,
          otp: "",
        }));
        toast.success(response?.message || "Verification code sent successfully");
        setOtpError("");
        setVerifiedTenantUserId("");
        setCompletedProfile(null);
        startOtpTimer();
        setCurrentStep(1);
      } catch (error) {
        toast.error(
          getApiErrorMessage(
            error,
            "Unable to create the account. Please try again.",
          ),
        );
      }
    },
  });

  const profileFormik = useFormik({
    initialValues: savedProgress.profile,
    validationSchema: profileSchema,
    onSubmit: async (profileValues) => {
      if (!verifiedTenantUserId) {
        toast.error("Verified tenant user ID is missing. Please verify your email again.");
        return;
      }

      const localPhone = profileValues.businessPhone
        .replace(/\D/g, "")
        .replace(/^0+/, "");
      const phone = `${profileValues.phoneCountryCode}${localPhone}`;
      const timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

      try {
        const response = await completeTenantProfile({
          userId: verifiedTenantUserId,
          businessName: profileValues.businessName,
          businessType: profileValues.businessType,
          phone,
          address: profileValues.address,
          city: profileValues.city,
          state: profileValues.state,
          country: profileValues.country,
          postalCode: profileValues.postalCode,
          timezone,
          avatar: "",
        });

        storeAuthSessionFromResponse(response);
        const completedProfileDisplay = getCompletedProfileDisplay(
          response,
          profileValues,
        );
        setCompletedProfile(completedProfileDisplay);
        setValues((current) => ({
          ...current,
          ...profileValues,
          businessName: completedProfileDisplay.businessName,
          businessType: completedProfileDisplay.businessType,
          businessPhone: phone,
          timezone,
          avatar: "",
        }));
        toast.success(response?.message || "Business profile saved successfully");
        setCurrentStep(businessSignupSteps.length - 1);
      } catch (error) {
        toast.error(
          getApiErrorMessage(
            error,
            "Unable to save the business profile. Please try again.",
          ),
        );
      }
    },
  });

  useEffect(() => {
    writeTenantSignupProgress({
      currentStep,
      fullName: values.fullName,
      email: values.businessEmail,
      verifiedTenantUserId,
      otpExpiresAt,
      profile: profileFormik.values,
      completedProfile,
    });
  }, [
    currentStep,
    completedProfile,
    otpExpiresAt,
    profileFormik.values,
    values.businessEmail,
    values.fullName,
    verifiedTenantUserId,
  ]);

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

  const getAccountFieldError = (field) =>
    accountFormik.touched[field] && accountFormik.errors[field]
      ? accountFormik.errors[field]
      : "";

  const bindAccountInput = (field) => ({
    name: field,
    onBlur: accountFormik.handleBlur,
    onChange: (value) => accountFormik.setFieldValue(field, value),
    value: accountFormik.values[field],
    error: Boolean(getAccountFieldError(field)),
    helperText: getAccountFieldError(field),
  });

  const getProfileFieldError = (field) =>
    profileFormik.touched[field] && profileFormik.errors[field]
      ? profileFormik.errors[field]
      : "";

  const bindProfileInput = (field) => ({
    name: field,
    onBlur: profileFormik.handleBlur,
    onChange: (value) => profileFormik.setFieldValue(field, value),
    value: profileFormik.values[field],
    error: Boolean(getProfileFieldError(field)),
    helperText: getProfileFieldError(field),
  });

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(values.otp)) {
      setOtpError("Please enter the complete 6 digit OTP");
      return;
    }

    if (otpSecondsRemaining <= 0) {
      setOtpError("OTP has expired. Please request a new code.");
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError("");

    try {
      const response = await verifyTenantSignupOtp({
        email: values.businessEmail,
        otp: values.otp,
      });
      const userId = getTenantUserId(response);

      if (!userId) {
        throw new Error("Email verified, but no tenant user ID was returned");
      }

      storeAuthSessionFromResponse(response);
      setVerifiedTenantUserId(userId);
      toast.success(response?.message || "Email verified successfully");
      setCurrentStep(2);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Unable to verify the OTP. Please try again.",
      );
      setOtpError(message);
      toast.error(message);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResendingOtp(true);
    setOtpError("");

    try {
      const response = await resendTenantSignupOtp({
        email: values.businessEmail,
      });
      setField("otp", "");
      startOtpTimer();
      toast.success(response?.message || "A new verification code was sent");
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to resend the OTP. Please try again.",
        ),
      );
    } finally {
      setIsResendingOtp(false);
    }
  };

  const completedBusinessType =
    completedProfile?.businessType || values.businessType;
  const completedBusinessTypeLabel =
    businessTypeOptions.find((option) => option.value === completedBusinessType)
      ?.label ?? completedBusinessType;

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <form className="grid gap-4" onSubmit={accountFormik.handleSubmit}>
          <div className="mb-2 flex items-start">
            <div>
              <p className="m-0 text-sm font-bold text-(--theme-text-secondary)">
                {portal?.title || "Business Admin"}
              </p>
              <h1 className="m-0 mt-1 text-3xl font-black text-(--theme-text-primary)">
                Create Account
              </h1>
            </div>
          </div>

          <Tabs
            className="mb-3"
            items={portalTabs}
            onChange={(nextPortal) => navigate(`/${nextPortal}/signup`)}
            value={portal?.value || "business"}
          />
          <Input
            label="Full Name"
            placeholder="Jane Smith"
            required
            {...bindAccountInput("fullName")}
          />
          <Input
            label="Business Email"
            placeholder="jane@yourcompany.com"
            required
            type="email"
            {...bindAccountInput("businessEmail")}
          />
          {/* <Input
            label="Phone Number"
            onChange={(value) => setField("phone", value)}
            placeholder="+1 (555) 000-0000"
            required
            value={values.phone}
          /> */}
          <Input
            label="Password"
            placeholder="8+ characters with letters and numbers"
            required
            type="password"
            {...bindAccountInput("password")}
          />
          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            required
            type="password"
            {...bindAccountInput("confirmPassword")}
          />
          <label className="flex items-start gap-3 text-sm font-semibold text-(--theme-text-secondary)">
            <input
              aria-describedby="accepted-terms-error"
              aria-invalid={Boolean(getAccountFieldError("acceptedTerms"))}
              checked={accountFormik.values.acceptedTerms}
              className="mt-0.5 h-5 w-5 accent-(--color-aurora-teal)"
              name="acceptedTerms"
              onBlur={accountFormik.handleBlur}
              onChange={accountFormik.handleChange}
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
          {getAccountFieldError("acceptedTerms") && (
            <p
              className="m-0 text-xs text-(--color-overdue)"
              id="accepted-terms-error"
            >
              {getAccountFieldError("acceptedTerms")}
            </p>
          )}
          <Button
            fullWidth
            loading={accountFormik.isSubmitting}
            rightIcon={<ArrowRight size={17} />}
            size="lg"
            type="submit"
          >
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
            error={Boolean(otpError)}
            helperText={otpError}
            label={null}
            onChange={(value) => {
              setField("otp", value);
              if (otpError) setOtpError("");
            }}
            size="lg"
            value={values.otp}
          />
          <p
            aria-live={otpSecondsRemaining === 0 ? "polite" : "off"}
            className="m-0 text-sm font-bold text-(--theme-text-secondary)"
          >
            {otpSecondsRemaining > 0
              ? `Code expires in ${formatOtpTime(otpSecondsRemaining)}`
              : "This verification code has expired."}
          </p>
          <Button
            disabled={otpSecondsRemaining <= 0}
            fullWidth
            loading={isVerifyingOtp}
            onClick={handleVerifyOtp}
            rightIcon={<ArrowRight size={17} />}
            size="lg"
          >
            Verify Email
          </Button>
          <div className="grid gap-3 text-sm font-semibold text-(--theme-text-secondary)">
            <p className="m-0">
              Didn't receive it?{" "}
              <button
                className="border-0 bg-transparent p-0 font-black text-(--color-aurora-teal) disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isResendingOtp}
                onClick={handleResendOtp}
                type="button"
              >
                {isResendingOtp ? "Sending..." : "Resend code"}
              </button>
            </p>
            <p className="m-0">
              Wrong address?{" "}
              <button
                className="border-0 bg-transparent p-0 font-black text-(--color-aurora-teal)"
                onClick={() => {
                  setOtpError("");
                  setCurrentStep(0);
                }}
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
        <form className="grid gap-4" onSubmit={profileFormik.handleSubmit}>
          <div>
            <h1 className="m-0 text-2xl font-black text-(--theme-text-primary)">
              Set Up Business Profile
            </h1>
            <p className="m-0 mt-2 text-sm font-semibold text-(--theme-text-secondary)">
              Add your business details to finish setting up your account.
            </p>
          </div>
          <Input
            label="Business Name"
            placeholder="e.g. Grand Hyatt Hotel"
            required
            {...bindProfileInput("businessName")}
          />
          <Dropdown
            label="Business Type"
            name="businessType"
            onChange={(value) => profileFormik.setFieldValue("businessType", value)}
            options={businessTypeOptions}
            value={profileFormik.values.businessType}
          />
          <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
            <Dropdown
              label="Country Code"
              name="phoneCountryCode"
              onChange={(value) =>
                profileFormik.setFieldValue("phoneCountryCode", value)
              }
              options={phoneCountryOptions}
              value={profileFormik.values.phoneCountryCode}
            />
            <Input
              label="Business Phone"
              placeholder="555 000 0000"
              required
              type="tel"
              {...bindProfileInput("businessPhone")}
            />
          </div>
          <Input
            disabled
            helperText="Verified signup email"
            label="Business Email"
            type="email"
            value={values.businessEmail}
          />
          <Input
            label="Business Address"
            placeholder="Street address"
            required
            {...bindProfileInput("address")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="City"
              placeholder="City"
              required
              {...bindProfileInput("city")}
            />
            <Input
              label="State / Province"
              placeholder="State"
              required
              {...bindProfileInput("state")}
            />
            <Dropdown
              label="Country"
              name="country"
              onChange={(value) => profileFormik.setFieldValue("country", value)}
              options={countryOptions}
              value={profileFormik.values.country}
            />
            <Input
              label="Postal Code"
              placeholder="00000"
              required
              {...bindProfileInput("postalCode")}
            />
          </div>
          <Button
            fullWidth
            loading={profileFormik.isSubmitting}
            rightIcon={<ArrowRight size={17} />}
            size="lg"
            type="submit"
          >
            Complete Profile
          </Button>
        </form>
      );
    }

    if (SHOW_PRICING_STEP && currentStep === 3) {
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
          <SummaryRow
            label="Business Name"
            value={completedProfile?.businessName || values.businessName || "Not provided"}
          />
          <SummaryRow
            label="Business Type"
            value={completedBusinessTypeLabel || "Not provided"}
          />
          <SummaryRow
            accent
            label="Account Status"
            value={completedProfile?.status || "Active"}
          />
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
          onClick={() => {
            clearTenantSignupProgress();
            navigate("/business/dashboard");
          }}
          rightIcon={<ArrowRight size={17} />}
          size="lg"
        >
          Go to Dashboard
        </Button>
      </div>
    );
  };

  const isPlanStep = SHOW_PRICING_STEP && currentStep === 3;
  const isDoneStep = currentStep === businessSignupSteps.length - 1;

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

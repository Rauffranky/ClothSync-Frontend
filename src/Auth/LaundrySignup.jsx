import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Tag,
  HouseWifi,
  PackageCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../Components/UI/Button";
import Card from "../Components/UI/Card";
import Dropdown from "../Components/UI/Dropdown";
import Input from "../Components/UI/Input";
import Tabs from "../Components/UI/Tabs";
import OtpInput from "./components/OtpInput";
import ReactPhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
const PhoneInput = ReactPhoneInput.default || ReactPhoneInput;
import { portalTabs } from "./authConfig";
import { getApiErrorMessage } from "../axios/api";
import { toast } from "../Utils/toast";
import {
  signupLaundry,
  verifyLaundrySignupOtp,
  resendLaundrySignupOtp,
  completeLaundryProfile,
} from "../axios/auth/laundryAuth";
import { storeAuthSessionFromResponse } from "../axios/auth/authSession";

const getLaundryUserId = (response) =>
  response?.userId ??
  response?.data?.userId ??
  response?.user?.id ??
  response?.user?._id ??
  response?.data?.user?.id ??
  response?.data?.user?._id;

const laundrySignupSteps = [
  { key: "account", label: "Account" },
  { key: "verify", label: "Verify" },
  { key: "profile", label: "Profile" },
  { key: "done", label: "Done" },
];

const accountSchema = Yup.object({
  fullName: Yup.string().trim().required("Full name is required"),
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email address is required"),
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

const profileSchema = Yup.object({
  laundryName: Yup.string().trim().required("Laundry name is required"),
  phone: Yup.string().trim().required("Phone number is required"),
  address: Yup.string().trim().required("Address is required"),
  city: Yup.string().trim().required("City is required"),
  state: Yup.string().trim().required("State / province is required"),
  country: Yup.string().required("Country is required"),
  postalCode: Yup.string().trim().required("Postal code is required"),
});



const countryOptions = [
  { label: "United States", value: "United States" },
  { label: "Pakistan", value: "Pakistan" },
  { label: "United Kingdom", value: "United Kingdom" },
  { label: "United Arab Emirates", value: "United Arab Emirates" },
];

const maskEmail = (email) => {
  if (!email || !email.includes("@")) return "your email";
  const [name, domain] = email.split("@");
  const visible = name.slice(0, 2) || "**";
  return `${visible}***@${domain}`;
};

const LaundrySignupStepper = ({ currentStep }) => (
  <div className="mx-auto mb-8 flex w-full max-w-2xl items-center justify-center px-2">
    {laundrySignupSteps.map((step, index) => {
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
          {index < laundrySignupSteps.length - 1 && (
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

const LaundrySignup = ({ portal }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [signupEmail, setSignupEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifiedLaundryUserId, setVerifiedLaundryUserId] = useState("");
  const [completedProfile, setCompletedProfile] = useState(null);

  const accountFormik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptedTerms: false,
    },
    validationSchema: accountSchema,
    onSubmit: async (values) => {
      try {
        const response = await signupLaundry({
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
        });
        setSignupEmail(values.email.trim());
        setOtpValue("");
        setOtpError("");
        toast.success(response?.message || "Verification code sent successfully");
        setCurrentStep(1);
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Unable to create the account. Please try again.")
        );
      }
    },
  });

  const profileFormik = useFormik({
    initialValues: {
      laundryName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "United States",
      postalCode: "",
    },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          userId: verifiedLaundryUserId,
          companyName: values.laundryName,
          contactPersonName: accountFormik.values.fullName,
          password: accountFormik.values.password,
          confirmPassword: accountFormik.values.confirmPassword,
          phone: values.phone.startsWith("+") ? values.phone : `+${values.phone}`,
          address: values.address,
          city: values.city,
          state: values.state,
          country: values.country,
          postalCode: values.postalCode,
        };

        const response = await completeLaundryProfile(payload);

        storeAuthSessionFromResponse(response);
        setCompletedProfile({
          laundryName: values.laundryName,
          city: values.city,
          country: values.country,
        });
        toast.success(response?.message || "Profile completed successfully");
        setCurrentStep(3); // Go to done step
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Unable to complete profile. Please try again.")
        );
      }
    },
  });

  const getAccountError = (field) =>
    accountFormik.touched[field] && accountFormik.errors[field]
      ? accountFormik.errors[field]
      : "";

  const bindAccount = (field) => ({
    name: field,
    onBlur: accountFormik.handleBlur,
    onChange: (value) => accountFormik.setFieldValue(field, value),
    value: accountFormik.values[field],
    error: Boolean(getAccountError(field)),
    helperText: getAccountError(field),
  });

  const getProfileError = (field) =>
    profileFormik.touched[field] && profileFormik.errors[field]
      ? profileFormik.errors[field]
      : "";

  const bindProfile = (field) => ({
    name: field,
    onBlur: profileFormik.handleBlur,
    onChange: (value) => profileFormik.setFieldValue(field, value),
    value: profileFormik.values[field],
    error: Boolean(getProfileError(field)),
    helperText: getProfileError(field),
  });

  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otpValue)) {
      setOtpError("Please enter the complete 6 digit OTP");
      return;
    }
    
    setIsVerifyingOtp(true);
    setOtpError("");
    
    try {
      const response = await verifyLaundrySignupOtp({
        email: signupEmail,
        otp: otpValue,
      });

      const userId = getLaundryUserId(response);
      if (userId) {
        setVerifiedLaundryUserId(userId);
      }

      storeAuthSessionFromResponse(response);
      toast.success(response?.message || "Email verified successfully");
      setCurrentStep(2);
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to verify the OTP. Please try again.");
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
      const response = await resendLaundrySignupOtp({ email: signupEmail });
      setOtpValue("");
      toast.success(response?.message || "A new verification code was sent");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to resend the OTP. Please try again.")
      );
    } finally {
      setIsResendingOtp(false);
    }
  };

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <form className="grid gap-4" onSubmit={accountFormik.handleSubmit}>
          <div className="mb-2 flex items-start">
            <div>
              <p className="m-0 text-sm font-bold text-(--theme-text-secondary)">
                {portal.title}
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
            value={portal.value}
          />

          <Input
            label="Full Name"
            placeholder="Jane Smith"
            required
            {...bindAccount("fullName")}
          />
          <Input
            label="Email"
            placeholder="jane@yourlaundry.com"
            required
            type="email"
            {...bindAccount("email")}
          />
          <Input
            label="Password"
            placeholder="8+ characters with letters and numbers"
            required
            type="password"
            {...bindAccount("password")}
          />
          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            required
            type="password"
            {...bindAccount("confirmPassword")}
          />

          <label className="flex items-start gap-3 text-sm font-semibold text-(--theme-text-secondary)">
            <input
              aria-describedby="laundry-accepted-terms-error"
              aria-invalid={Boolean(getAccountError("acceptedTerms"))}
              checked={accountFormik.values.acceptedTerms}
              className="mt-0.5 h-5 w-5 accent-(--color-aurora-teal)"
              name="acceptedTerms"
              onBlur={accountFormik.handleBlur}
              onChange={accountFormik.handleChange}
              type="checkbox"
            />
            <span>
              I agree to the{" "}
              <button
                className="border-0 bg-transparent p-0 font-black text-(--color-aurora-teal)"
                type="button"
              >
                Terms &amp; Conditions
              </button>{" "}
              and{" "}
              <button
                className="border-0 bg-transparent p-0 font-black text-(--color-aurora-teal)"
                type="button"
              >
                Privacy Policy
              </button>
            </span>
          </label>
          {getAccountError("acceptedTerms") && (
            <p
              className="m-0 text-xs text-(--color-overdue)"
              id="laundry-accepted-terms-error"
            >
              {getAccountError("acceptedTerms")}
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
              onClick={() => navigate(`/${portal.value}/login`)}
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
              Enter the 6-digit code sent to your email.
            </p>
          </div>

          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-(--theme-border-soft) bg-(--button-secondary-bg) text-(--color-aurora-teal)">
            <Mail size={27} />
          </div>

          <p className="m-0 text-sm font-semibold text-(--theme-text-secondary)">
            We sent a 6-digit verification code to{" "}
            <span className="font-black text-(--theme-text-primary)">
              {maskEmail(signupEmail)}
            </span>
          </p>

          <OtpInput
            autoFocus
            error={Boolean(otpError)}
            helperText={otpError}
            label={null}
            onChange={(value) => {
              setOtpValue(value);
              if (otpError) setOtpError("");
            }}
            size="lg"
            value={otpValue}
          />

          <Button
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
              Didn&apos;t receive it?{" "}
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
              Set Up Laundry Profile
            </h1>
            <p className="m-0 mt-2 text-sm font-semibold text-(--theme-text-secondary)">
              Add your laundry details to finish setting up your account.
            </p>
          </div>

          <Input
            label="Laundry Name"
            leftIcon={<Building2 size={18} />}
            placeholder="e.g. Sparkle Laundry Services"
            required
            {...bindProfile("laundryName")}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-(--theme-text-secondary)">
              Phone Number
            </label>
            <PhoneInput
              country={"us"}
              value={profileFormik.values.phone}
              onChange={(phone) => profileFormik.setFieldValue("phone", phone)}
              inputStyle={{
                width: "100%",
                height: "46px",
                borderRadius: "14px",
                borderColor: getProfileError("phone") ? "var(--color-overdue)" : "var(--theme-border-soft)",
                backgroundColor: "var(--theme-surface-strong)",
                color: "var(--theme-text-primary)",
                fontSize: "14px",
                fontWeight: "500",
                paddingLeft: "48px",
              }}
              buttonStyle={{
                borderTopLeftRadius: "14px",
                borderBottomLeftRadius: "14px",
                borderColor: getProfileError("phone") ? "var(--color-overdue)" : "var(--theme-border-soft)",
                backgroundColor: "var(--theme-surface-strong)",
              }}
              dropdownStyle={{
                backgroundColor: "var(--theme-bg)",
                color: "var(--theme-text-primary)",
              }}
            />
            {getProfileError("phone") && (
              <p className="m-0 text-xs text-(--color-overdue)">
                {getProfileError("phone")}
              </p>
            )}
          </div>

          <Input
            disabled
            helperText="Verified signup email"
            label="Email"
            leftIcon={<Mail size={18} />}
            type="email"
            value={signupEmail}
          />

          <Input
            label="Address"
            leftIcon={<MapPin size={18} />}
            placeholder="Street address"
            required
            {...bindProfile("address")}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="City"
              placeholder="City"
              required
              {...bindProfile("city")}
            />
            <Input
              label="State / Province"
              placeholder="State"
              required
              {...bindProfile("state")}
            />
            <Dropdown
              label="Country"
              name="country"
              onChange={(value) =>
                profileFormik.setFieldValue("country", value)
              }
              options={countryOptions}
              value={profileFormik.values.country}
            />
            <Input
              label="Postal Code"
              placeholder="00000"
              required
              {...bindProfile("postalCode")}
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

    return (
      <div className="grid gap-6 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-(--badge-ready-border) bg-(--badge-ready-bg) text-(--color-ready)">
          <CheckCircle2 size={34} />
        </div>

        <div>
          <h1 className="m-0 text-2xl font-black text-(--theme-text-primary)">
            Laundry Account Created Successfully
          </h1>
          <p className="m-0 mt-3 text-sm font-semibold leading-6 text-(--theme-text-secondary)">
            Your ClothSync Laundry portal is ready. You can now manage laundry
            operations and track RFID assets.
          </p>
        </div>

        <div className="rounded-2xl border border-(--theme-border-soft) bg-(--button-ghost-bg) p-4 text-left">
          <SummaryRow
            label="Laundry Name"
            value={completedProfile?.laundryName || "Not provided"}
          />
          <SummaryRow
            label="City"
            value={completedProfile?.city || "Not provided"}
          />
          <SummaryRow
            accent
            label="Account Status"
            value="Active"
          />
        </div>

        <div className="text-left">
          <p className="m-0 mb-3 text-xs font-black uppercase tracking-[0.16em] text-(--theme-text-muted)">
            Getting Started
          </p>
          {[
            { icon: Tag, text: "Track RFID-tagged laundry assets" },
            { icon: HouseWifi, text: "Connect your scanner devices" },
            { icon: PackageCheck, text: "Manage dispatch and inventory" },
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
          onClick={() => navigate("/laundry/dashboard")}
          rightIcon={<ArrowRight size={17} />}
          size="lg"
        >
          Go to Dashboard
        </Button>
      </div>
    );
  };

  const isDoneStep = currentStep === laundrySignupSteps.length - 1;

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl">
        <LaundrySignupStepper currentStep={currentStep} />
        <Card
          padding="32px"
          rounded={isDoneStep ? "22px" : "18px"}
          shadow="shadow-(--layout-panel-shadow)"
        >
          {renderStepContent()}
        </Card>
      </div>
    </main>
  );
};

export default LaundrySignup;

import { useEffect, useMemo, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ArrowLeft,
  Building2,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Button from "../../Components/UI/Button";
import Input from "../../Components/UI/Input";
import Tabs from "../../Components/UI/Tabs";
import { usePageMeta } from "../../Hooks/usePageMeta";
import { applyThemeMode, getThemeMode } from "../../Utils/themeMode";
import Card from "../../Components/UI/Card";

const portalTabs = [
  {
    label: "Business",
    value: "business",
    icon: <Building2 size={16} />,
    title: "Business / Tenant",
    dashboardPath: "/business/dashboard",
  },
  {
    label: "Laundry",
    value: "laundry",
    icon: <Users size={16} />,
    title: "Laundry Staff",
    dashboardPath: "/laundry/dashboard",
  },
];

const getPortal = (role) =>
  portalTabs.find((item) => item.value === role) || portalTabs[0];

const initialAuthValues = {
  name: "",
  companyName: "",
  email: "",
  password: "",
  forgotEmail: "",
  otp: "",
  newPassword: "",
  confirmPassword: "",
};

const loginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email address is required"),
  password: Yup.string().required("Password is required"),
});

const signupSchema = Yup.object({
  name: Yup.string().trim().required("Full name is required"),
  companyName: Yup.string().trim().required("Business/Laundry name is required"),
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email address is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const forgotEmailSchema = Yup.object({
  forgotEmail: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email address is required"),
});

const otpSchema = Yup.object({
  otp: Yup.string()
    .matches(/^\d{6}$/, "Please enter the complete 6 digit OTP")
    .required("OTP is required"),
});

const resetPasswordSchema = Yup.object({
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords do not match")
    .required("Confirm password is required"),
});

const forgotStepContent = {
  email: {
    title: "Forgot Password",
    description: "Enter your email address to receive a verification code.",
  },
  otp: {
    title: "Enter OTP",
    description: "Enter the verification code sent to your email address.",
  },
  reset: {
    title: "Change Password",
    description: "Create a new password for your account.",
  },
};

const AuthPage = ({ defaultMode = "login", defaultRole = "business" }) => {
  const params = useParams();
  const navigate = useNavigate();
  const routeMode = params.mode || defaultMode;
  const routeRole = params.role || defaultRole;
  const mode = routeMode === "signup" ? "signup" : "login";
  const portal = getPortal(routeRole);
  const isSignup = mode === "signup";
  const [authFlow, setAuthFlow] = useState("login");
  const [forgotStep, setForgotStep] = useState("email");
  const otpInputRefs = useRef([]);
  const isForgotFlow = authFlow === "forgot" && !isSignup;
  const forgotContent = forgotStepContent[forgotStep];
  const validationSchema = useMemo(() => {
    if (isForgotFlow) {
      if (forgotStep === "email") return forgotEmailSchema;
      if (forgotStep === "otp") return otpSchema;
      return resetPasswordSchema;
    }

    return isSignup ? signupSchema : loginSchema;
  }, [forgotStep, isForgotFlow, isSignup]);

  const pageTitle = useMemo(
    () =>
      `${isForgotFlow ? forgotContent.title : isSignup ? "Sign Up" : "Login"} | ${portal.title}`,
    [forgotContent.title, isForgotFlow, isSignup, portal.title],
  );

  usePageMeta({
    title: pageTitle,
    meta: [
      {
        name: "description",
        content: "Business and laundry staff authentication for RFID Laundry.",
      },
    ],
  });

  useEffect(() => {
    applyThemeMode(getThemeMode());
  }, []);

  const formik = useFormik({
    initialValues: initialAuthValues,
    validationSchema,
    onSubmit: () => {
      if (isForgotFlow) {
        formik.setTouched({});

        if (forgotStep === "email") {
          setForgotStep("otp");
          window.setTimeout(() => otpInputRefs.current[0]?.focus(), 0);
          return;
        }

        if (forgotStep === "otp") {
          setForgotStep("reset");
          return;
        }

        closeForgotPassword();
        return;
      }

      navigate(portal.dashboardPath);
    },
  });

  const getFieldError = (field) =>
    formik.touched[field] && formik.errors[field] ? formik.errors[field] : "";

  const bindInput = (field) => ({
    name: field,
    onBlur: formik.handleBlur,
    onChange: (value) => formik.setFieldValue(field, value),
    value: formik.values[field],
    error: Boolean(getFieldError(field)),
    helperText: getFieldError(field),
  });

  const handlePortalChange = (nextPortal) => {
    navigate(`/${nextPortal}/${mode}`);
  };

  const openForgotPassword = () => {
    setAuthFlow("forgot");
    setForgotStep("email");
    formik.setTouched({});
    formik.setFieldValue("forgotEmail", formik.values.email, false);
    formik.setFieldValue("otp", "", false);
    formik.setFieldValue("newPassword", "", false);
    formik.setFieldValue("confirmPassword", "", false);
  };

  const closeForgotPassword = () => {
    setAuthFlow("login");
    setForgotStep("email");
    formik.setTouched({});
    formik.setFieldValue("otp", "", false);
    formik.setFieldValue("newPassword", "", false);
    formik.setFieldValue("confirmPassword", "", false);
  };

  const handleOtpChange = (index, value) => {
    const digits = value.replace(/\D/g, "");
    const currentOtp = formik.values.otp.padEnd(6, " ").split("");

    if (digits.length > 1) {
      digits
        .slice(0, 6 - index)
        .split("")
        .forEach((digit, digitIndex) => {
          currentOtp[index + digitIndex] = digit;
        });
      formik.setFieldValue("otp", currentOtp.join("").replace(/\s/g, ""));
      otpInputRefs.current[Math.min(index + digits.length, 5)]?.focus();
      return;
    }

    currentOtp[index] = digits;
    formik.setFieldValue("otp", currentOtp.join("").replace(/\s/g, ""));

    if (digits && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (index, event) => {
    event.preventDefault();

    const pastedDigits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6 - index);
    if (!pastedDigits) return;

    const currentOtp = formik.values.otp.padEnd(6, " ").split("");
    pastedDigits.split("").forEach((digit, digitIndex) => {
      currentOtp[index + digitIndex] = digit;
    });

    formik.setFieldValue("otp", currentOtp.join("").replace(/\s/g, ""));
    formik.setFieldTouched("otp", true, false);
    otpInputRefs.current[Math.min(index + pastedDigits.length, 5)]?.focus();
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key !== "Backspace" || formik.values.otp[index]) return;
    otpInputRefs.current[index - 1]?.focus();
  };

  const switchModePath = isSignup
    ? `/${portal.value}/login`
    : `/${portal.value}/signup`;

  if (routeRole === "superadmin") {
    return <Navigate replace to="/superadmin/login" />;
  }

  return (
    <>
      <main className="relative flex min-h-screen items-center justify-center">
        <Card padding="30px">
          <form className="w-120 max-w-full" onSubmit={formik.handleSubmit}>
            <div className="mb-6 flex items-start ">
              <div>
                <p className="m-0 text-sm font-bold text-(--theme-text-secondary)">
                  {portal.title}
                </p>
                <h2 className="m-0 mt-1 text-3xl font-black text-(--theme-text-primary)">
                  {isForgotFlow
                    ? forgotContent.title
                    : isSignup
                      ? "Sign Up"
                      : "Login"}
                </h2>
                {isForgotFlow && (
                  <p className="m-0 mt-2 max-w-88 text-sm font-semibold leading-5 text-(--theme-text-secondary)">
                    {forgotContent.description}
                  </p>
                )}
              </div>
            </div>

            {!isForgotFlow && (
              <Tabs
                className="mb-5"
                items={portalTabs}
                onChange={handlePortalChange}
                value={portal.value}
              />
            )}

            <div className="grid gap-4">
              {isForgotFlow ? (
                <>
                  {forgotStep === "email" && (
                    <Input
                      label="Email"
                      leftIcon={<Mail size={18} />}
                      placeholder="Enter email address"
                      required
                      type="email"
                      {...bindInput("forgotEmail")}
                    />
                  )}

                  {forgotStep === "otp" && (
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-(--theme-text-secondary)">
                        <ShieldCheck size={18} />
                        OTP <span className="text-(--color-overdue)">*</span>
                      </label>
                      <div className="grid grid-cols-6 gap-2">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <input
                            aria-label={`OTP digit ${index + 1}`}
                            className="h-12 min-w-0 rounded-xl border bg-transparent text-center text-lg font-black outline-none transition-all duration-200"
                            inputMode="numeric"
                            key={index}
                            maxLength={1}
                            onBlur={() => formik.setFieldTouched("otp", true)}
                            onChange={(event) => handleOtpChange(index, event.target.value)}
                            onKeyDown={(event) => handleOtpKeyDown(index, event)}
                            onPaste={(event) => handleOtpPaste(index, event)}
                            ref={(element) => {
                              otpInputRefs.current[index] = element;
                            }}
                            style={{
                              color: "var(--theme-text-primary)",
                              background:
                                "linear-gradient(145deg, var(--theme-surface-strong), var(--theme-surface))",
                              borderColor: getFieldError("otp")
                                ? "rgba(239, 68, 68, 0.55)"
                                : "var(--theme-border-soft)",
                              boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.18)",
                            }}
                            type="text"
                            value={formik.values.otp[index] || ""}
                          />
                        ))}
                      </div>
                      {getFieldError("otp") && (
                        <p className="mt-1.5 text-xs text-(--color-overdue)">
                          {getFieldError("otp")}
                        </p>
                      )}
                    </div>
                  )}

                  {forgotStep === "reset" && (
                    <>
                      <Input
                        leftIcon={<KeyRound size={18} />}
                        label="New Password"
                        placeholder="Enter new password"
                        required
                        type="password"
                        {...bindInput("newPassword")}
                      />
                      <Input
                        leftIcon={<LockKeyhole size={18} />}
                        label="Confirm Password"
                        placeholder="Confirm new password"
                        required
                        type="password"
                        {...bindInput("confirmPassword")}
                      />
                    </>
                  )}
                </>
              ) : isSignup ? (
                <>
                  <Input
                    leftIcon={<Users size={18} />}
                    label="Full Name"
                    placeholder="Enter full name"
                    required
                    {...bindInput("name")}
                  />
                  <Input
                    leftIcon={<Building2 size={18} />}
                    label={
                      portal.value === "business"
                        ? "Business Name"
                        : "Laundry Name"
                    }
                    placeholder={
                      portal.value === "business"
                        ? "Enter business name"
                        : "Enter laundry name"
                    }
                    required
                    {...bindInput("companyName")}
                  />
                </>
              ) : null}

              {!isForgotFlow && (
                <>
                  <Input
                    label="Email"
                    leftIcon={<Mail size={18} />}
                    placeholder="Enter email address"
                    required
                    type="email"
                    {...bindInput("email")}
                  />

                  <div>
                    <Input
                      leftIcon={<LockKeyhole size={18} />}
                      label="Password"
                      placeholder="Enter password"
                      required
                      type="password"
                      {...bindInput("password")}
                    />
                    {!isSignup && (
                      <button
                        className="mt-2 cursor-pointer block border-0 bg-transparent p-0 text-sm font-bold text-(--color-aurora-teal) hover:underline"
                        onClick={openForgotPassword}
                        type="button"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            <Button className="mt-6" fullWidth size="lg" type="submit">
              {isForgotFlow
                ? forgotStep === "email"
                  ? "Send OTP"
                  : forgotStep === "otp"
                    ? "Verify OTP"
                    : "Change Password"
                : isSignup
                  ? "Create Account"
                  : "Login"}
            </Button>

            {isForgotFlow ? (
              <button
                className="mx-auto mt-5 flex items-center gap-2 border-0 bg-transparent p-0 text-sm font-bold text-(--theme-text-secondary) hover:text-(--color-aurora-teal)"
                onClick={closeForgotPassword}
                type="button"
              >
                <ArrowLeft size={15} />
                Back to login
              </button>
            ) : (
              <p className="m-0 mt-5 text-center text-sm font-semibold text-(--theme-text-secondary)">
                {isSignup ? "Already have an account?" : "Need an account?"}{" "}
                <Link
                  className="text-(--color-aurora-teal) hover:underline"
                  to={switchModePath}
                >
                  {isSignup ? "Login" : "Sign up"}
                </Link>
              </p>
            )}
          </form>
        </Card>
      </main>
    </>
  );
};

export default AuthPage;

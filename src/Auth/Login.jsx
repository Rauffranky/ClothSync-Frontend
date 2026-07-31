import { useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ArrowLeft, KeyRound, LockKeyhole, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../Components/UI/Button";
import Card from "../Components/UI/Card";
import Input from "../Components/UI/Input";
import Tabs from "../Components/UI/Tabs";
import { portalTabs } from "./authConfig";
import OtpInput from "./components/OtpInput";
import {
  loginTenant,
  forgotTenantPassword,
  verifyTenantForgotPasswordOtp,
  resetTenantPassword,
} from "../axios/auth/tenantAuth";
import {
  clearAuthSession,
  storeAuthSessionFromResponse,
} from "../axios/auth/authSession";
import { 
  loginLaundry,
  forgotLaundryPassword,
  verifyLaundryForgotPasswordOtp,
  resetLaundryPassword,
} from "../axios/auth/laundryAuth";
import { getApiErrorMessage } from "../axios/api";
import { toast } from "../Utils/toast";
import { NAV } from "../Components/Layout/Dashboard/nav";
import { getFirstPermittedHref } from "../Utils/permissions";
import { connectSocket, getSocket } from "../socket/client";
import { SOCKET_EVENTS } from "../socket/events";

const initialLoginValues = {
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

const Login = ({ portal }) => {
  const navigate = useNavigate();
  const [authFlow, setAuthFlow] = useState("login");
  const [forgotStep, setForgotStep] = useState("email");
  const isForgotFlow = authFlow === "forgot";
  const forgotContent = forgotStepContent[forgotStep];
  const validationSchema = useMemo(() => {
    if (forgotStep === "email") return forgotEmailSchema;
    if (forgotStep === "otp") return otpSchema;
    return resetPasswordSchema;
  }, [forgotStep]);

  const formik = useFormik({
    initialValues: initialLoginValues,
    validationSchema: isForgotFlow ? validationSchema : loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      if (!isForgotFlow) {
        if (portal.value !== "business" && portal.value !== "laundry") {
          navigate(portal.dashboardPath);
          return;
        }

        try {
          const loginFn = portal.value === "business" ? loginTenant : loginLaundry;
          const response = await loginFn({
            email: values.email,
            password: values.password,
          });
          const socket = getSocket();
          const handleSocketAuthenticated = (data) => {
            console.log("SOCKET AUTHENTICATED:", data);
            socket.off("connect_error", handleSocketAuthError);
          };
          const handleSocketAuthError = (error) => {
            console.error("SOCKET AUTH ERROR:", error.message);
            socket.off(
              SOCKET_EVENTS.CONNECTED,
              handleSocketAuthenticated,
            );
          };

          socket.once(
            SOCKET_EVENTS.CONNECTED,
            handleSocketAuthenticated,
          );
          socket.once("connect_error", handleSocketAuthError);

          const accessToken = storeAuthSessionFromResponse(response);

          if (!accessToken) {
            socket.off(
              SOCKET_EVENTS.CONNECTED,
              handleSocketAuthenticated,
            );
            socket.off("connect_error", handleSocketAuthError);
            clearAuthSession();
            throw new Error("Login succeeded, but no access token was returned");
          }

          connectSocket();

          toast.success(response?.message || "Login successful");
          navigate(
            getFirstPermittedHref(NAV[portal.value]) || portal.dashboardPath,
            { replace: true },
          );
        } catch (error) {
          toast.error(getApiErrorMessage(error, "Unable to login. Please try again."));
        } finally {
          setSubmitting(false);
        }
        return;
      }

      if (forgotStep === "email") {
        try {
          const forgotFn = portal.value === "business" ? forgotTenantPassword : forgotLaundryPassword;
          const response = await forgotFn({ email: values.forgotEmail });
          toast.success(response?.message || "OTP sent successfully");
          setForgotStep("otp");
          formik.setTouched({});
        } catch (error) {
          toast.error(getApiErrorMessage(error, "Failed to send OTP. Please try again."));
        } finally {
          setSubmitting(false);
        }
        return;
      }

      if (forgotStep === "otp") {
        try {
          const verifyFn = portal.value === "business" ? verifyTenantForgotPasswordOtp : verifyLaundryForgotPasswordOtp;
          const response = await verifyFn({
            email: values.forgotEmail,
            otp: values.otp,
          });
          toast.success(response?.message || "OTP verified successfully");
          setForgotStep("reset");
          formik.setTouched({});
        } catch (error) {
          toast.error(getApiErrorMessage(error, "Failed to verify OTP. Please try again."));
        } finally {
          setSubmitting(false);
        }
        return;
      }

      try {
        const resetFn = portal.value === "business" ? resetTenantPassword : resetLaundryPassword;
        const response = await resetFn({
          email: values.forgotEmail,
          otp: values.otp,
          password: values.newPassword,
          confirmPassword: values.confirmPassword,
        });
        toast.success(response?.message || "Password reset successfully. You can now login.");
        closeForgotPassword();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to reset password. Please try again."));
      } finally {
        setSubmitting(false);
      }
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

  return (
    <main className="relative flex min-h-screen items-center justify-center">
      <Card padding="30px">
        <form className="w-120 max-w-full" onSubmit={formik.handleSubmit}>
          <div className="mb-6 flex items-start">
            <div>
              <p className="m-0 text-sm font-bold text-(--theme-text-secondary)">
                {portal.title}
              </p>
              <h2 className="m-0 mt-1 text-3xl font-black text-(--theme-text-primary)">
                {isForgotFlow ? forgotContent.title : "Login"}
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
              onChange={(nextPortal) => navigate(`/${nextPortal}/login`)}
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
                  <OtpInput
                    autoFocus
                    error={Boolean(getFieldError("otp"))}
                    helperText={getFieldError("otp")}
                    onBlur={() => formik.setFieldTouched("otp", true)}
                    onChange={(value) => formik.setFieldValue("otp", value)}
                    value={formik.values.otp}
                  />
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
            ) : (
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
                  <button
                    className="mt-2 block cursor-pointer border-0 bg-transparent p-0 text-sm font-bold text-(--color-aurora-teal) hover:underline"
                    onClick={openForgotPassword}
                    type="button"
                  >
                    Forgot password?
                  </button>
                </div>
              </>
            )}
          </div>

          <Button
            className="mt-6"
            fullWidth
            loading={formik.isSubmitting}
            size="lg"
            type="submit"
          >
            {isForgotFlow
              ? forgotStep === "email"
                ? "Send OTP"
                : forgotStep === "otp"
                  ? "Verify OTP"
                  : "Change Password"
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
              Need an account?{" "}
              <Link
                className="text-(--color-aurora-teal) hover:underline"
                to={`/${portal.value}/signup`}
              >
                Sign up
              </Link>
            </p>
          )}
        </form>
      </Card>
    </main>
  );
};

export default Login;

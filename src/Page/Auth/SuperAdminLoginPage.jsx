import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  LockKeyhole,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../../Components/UI/Button";
import Input from "../../Components/UI/Input";
import Card from "../../Components/UI/Card";
import Logo from "../../Components/Logo";
import { usePageMeta } from "../../Hooks/usePageMeta";
import { applyThemeMode, getThemeMode } from "../../Utils/themeMode";
import { loginSuperAdmin } from "../../axios/auth/superAdminAuth";
import {
  storeAuthSessionFromResponse,
  clearAuthSession,
} from "../../axios/auth/authSession";
import { getApiErrorMessage } from "../../axios/api";
import { toast } from "../../Utils/toast";

const loginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email address is required"),
  password: Yup.string().required("Password is required"),
});

const SuperAdminLoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  usePageMeta({
    title: "Super Admin Login | RFID Laundry",
    meta: [
      {
        name: "description",
        content:
          "Secure Super Admin portal login for the ClothSync RFID Laundry Management System.",
      },
    ],
  });

  useEffect(() => {
    applyThemeMode(getThemeMode());
  }, []);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await loginSuperAdmin({
          email: values.email,
          password: values.password,
        });

        const accessToken = storeAuthSessionFromResponse(response);

        if (!accessToken) {
          clearAuthSession();
          throw new Error("Login succeeded, but no access token was returned.");
        }

        toast.success(response?.message || "Welcome back, Super Admin!");
        navigate("/superadmin/dashboard", { replace: true });
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Invalid credentials. Please try again."),
        );
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

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background decorative blobs */}
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-120 w-120 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--gradient-aurora-flow)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-90 w-90 rounded-full opacity-20 blur-3xl"
        style={{
          background: "linear-gradient(135deg, #7c3aed 0%, #14b8a6 100%)",
        }}
      />

      <div className="relative z-10 w-full max-w-115 px-4">
        {/* Logo / Brand Header */}
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Logo className="h-14 w-auto mb-1" />
          <div>
            <p className="text-xs font-bold tracking-wider uppercase text-(--theme-text-secondary)">
              Super Admin Portal
            </p>
          </div>
        </div>

        {/* Card */}
        <Card padding="32px">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-(--color-aurora-teal)" />
              <h2 className="text-xl font-black text-(--theme-text-primary)">
                Admin Sign In
              </h2>
            </div>
            <p className="mt-1 text-sm font-medium text-(--theme-text-secondary)">
              Enter your Super Admin credentials to access the control panel.
            </p>
          </div>

          <form className="grid gap-4" onSubmit={formik.handleSubmit}>
            <Input
              label="Admin Email"
              leftIcon={<Mail size={18} />}
              placeholder="superadmin@clothsync.com"
              required
              type="email"
              {...bindInput("email")}
            />

            <div className="relative">
              <Input
                label="Password"
                leftIcon={<LockKeyhole size={18} />}
                placeholder="Enter admin password"
                required
                type={showPassword ? "text" : "password"}
                {...bindInput("password")}
                rightIcon={
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="flex items-center text-(--theme-text-muted) hover:text-(--theme-text-primary)"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
            </div>

            <Button
              className="mt-2"
              fullWidth
              loading={formik.isSubmitting}
              size="lg"
              type="submit"
            >
              Sign In to Dashboard
            </Button>
          </form>

          <p className="m-0 mt-5 text-center text-sm font-semibold text-(--theme-text-secondary)">
            Business or laundry user?{" "}
            <Link
              className="font-bold text-(--color-aurora-teal) hover:underline"
              to="/business/login"
            >
              Use portal login
            </Link>
          </p>
        </Card>

        {/* Footer note */}
        <p className="mt-5 text-center text-xs font-medium text-(--theme-text-muted)">
          Restricted access — authorized personnel only.
        </p>
      </div>
    </main>
  );
};

export default SuperAdminLoginPage;

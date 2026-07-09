import { useFormik } from "formik";
import * as Yup from "yup";
import { Building2, LockKeyhole, Mail, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../Components/UI/Button";
import Card from "../Components/UI/Card";
import Input from "../Components/UI/Input";
import Tabs from "../Components/UI/Tabs";
import { portalTabs } from "./authConfig";

const signupSchema = Yup.object({
  name: Yup.string().trim().required("Full name is required"),
  companyName: Yup.string().trim().required("Laundry name is required"),
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email address is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const LaundrySignup = ({ portal }) => {
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      name: "",
      companyName: "",
      email: "",
      password: "",
    },
    validationSchema: signupSchema,
    onSubmit: () => navigate(portal.dashboardPath),
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
    <main className="relative flex min-h-screen items-center justify-center">
      <Card padding="30px">
        <form className="w-120 max-w-full" onSubmit={formik.handleSubmit}>
          <div className="mb-6 flex items-start">
            <div>
              <p className="m-0 text-sm font-bold text-(--theme-text-secondary)">
                {portal.title}
              </p>
              <h2 className="m-0 mt-1 text-3xl font-black text-(--theme-text-primary)">
                Sign Up
              </h2>
            </div>
          </div>

          <Tabs
            className="mb-5"
            items={portalTabs}
            onChange={(nextPortal) => navigate(`/${nextPortal}/signup`)}
            value={portal.value}
          />

          <div className="grid gap-4">
            <Input
              leftIcon={<Users size={18} />}
              label="Full Name"
              placeholder="Enter full name"
              required
              {...bindInput("name")}
            />
            <Input
              leftIcon={<Building2 size={18} />}
              label="Laundry Name"
              placeholder="Enter laundry name"
              required
              {...bindInput("companyName")}
            />
            <Input
              label="Email"
              leftIcon={<Mail size={18} />}
              placeholder="Enter email address"
              required
              type="email"
              {...bindInput("email")}
            />
            <Input
              leftIcon={<LockKeyhole size={18} />}
              label="Password"
              placeholder="Enter password"
              required
              type="password"
              {...bindInput("password")}
            />
          </div>

          <Button className="mt-6" fullWidth size="lg" type="submit">
            Create Account
          </Button>

          <p className="m-0 mt-5 text-center text-sm font-semibold text-(--theme-text-secondary)">
            Already have an account?{" "}
            <Link
              className="text-(--color-aurora-teal) hover:underline"
              to={`/${portal.value}/login`}
            >
              Login
            </Link>
          </p>
        </form>
      </Card>
    </main>
  );
};

export default LaundrySignup;

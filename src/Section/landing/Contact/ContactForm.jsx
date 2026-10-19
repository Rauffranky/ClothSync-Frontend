import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Input from "../../../Components/UI/Input";
import Button from "../../../Components/UI/Button";
import { SUPPORT_EMAIL } from "../../../Config/contact";

const validationSchema = Yup.object({
  fullName: Yup.string().trim().max(100).required("Please enter your name."),
  email: Yup.string()
    .trim()
    .email("Enter a valid email address.")
    .required("Please enter your email address."),
  organization: Yup.string().trim().max(160),
  message: Yup.string()
    .trim()
    .min(10, "Please include at least 10 characters.")
    .max(2000, "Please keep your message under 2,000 characters.")
    .required("Please enter your message."),
});

export default function ContactForm() {
  const [prepared, setPrepared] = useState(false);
  const formik = useFormik({
    initialValues: { fullName: "", email: "", organization: "", message: "" },
    validationSchema,
    onSubmit(values, helpers) {
      if (!SUPPORT_EMAIL) {
        helpers.setSubmitting(false);
        return;
      }
      const subject = `Trackly enquiry${values.organization.trim() ? ` - ${values.organization.trim()}` : ""}`;
      const body = `Name: ${values.fullName.trim()}\nEmail: ${values.email.trim()}\nOrganization: ${values.organization.trim() || "Not provided"}\n\n${values.message.trim()}`;
      window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setPrepared(true);
      helpers.setSubmitting(false);
    },
  });

  const field = (name, label, extra = {}) => {
    const error = formik.touched[name] && formik.errors[name];
    return (
      <Input
        name={name}
        label={label}
        aria-label={label}
        value={formik.values[name]}
        onChange={(value) => {
          setPrepared(false);
          formik.setFieldValue(name, value);
        }}
        onBlur={formik.handleBlur}
        error={Boolean(error)}
        helperText={error || ""}
        aria-invalid={Boolean(error)}
        {...extra}
      />
    );
  };

  return (
    <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {field("fullName", "Full name", {
          required: true,
          autoComplete: "name",
          placeholder: "Your name",
        })}
        {field("email", "Email address", {
          required: true,
          type: "email",
          autoComplete: "email",
          placeholder: "you@company.com",
        })}
      </div>
      {field("organization", "Business or laundry name", {
        autoComplete: "organization",
        placeholder: "Your organization (optional)",
      })}
      {field("message", "How can we help?", {
        required: true,
        multiline: true,
        rows: 5,
        maxLength: 2000,
        placeholder: "Tell us about your operation or question…",
      })}
      <p className="text-xs leading-6 text-(--theme-text-secondary)">
        Please don’t include passwords or private account details. Read our{" "}
        <LinkText to="/privacy-policy">Privacy Policy</LinkText> and{" "}
        <LinkText to="/terms-and-conditions">Terms & Conditions</LinkText>.
      </p>
      <Button
        type="submit"
        disabled={!SUPPORT_EMAIL}
        loading={formik.isSubmitting}
        rightIcon={<ArrowUpRight size={17} />}
      >
        Open email app
      </Button>
      {!SUPPORT_EMAIL && <p role="status" className="text-sm leading-7 text-(--theme-text-secondary)">Email contact is currently unavailable.</p>}
      {prepared && (
        <p
          role="status"
          className="text-sm leading-7 text-(--theme-text-secondary)"
        >
          Your email draft is ready. Send it from your email app. If no app
          opened, email{" "}
          <a
            className="text-(--color-aurora-teal) underline"
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            {SUPPORT_EMAIL}
          </a>{" "}
          directly.
        </p>
      )}
    </form>
  );
}

function LinkText({ to, children }) {
  return (
    <Link
      to={to}
      className="text-(--color-aurora-teal) underline underline-offset-2"
    >
      {children}
    </Link>
  );
}

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CircleUserRound,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  Phone,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Card from "../../../Components/UI/Card";
import Input from "../../../Components/UI/Input";
import { getApiErrorMessage } from "../../../axios/api";
import {
  acceptTenantLaundryInvite,
  handleTenantLaundryInvite,
} from "../../../axios/laundries/tenantLaundries";
import ReactPhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const PhoneInput = ReactPhoneInput.default || ReactPhoneInput;

const initialProfileValues = {
  companyName: "",
  contactPersonName: "",
  password: "",
  confirmPassword: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
};

const profileValidationSchema = Yup.object({
  companyName: Yup.string().trim().required("Laundry company name is required"),
  contactPersonName: Yup.string()
    .trim()
    .required("Contact person name is required"),
  password: Yup.string()
    .required("Password is required")
    .matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, {
      message:
        "Password must be at least 8 characters and include letters and numbers",
      excludeEmptyString: true,
    }),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm password is required"),
  phone: Yup.string().trim().required("Phone number is required"),
  address: Yup.string().trim().required("Address is required"),
  city: Yup.string().trim().required("City is required"),
  state: Yup.string().trim().required("State / province is required"),
  country: Yup.string().trim().required("Country is required"),
  postalCode: Yup.string().trim().required("Postal code is required"),
});

const getInvitePayload = (response) => response?.data ?? response ?? {};

const LaundryInvitation = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() || "";
  const [retryKey, setRetryKey] = useState(0);
  const [inviteState, setInviteState] = useState(() => ({
    token,
    status: token ? "loading" : "error",
    message: token
      ? "Checking your laundry invitation..."
      : "Invitation token is missing.",
  }));

  const formik = useFormik({
    initialValues: initialProfileValues,
    validationSchema: profileValidationSchema,
    onSubmit: async (values) => {
      if (!token) return;

      const payload = {
        companyName: values.companyName.trim(),
        contactPersonName: values.contactPersonName.trim(),
        password: values.password,
        confirmPassword: values.confirmPassword,
        phone: values.phone.trim(),
        address: values.address.trim(),
        city: values.city.trim(),
        state: values.state.trim(),
        country: values.country.trim(),
        postalCode: values.postalCode.trim(),
      };

      try {
        const response = await acceptTenantLaundryInvite(token, payload);
        const responsePayload = getInvitePayload(response);

        setInviteState({
          token,
          status: "success",
          message:
            response?.message ||
            responsePayload?.message ||
            "Laundry invitation accepted successfully.",
        });
      } catch (error) {
        const message = getApiErrorMessage(
          error,
          "Unable to accept this laundry invitation.",
        );
        formik.setStatus({ submitError: message });
      }
    },
  });

  useEffect(() => {
    if (!token) return undefined;

    let isActive = true;

    handleTenantLaundryInvite(token)
      .then((response) => {
        if (!isActive) return;

        const payload = getInvitePayload(response);
        const action = String(payload?.action || "").toLowerCase();
        const message =
          response?.message ||
          payload?.message ||
          "Laundry invitation processed successfully.";

        if (action === "linked") {
          setInviteState({ token, status: "success", message });
          return;
        }

        if (action === "signup_required" && payload?.requiresProfile === true) {
          setInviteState({ token, status: "profile", message });
          return;
        }

        setInviteState({
          token,
          status: "error",
          message:
            message ||
            "This invitation could not be processed. Please request a new link.",
        });
      })
      .catch((error) => {
        if (!isActive) return;
        setInviteState({
          token,
          status: "error",
          message: getApiErrorMessage(
            error,
            "Unable to process this laundry invitation.",
          ),
        });
      });

    return () => {
      isActive = false;
    };
  }, [retryKey, token]);

  const getFieldError = (field) =>
    formik.touched[field] && formik.errors[field]
      ? formik.errors[field]
      : "";

  const bindInput = (field) => ({
    error: Boolean(getFieldError(field)),
    helperText: getFieldError(field),
    name: field,
    onBlur: formik.handleBlur,
    onChange: (value) => {
      formik.setFieldValue(field, value);
      if (formik.status?.submitError) formik.setStatus(undefined);
    },
    value: formik.values[field],
  });

  const currentInviteState =
    inviteState.token === token
      ? inviteState
      : {
        token,
        status: token ? "loading" : "error",
        message: token
          ? "Checking your laundry invitation..."
          : "Invitation token is missing.",
      };
  const isLoading = currentInviteState.status === "loading";
  const isProfileRequired = currentInviteState.status === "profile";
  const isSuccess = currentInviteState.status === "success";
  const retryInvitation = () => {
    setInviteState({
      token,
      status: "loading",
      message: "Checking your laundry invitation...",
    });
    setRetryKey((current) => current + 1);
  };

  return (
    <main className="grid min-h-screen place-items-center bg-(--theme-bg) px-4 py-10 text-(--theme-text-primary)">
      <div className="w-full max-w-3xl">
        <Card padding="clamp(22px, 4vw, 36px)" rounded="22px">
          <div aria-live="polite">
            <div className="text-center">
              <div
                className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl ${isSuccess
                  ? "bg-emerald-500/15 text-emerald-500"
                  : isLoading
                    ? "bg-sky-500/15 text-sky-500"
                    : isProfileRequired
                      ? "bg-teal-500/15 text-(--color-aurora-teal)"
                      : "bg-red-500/15 text-red-500"
                  }`}
              >
                {isSuccess ? (
                  <CheckCircle2 size={32} />
                ) : isLoading ? (
                  <LoaderCircle className="animate-spin" size={32} />
                ) : isProfileRequired ? (
                  <Building2 size={32} />
                ) : (
                  <ShieldAlert size={32} />
                )}
              </div>

              <p className="m-0 mt-5 text-sm font-bold text-(--color-aurora-teal)">
                ClothSync Laundry
              </p>
              <h1 className="m-0 mt-1 text-2xl font-black sm:text-3xl">
                {isSuccess
                  ? "Invitation Accepted"
                  : isLoading
                    ? "Checking Invitation"
                    : isProfileRequired
                      ? "Create Your Laundry Profile"
                      : "Invitation Unavailable"}
              </h1>
              <p className="mx-auto mb-0 mt-2 max-w-xl text-sm font-semibold leading-6 text-(--theme-text-muted)">
                {currentInviteState.message}
              </p>
            </div>

            {isProfileRequired && (
              <form
                className="mt-8 grid gap-5"
                noValidate
                onSubmit={formik.handleSubmit}
              >
                {formik.status?.submitError && (
                  <Alert leftIcon={<ShieldAlert size={18} />} variant="danger">
                    {formik.status.submitError}
                  </Alert>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Laundry Company Name"
                    leftIcon={<Building2 size={18} />}
                    placeholder="FreshCare Laundry Services"
                    required
                    {...bindInput("companyName")}
                  />
                  <Input
                    label="Contact Person Name"
                    leftIcon={<CircleUserRound size={18} />}
                    placeholder="Jane Smith"
                    required
                    {...bindInput("contactPersonName")}
                  />
                  <Input
                    label="Password"
                    leftIcon={<LockKeyhole size={18} />}
                    placeholder="At least 8 characters"
                    required
                    type="password"
                    {...bindInput("password")}
                  />
                  <Input
                    label="Confirm Password"
                    leftIcon={<LockKeyhole size={18} />}
                    placeholder="Repeat your password"
                    required
                    type="password"
                    {...bindInput("confirmPassword")}
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="mb-0.5 block text-sm font-semibold" style={{ color: "var(--theme-text-secondary)" }}>
                      Phone <span style={{ color: "var(--color-overdue)" }}>*</span>
                    </label>
                    <PhoneInput
                      country={"us"}
                      disabled={formik.isSubmitting}
                      value={formik.values.phone}
                      onChange={(phone) => {
                        formik.setFieldValue(
                          "phone",
                          phone.startsWith("+") || !phone ? phone : `+${phone}`
                        );
                        if (formik.status?.submitError) formik.setStatus(undefined);
                      }}
                      onBlur={() => formik.setFieldTouched("phone", true)}
                      inputStyle={{
                        width: "100%",
                        height: "46px",
                        borderRadius: "14px",
                        borderColor:
                          formik.touched.phone && formik.errors.phone
                            ? "var(--color-overdue)"
                            : "var(--theme-border-soft)",
                        backgroundColor: "var(--theme-surface-strong)",
                        color: "var(--theme-text-primary)",
                        fontSize: "14px",
                        fontWeight: "500",
                        paddingLeft: "48px",
                      }}
                      buttonStyle={{
                        borderTopLeftRadius: "14px",
                        borderBottomLeftRadius: "14px",
                        borderColor:
                          formik.touched.phone && formik.errors.phone
                            ? "var(--color-overdue)"
                            : "var(--theme-border-soft)",
                        backgroundColor: "var(--theme-surface-strong)",
                      }}
                    />
                    {formik.touched.phone && formik.errors.phone && (
                      <p className="m-0 text-xs" style={{ color: "var(--color-overdue)" }}>
                        {formik.errors.phone}
                      </p>
                    )}
                  </div>
                  <Input
                    label="Address"
                    leftIcon={<MapPin size={18} />}
                    placeholder="Unit 12, Industrial Park"
                    required
                    {...bindInput("address")}
                  />
                  <Input
                    label="City"
                    placeholder="Miami"
                    required
                    {...bindInput("city")}
                  />
                  <Input
                    label="State / Province"
                    placeholder="FL"
                    required
                    {...bindInput("state")}
                  />
                  <Input
                    label="Country"
                    placeholder="USA"
                    required
                    {...bindInput("country")}
                  />
                  <Input
                    label="Postal Code"
                    placeholder="33101"
                    required
                    {...bindInput("postalCode")}
                  />
                </div>

                <Button
                  fullWidth
                  loading={formik.isSubmitting}
                  rightIcon={<ArrowRight size={17} />}
                  size="lg"
                  type="submit"
                >
                  Create Profile &amp; Accept Invitation
                </Button>
              </form>
            )}

            {isLoading && (
              <div className="mt-8 grid gap-3" aria-hidden="true">
                <div className="h-12 animate-pulse rounded-xl bg-(--theme-border-soft)" />
                <div className="h-12 animate-pulse rounded-xl bg-(--theme-border-soft)" />
              </div>
            )}

            {!isLoading && !isProfileRequired && (
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                {!isSuccess && token && (
                  <Button
                    fullWidth
                    leftIcon={<RefreshCw size={17} />}
                    onClick={retryInvitation}
                    variant="secondary"
                  >
                    Try Again
                  </Button>
                )}
                <Button
                  as={Link}
                  fullWidth
                  to="/laundry/login"
                  variant={isSuccess ? "success" : "outline"}
                >
                  Continue to Laundry Login
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
};

export default LaundryInvitation;

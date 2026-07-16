import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CircleCheck, LoaderCircle, ShieldAlert } from "lucide-react";
import Alert from "../../Components/UI/Alert";
import Button from "../../Components/UI/Button";
import Card from "../../Components/UI/Card";
import { usePageMeta } from "../../Hooks/usePageMeta";
import { getApiErrorMessage } from "../../axios/api";
import { verifyTenantStaffEmail } from "../../axios/staff/tenantStaff";

const StaffEmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() || "";
  const [verification, setVerification] = useState(() => ({
    status: token ? "loading" : "error",
    message: token ? "Verifying your email..." : "Verification token is missing.",
  }));

  usePageMeta({
    title: "Verify Staff Email - ClothSync",
    meta: [
      {
        name: "description",
        content: "Verify a ClothSync staff invitation email.",
      },
    ],
  });

  useEffect(() => {
    if (!token) return undefined;

    let isActive = true;

    verifyTenantStaffEmail(token)
      .then((response) => {
        if (!isActive) return;
        setVerification({
          status: "success",
          message: response?.message || "Email verified successfully.",
        });
      })
      .catch((error) => {
        if (!isActive) return;
        setVerification({
          status: "error",
          message: getApiErrorMessage(error, "Unable to verify this email link."),
        });
      });

    return () => {
      isActive = false;
    };
  }, [token]);

  const isLoading = verification.status === "loading";
  const isSuccess = verification.status === "success";

  return (
    <main className="grid min-h-screen place-items-center bg-(--theme-bg) px-4 py-10 text-(--theme-text-primary)">
      <Card className="w-full max-w-xl" padding="32px" rounded="22px">
        <div className="text-center">
          <div
            className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl ${
              isSuccess
                ? "bg-emerald-500/15 text-emerald-500"
                : isLoading
                  ? "bg-sky-500/15 text-sky-500"
                  : "bg-red-500/15 text-red-500"
            }`}
          >
            {isSuccess ? (
              <CircleCheck size={32} />
            ) : isLoading ? (
              <LoaderCircle className="animate-spin" size={32} />
            ) : (
              <ShieldAlert size={32} />
            )}
          </div>

          <h1 className="m-0 mt-5 text-2xl font-black">
            {isSuccess
              ? "Email Verified"
              : isLoading
                ? "Verifying Email"
                : "Verification Failed"}
          </h1>
          <p className="m-0 mt-2 text-sm font-medium text-(--theme-text-muted)">
            Staff Email Verification
          </p>
        </div>

        <Alert
          className="mt-6"
          variant={isSuccess ? "success" : isLoading ? "info" : "danger"}
        >
          {verification.message}
        </Alert>

        {!isLoading && (
          <Button
            as={Link}
            className="mt-6"
            fullWidth
            to="/business/login"
            variant={isSuccess ? "success" : "secondary"}
          >
            Continue to Login
          </Button>
        )}
      </Card>
    </main>
  );
};

export default StaffEmailVerificationPage;

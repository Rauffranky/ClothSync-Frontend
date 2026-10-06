import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Plus, Sparkles } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Card from "../../../Components/UI/Card";
import Tabs from "../../../Components/UI/Tabs";
import { getApiErrorMessage } from "../../../axios/api";
import {
  getTenantLaundries,
  sendTenantLaundryInvite,
} from "../../../axios/laundries/tenantLaundries";
import { useOrganizationSubscription } from "../../../Hooks/useOrganizationSubscription";
import { toast } from "../../../Utils/toast";
import InviteLaundryModal from "./InviteLaundryModal";
import LinkedLaundries from "./LinkedLaundries";
import PendingRequest from "./PendingRequest";
import RejectedLaundries from "./RejectedLaundries";
import Stats from "./Stats";
import {
  getPaginatedCollection,
  normalizeLinkedLaundrySummary,
} from "./utils";

const TAB_VALUES = ["linked", "pending", "rejected"];
const inviteLaundryInitialValues = { email: "" };
const inviteLaundryValidationSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email address is required"),
});

const Laundries = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    isQuotaReached,
    getQuotaLimit,
    isSuperAdmin,
  } = useOrganizationSubscription();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [linkedRefreshKey, setLinkedRefreshKey] = useState(0);
  const requestedTab = searchParams.get("tab");
  const activeTab = TAB_VALUES.includes(requestedTab) ? requestedTab : "linked";

  const totalLinkedCount =
    (Number(summary?.totalLinked) || 0) +
    (Number(summary?.pendingRequests) || 0);
  const linkedQuotaLimit = getQuotaLimit("linkedPartners");
  const isLinkedLimitReached = isQuotaReached(
    "linkedPartners",
    totalLinkedCount,
  );

  const inviteLaundryFormik = useFormik({
    initialValues: inviteLaundryInitialValues,
    validationSchema: inviteLaundryValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      if (isLinkedLimitReached && !isSuperAdmin) {
        toast.error(
          `Linked laundry limit of ${linkedQuotaLimit} reached. Upgrade your subscription plan to add more.`,
        );
        setSubmitting(false);
        return;
      }
      try {
        const response = await sendTenantLaundryInvite({ email: values.email });
        toast.success(response?.message || "Invitation sent successfully");
        closeInviteModal();
        setLinkedRefreshKey((current) => current + 1);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to send invitation"));
      } finally {
        setSubmitting(false);
      }
    },
  });

  const closeInviteModal = () => {
    setIsInviteModalOpen(false);
    inviteLaundryFormik.resetForm();
  };

  const handleSummaryChange = useCallback((nextSummary) => {
    setSummary(nextSummary);
    setIsSummaryLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === "linked" || summary) return undefined;

    let isActive = true;

    getTenantLaundries({ page: 1, limit: 1 })
      .then((response) => {
        if (!isActive) return;
        const collection = getPaginatedCollection(
          response,
          ["laundries", "tenantLaundries"],
          1,
        );
        handleSummaryChange(
          normalizeLinkedLaundrySummary(collection.summary),
        );
      })
      .catch((error) => {
        if (!isActive) return;
        handleSummaryChange(null);
        toast.error(
          getApiErrorMessage(error, "Failed to load summary stats"),
        );
      });

    return () => {
      isActive = false;
    };
  }, [activeTab, handleSummaryChange, linkedRefreshKey, summary]);

  const handleTabChange = (nextTab) => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);

      if (nextTab === "linked") {
        nextParams.delete("tab");
      } else {
        nextParams.set("tab", nextTab);
      }

      return nextParams;
    }, { replace: true });
  };

  return (
    <div className="space-y-5">
      <Stats loading={isSummaryLoading} summary={summary} />

      {isLinkedLimitReached && !isSuperAdmin && (
        <Alert variant="warning">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="m-0 text-sm font-bold text-(--theme-text-primary)">
                Linked Laundry Quota Limit Reached ({totalLinkedCount} / {linkedQuotaLimit ?? "0"})
              </p>
              <p className="m-0 text-xs text-(--theme-text-muted)">
                You have reached your subscription tier limit for linked laundries. Upgrade your plan to invite more laundries.
              </p>
            </div>
            <Button
              leftIcon={<Sparkles size={14} />}
              size="sm"
              variant="primary"
              onClick={() => navigate("/business/subscription-billing")}
            >
              Upgrade Subscription
            </Button>
          </div>
        </Alert>
      )}

      <Card padding="0" rounded="18px">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--theme-border) px-4 py-4">
          <div className="min-w-0 flex-[1_1_520px] overflow-x-auto overscroll-x-contain">
            <Tabs
              className="w-max border-0 bg-transparent p-0 shadow-none"
              itemClassName="min-w-[160px] overflow-hidden"
              items={[
                {
                  label: "Linked Laundries",
                  value: "linked",
                },
                {
                  label: "Pending Requests",
                  value: "pending",
                },
                {
                  label: "Rejected Laundries",
                  value: "rejected",
                },
              ]}
              onChange={handleTabChange}
              value={activeTab}
            />
          </div>

          {activeTab === "linked" && (
            <Button
              className="w-full shrink-0 sm:ml-auto sm:w-auto"
              disabled={isLinkedLimitReached && !isSuperAdmin}
              leftIcon={<Plus size={17} />}
              onClick={() => {
                if (isLinkedLimitReached && !isSuperAdmin) {
                  toast.error(
                    `Linked laundry limit of ${linkedQuotaLimit} reached. Upgrade your subscription plan to add more.`,
                  );
                  return;
                }
                setIsInviteModalOpen(true);
              }}
              size="md"
              variant="secondary"
              title={
                isLinkedLimitReached && !isSuperAdmin
                  ? `Plan limit of ${linkedQuotaLimit} linked laundries reached`
                  : undefined
              }
            >
              Invite New Laundry
            </Button>
          )}
        </div>

        {activeTab === "linked" && (
          <LinkedLaundries
            externalRefreshKey={linkedRefreshKey}
            onSummaryChange={handleSummaryChange}
          />
        )}
        {activeTab === "pending" && <PendingRequest />}
        {activeTab === "rejected" && <RejectedLaundries />}
      </Card>

      <InviteLaundryModal
        formik={inviteLaundryFormik}
        isOpen={isInviteModalOpen}
        onClose={closeInviteModal}
      />
    </div>
  );
};

export default Laundries;

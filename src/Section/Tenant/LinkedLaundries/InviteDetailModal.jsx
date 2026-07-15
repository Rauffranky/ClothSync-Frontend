import { useEffect, useState } from "react";
import {
  AlertCircle,
  Building2,
  CalendarDays,
  CircleUserRound,
  FileText,
  Hash,
  Mail,
} from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import Modal from "../../../Components/UI/Modal";
import { getApiErrorMessage } from "../../../axios/api";
import { getTenantLaundryInviteDetails } from "../../../axios/laundries/tenantLaundries";
import { formatDateWithUserPreferences } from "../../../Utils/date";
import Card from "../../../Components/UI/Card";

const getStatusVariant = (status) => {
  if (status === "accepted") return "success";
  if (status === "pending") return "warning";
  if (["rejected", "expired"].includes(status)) return "danger";
  return "neutral";
};

const formatDate = (value) =>
  value ? formatDateWithUserPreferences(value) : "-";

;

const DetailItem = ({ icon: Icon, label, value, className = "" }) => (
  <Card
    className={`${className}`}
  >
    <dt className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-(--theme-text-muted)">
      {Icon && <Icon size={15} />}
      {label}
    </dt>
    <dd className="m-0 mt-2 wrap-break-word text-sm font-bold text-(--theme-text-primary)">
      {value ?? "-"}
    </dd>
  </Card>
);

const SectionTitle = ({ children }) => (
  <h3 className="m-0 text-sm font-black uppercase tracking-[0.08em] text-(--theme-text-secondary)">
    {children}
  </h3>
);

const InviteDetailSkeleton = () => (
  <div
    aria-label="Loading invitation details"
    className="space-y-5 animate-pulse"
  >
    <div className="h-20 rounded-2xl bg-(--theme-border-soft)" />
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: 6 }, (_, index) => (
        <div className="h-20 rounded-xl bg-(--theme-border-soft)" key={index} />
      ))}
    </div>
  </div>
);

const InviteDetailModal = ({ isOpen, onClose, request }) => {
  const token = request?.token || null;
  const [result, setResult] = useState({
    token: null,
    payload: null,
    error: null,
  });

  useEffect(() => {
    if (!isOpen || !token) return undefined;

    let isActive = true;

    getTenantLaundryInviteDetails(token)
      .then((response) => {
        if (!isActive) return;
        setResult({ token, payload: response?.data ?? null, error: null });
      })
      .catch((error) => {
        if (!isActive) return;
        setResult({
          token,
          payload: null,
          error: getApiErrorMessage(error, "Failed to load invite details"),
        });
      });

    return () => {
      isActive = false;
    };
  }, [isOpen, token]);

  const hasCurrentResult = result.token === token;
  const isLoading = Boolean(isOpen && token && !hasCurrentResult);
  const error = hasCurrentResult ? result.error : null;
  const payload = token
    ? hasCurrentResult
      ? result.payload
      : null
    : request
      ? { invite: request, tenant: request.tenant || null }
      : null;
  const invite = payload?.invite || null;
  const tenant = payload?.tenant || invite?.tenant || null;
  const laundry = payload?.laundry || null;

  return (
    <Modal
      description="Review invitation, tenant, lifecycle, and profile information."
      footer={
        <Button onClick={onClose} variant="secondary">
          Close
        </Button>
      }
      onClose={onClose}
      open={isOpen}
      title="Invitation Details"
      width={820}
    >
      {isLoading ? (
        <InviteDetailSkeleton />
      ) : error ? (
        <Alert leftIcon={<AlertCircle size={18} />} variant="danger">
          <div>
            <p className="m-0 font-black">Unable to load invitation details</p>
            <p className="m-0 mt-1 text-sm">{error}</p>
          </div>
        </Alert>
      ) : invite ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-(--theme-border) bg-(--button-ghost-bg) p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-(--button-secondary-bg) text-(--color-aurora-teal)">
                <Mail size={20} />
              </span>
              <div className="min-w-0">
                <p className="m-0 text-xs font-black uppercase tracking-wider text-(--theme-text-muted)">
                  Invited Laundry Email
                </p>
                <p className="m-0 mt-1 break-all font-black text-(--theme-text-primary)">
                  {invite.email || "-"}
                </p>
              </div>
            </div>
            <Badge size="md" variant={getStatusVariant(invite.status)}>
              {invite.status || "-"}
            </Badge>
          </div>

          

          <section className="space-y-3">
            <SectionTitle>Tenant</SectionTitle>
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem
                icon={CircleUserRound}
                label="Full Name"
                value={tenant?.fullName}
              />
              <DetailItem
                icon={Building2}
                label="Business Type"
                value={tenant?.businessType}
              />
              
            </dl>
          </section>


          <section className="space-y-3">
            <SectionTitle>Lifecycle</SectionTitle>
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem
                icon={CalendarDays}
                label="Created At"
                value={formatDate(invite.createdAt)}
              />
              <DetailItem
                icon={CalendarDays}
                label="Updated At"
                value={formatDate(invite.updatedAt)}
              />
              <DetailItem
                icon={CalendarDays}
                label="Expires At"
                value={formatDate(invite.expiresAt)}
              />
              <DetailItem
                icon={CalendarDays}
                label="Resent At"
                value={formatDate(invite.resentAt)}
              />
              <DetailItem
                icon={CalendarDays}
                label="Accepted At"
                value={formatDate(invite.acceptedAt)}
              />
              <DetailItem
                icon={CalendarDays}
                label="Cancelled At"
                value={formatDate(invite.cancelledAt)}
              />
              <DetailItem
                icon={CalendarDays}
                label="Rejected At"
                value={formatDate(invite.rejectedAt)}
              />
              <DetailItem
                className="sm:col-span-2"
                icon={FileText}
                label="Rejection Reason"
                value={invite.rejectionReason || "-"}
              />
            </dl>
          </section>

          <section className="space-y-3">
            <SectionTitle>Laundry Profile</SectionTitle>
            {laundry ? (
              <dl className="grid gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={Building2}
                  label="Laundry Name"
                  value={laundry.businessName || laundry.name}
                />
                <DetailItem icon={Hash} label="Laundry ID" value={laundry.id} />
              </dl>
            ) : (
              <Alert variant="info">
                No laundry profile is linked to this invitation yet.
              </Alert>
            )}
          </section>
        </div>
      ) : (
        <Alert variant="neutral">No invitation details found.</Alert>
      )}
    </Modal>
  );
};

export default InviteDetailModal;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  UserRound,
} from "lucide-react";
import Alert from "../../../../Components/UI/Alert";
import Badge from "../../../../Components/UI/Badge";
import Button from "../../../../Components/UI/Button";
import Card from "../../../../Components/UI/Card";
import InitialsAvatar from "../../../../Components/UI/InitialsAvatar";
import { getApiErrorMessage } from "../../../../axios/api";
import { getLaundryTenantDetails } from "../../../../axios/laundryTenants/laundryTenants";
import { formatDateTime } from "../../../../Utils/date";
import { normalizeLaundryTenantDetails } from "../data";
import CurrentOperations from "./CurrentOperations";

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="min-w-0">
    <dt className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-(--theme-text-muted)">
      <Icon size={15} />
      {label}
    </dt>
    <dd className="m-0 mt-2 wrap-break-word text-sm font-bold text-(--theme-text-primary)">
      {value === null || value === undefined || value === ""
        ? "Not provided"
        : value}
    </dd>
  </div>
);

const LinkedBusinessDetail = () => {
  const { id } = useParams();
  const [retryKey, setRetryKey] = useState(0);
  const [loadState, setLoadState] = useState({
    requestKey: null,
    business: null,
    error: "",
  });
  const requestKey = id ? `${id}:${retryKey}` : "missing-id";
  const isLoading = Boolean(id && loadState.requestKey !== requestKey);
  const business =
    loadState.requestKey === requestKey ? loadState.business : null;
  const loadError = id
    ? loadState.requestKey === requestKey
      ? loadState.error
      : ""
    : "Business identifier is missing";

  useEffect(() => {
    if (!id) return undefined;

    let isActive = true;
    const activeRequestKey = `${id}:${retryKey}`;

    getLaundryTenantDetails(id)
      .then((response) => {
        if (!isActive) return;
        setLoadState({
          requestKey: activeRequestKey,
          business: normalizeLaundryTenantDetails(response),
          error: "",
        });
      })
      .catch((error) => {
        if (!isActive) return;
        setLoadState({
          requestKey: activeRequestKey,
          business: null,
          error: getApiErrorMessage(
            error,
            "Unable to load connected business details",
          ),
        });
      });

    return () => {
      isActive = false;
    };
  }, [id, retryKey]);

  if (isLoading) {
    return (
      <div
        aria-label="Loading connected business details"
        className="animate-pulse space-y-5"
      >
        <div className="h-32 rounded-2xl bg-(--button-ghost-bg)" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              className="h-28 rounded-2xl bg-(--button-ghost-bg)"
              key={index}
            />
          ))}
        </div>
        <div className="h-56 rounded-2xl bg-(--button-ghost-bg)" />
      </div>
    );
  }

  if (loadError || !business) {
    return (
      <Alert variant="danger">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>
            {loadError || "Connected business details are unavailable"}
          </span>
          {id && (
            <Button
              leftIcon={<RefreshCw size={15} />}
              onClick={() => setRetryKey((current) => current + 1)}
              size="sm"
              variant="secondary"
            >
              Try Again
            </Button>
          )}
        </div>
      </Alert>
    );
  }

  const fullLocation =
    (business.address && business.address !== "-" && business.address) ||
    [business.city, business.state, business.country]
      .filter(Boolean)
      .join(", ") ||
    business.location;

  return (
    <div className="space-y-6">
      <Card padding="24px" rounded="20px">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <InitialsAvatar initials={business.initials} size="lg" />
            <div className="min-w-0">
              <h1 className="m-0 truncate text-2xl font-black text-(--theme-text-primary)">
                {business.name}
              </h1>
              <p className="m-0 mt-1 text-sm font-semibold text-(--theme-text-muted)">
                {business.businessType} · {business.location}
              </p>
            </div>
          </div>
          <Badge dot size="md" variant={business.statusVariant}>
            {business.status}
          </Badge>
        </div>
      </Card>

      <CurrentOperations business={business} />

      <Card padding="0" rounded="20px">
        <div className="border-b border-(--theme-border) px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <Building2 size={20} className="text-(--color-aurora-teal)" />
            <div>
              <h2 className="m-0 text-lg font-black text-(--theme-text-primary)">
                Business Information
              </h2>
              <p className="m-0 mt-1 text-sm font-semibold text-(--theme-text-muted)">
                Contact, location, and connection details
              </p>
            </div>
          </div>
        </div>

        <dl className="grid gap-x-8 gap-y-6 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
          <DetailItem
            icon={UserRound}
            label="Contact Person"
            value={business.contactName}
          />
          <DetailItem icon={Mail} label="Email" value={business.contactEmail} />
          <DetailItem
            icon={Phone}
            label="Phone"
            value={business.contactPhone}
          />
          <DetailItem icon={MapPin} label="Location" value={fullLocation} />
          <DetailItem
            icon={CalendarDays}
            label="Connected At"
            value={business.linkedAt ? formatDateTime(business.linkedAt) : null}
          />
        </dl>
      </Card>
    </div>
  );
};

export default LinkedBusinessDetail;

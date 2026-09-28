import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Box,
  Building2,
  CalendarDays,
  Clock,
  Layers3,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  RefreshCw,
  Star,
  Truck,
  UserRound,
} from "lucide-react";
import Badge from "../../../../Components/UI/Badge";
import Button from "../../../../Components/UI/Button";
import Card from "../../../../Components/UI/Card";
import IconWrapper from "../../../../Components/UI/IconWrapper";
import Tabs from "../../../../Components/UI/Tabs";
import { getApiErrorMessage } from "../../../../axios/api";
import { getTenantLaundryDetails } from "../../../../axios/laundries/tenantLaundries";
import { toast } from "../../../../Utils/toast";
import { formatDateTime } from "../../../../Utils/date";
import { normalizeLinkedLaundryDetails } from "../utils";
import ActivityLogTab from "./Tabs/ActivityLogTab";
import DispatchBatchesTab from "./Tabs/DispatchBatchesTab";
import OverviewTab from "./Tabs/OverviewTab";

const VALID_TABS = ["overview", "dispatch", "activity"];

const LinkedLaundryDetail = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab = VALID_TABS.includes(requestedTab)
    ? requestedTab
    : "overview";

  const handleTabChange = (nextTab) => {
    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        if (nextTab === "overview") {
          nextParams.delete("tab");
        } else {
          nextParams.set("tab", nextTab);
        }
        return nextParams;
      },
      { replace: true },
    );
  };

  const [refreshKey, setRefreshKey] = useState(0);
  const [loadState, setLoadState] = useState({
    requestKey: null,
    data: null,
    error: "",
  });
  const requestKey = id ? `${id}:${refreshKey}` : "missing-id";
  const isLoading = Boolean(id && loadState.requestKey !== requestKey);
  const laundryDetails =
    loadState.requestKey === requestKey ? loadState.data : null;
  const loadError = id
    ? loadState.requestKey === requestKey
      ? loadState.error
      : ""
    : "Laundry identifier is missing";

  useEffect(() => {
    if (!id) return undefined;

    let isActive = true;
    const activeRequestKey = `${id}:${refreshKey}`;

    getTenantLaundryDetails(id)
      .then((response) => {
        if (!isActive) return;
        setLoadState({
          requestKey: activeRequestKey,
          data: normalizeLinkedLaundryDetails(response),
          error: "",
        });
      })
      .catch((error) => {
        if (!isActive) return;
        const message = getApiErrorMessage(
          error,
          "Unable to load laundry details",
        );
        setLoadState({
          requestKey: activeRequestKey,
          data: null,
          error: message,
        });
        toast.error(message);
      });

    return () => {
      isActive = false;
    };
  }, [id, refreshKey]);

  if (isLoading) {
    return (
      <div
        aria-label="Loading laundry details"
        className="animate-pulse space-y-4"
      >
        <div className="h-20 rounded-2xl bg-(--button-ghost-bg)" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              className="h-28 rounded-2xl bg-(--button-ghost-bg)"
              key={index}
            />
          ))}
        </div>
        <div className="h-44 rounded-2xl bg-(--button-ghost-bg)" />
        <div className="h-80 rounded-2xl bg-(--button-ghost-bg)" />
      </div>
    );
  }

  if (loadError || !laundryDetails) {
    return (
      <Card padding="32px" rounded="18px">
        <div className="flex flex-col items-center text-center">
          <IconWrapper icon={Building2} variant="danger" />
          <h1 className="m-0 mt-4 text-xl font-black text-(--theme-text-primary)">
            Unable to load laundry details
          </h1>
          <p className="m-0 mt-2 text-sm font-semibold text-(--theme-text-muted)">
            {loadError || "Laundry details are unavailable"}
          </p>
          <Button
            className="mt-5"
            leftIcon={<RefreshCw size={16} />}
            onClick={() => setRefreshKey((current) => current + 1)}
            variant="secondary"
          >
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  const statCards = [
    {
      label: "Active Batches",
      value: laundryDetails.stats.activeBatches,
      icon: Box,
      variant: "info",
    },
    {
      label: "Items Currently Sent",
      value: laundryDetails.stats.itemsCurrentlySent,
      icon: Truck,
      variant: "warning",
    },
    {
      label: "Delayed Items",
      value: laundryDetails.stats.delayedItems,
      icon: Clock,
      variant: "danger",
    },
    {
      label: "Total Batches",
      value: laundryDetails.stats.totalBatches,
      icon: Layers3,
      variant: "purple",
    },
    {
      label: "Total Items",
      value: laundryDetails.stats.totalItems,
      icon: PackageCheck,
      variant: "success",
    },
  ];

  const fullLocation =
    [laundryDetails.contact.address, laundryDetails.contact.country]
      .filter(Boolean)
      .filter((part) => part !== "-")
      .join(", ") || "Location not set";

  const tabOptions = [
    { label: "Overview", value: "overview" },
    {
      label: "Dispatch Batches",
      value: "dispatch",
    },
    { label: "Activity Log", value: "activity" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Profile Card */}
      <Card padding="24px" rounded="20px">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left Side: Brand Identity & Location */}
          <div className="flex min-w-0 items-center gap-4">
            {laundryDetails.profile?.avatar ? (
              <img
                alt={`${laundryDetails.name} avatar`}
                className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-2 ring-(--theme-border-soft)"
                src={laundryDetails.profile.avatar}
              />
            ) : (
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-(--theme-border-soft) bg-(--button-ghost-bg) text-(--color-aurora-teal)">
                <Building2 size={28} />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="m-0 truncate text-2xl font-black text-(--theme-text-primary)">
                  {laundryDetails.name}
                </h1>
                <Badge size="md" variant={laundryDetails.statusVariant}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {laundryDetails.status}
                </Badge>
                {laundryDetails.isDefault && (
                  <Badge
                    leftIcon={<Star className="fill-current" size={13} />}
                    size="md"
                    variant="warning"
                  >
                    Default Laundry
                  </Badge>
                )}
              </div>
              <p className="m-0 mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-(--theme-text-muted)">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={13} className="text-(--color-aurora-teal)" />
                  {fullLocation}
                </span>
                {laundryDetails.linkedAt && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays
                        size={13}
                        className="text-(--color-aurora-teal)"
                      />
                      Connected {formatDateTime(laundryDetails.linkedAt)}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Right Side: Structured Contact & Direct Communications */}
          <div className="flex shrink-0 flex-col gap-2 border-t border-(--theme-border-soft) pt-4 lg:items-end lg:border-t-0 lg:pt-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-(--theme-text-muted)">
                Primary Contact
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-(--theme-text-primary)">
                <UserRound size={13} className="text-(--color-aurora-teal)" />
                {laundryDetails.contact.name || "Not provided"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              {laundryDetails.contact.phone &&
                laundryDetails.contact.phone !== "-" && (
                  <a
                    href={`tel:${laundryDetails.contact.phone}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-(--theme-border-soft) bg-(--button-ghost-bg) px-3 py-1.5 text-xs font-semibold text-(--theme-text-secondary) transition-all hover:border-(--color-aurora-teal) hover:text-(--theme-text-primary)"
                    title="Direct Phone"
                  >
                    <Phone size={12} className="text-(--color-aurora-teal)" />
                    {laundryDetails.contact.phone}
                  </a>
                )}
              {laundryDetails.contact.email &&
                laundryDetails.contact.email !== "-" && (
                  <a
                    href={`mailto:${laundryDetails.contact.email}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-(--theme-border-soft) bg-(--button-ghost-bg) px-3 py-1.5 text-xs font-semibold text-(--theme-text-secondary) transition-all hover:border-(--color-aurora-teal) hover:text-(--theme-text-primary)"
                    title="Direct Email"
                  >
                    <Mail size={12} className="text-(--color-aurora-teal)" />
                    {laundryDetails.contact.email}
                  </a>
                )}
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Operations Overview Stat Cards */}
      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map(({ icon, label, value, variant }) => (
          <Card
            className="flex flex-col justify-between"
            key={label}
            padding="16px"
            rounded="16px"
          >
            <IconWrapper
              icon={icon}
              iconSize={16}
              roundedClassName="rounded-lg"
              sizeClassName="h-8 w-8"
              variant={variant}
            />
            <div className="mt-4">
              <p className="m-0 text-3xl font-black text-(--theme-text-primary)">
                {value}
              </p>
              <p className="m-0 mt-1 text-xs font-bold text-(--theme-text-muted)">
                {label}
              </p>
            </div>
          </Card>
        ))}
      </section>

      {/* 4. Tabs Section */}
      <Card padding="0" rounded="20px">
        <div className="w-max px-5 pt-4 sm:px-6">
          <Tabs
            items={tabOptions}
            onChange={handleTabChange}
            value={activeTab}
          />
        </div>
        <div className="rounded-b-[20px] p-4 sm:p-6">
          {activeTab === "overview" && (
            <OverviewTab
              laundryDetails={laundryDetails}
              laundryId={id}
              onViewAllBatches={() => handleTabChange("dispatch")}
            />
          )}
          {activeTab === "dispatch" && (
            <DispatchBatchesTab
              laundryDetails={laundryDetails}
              laundryId={id}
            />
          )}
          {activeTab === "activity" && (
            <ActivityLogTab laundryDetails={laundryDetails} laundryId={id} />
          )}
        </div>
      </Card>
    </div>
  );
};

export default LinkedLaundryDetail;

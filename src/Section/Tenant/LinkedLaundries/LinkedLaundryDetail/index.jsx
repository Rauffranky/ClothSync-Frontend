import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Building2,
  Clock,
  Globe2,
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
import { normalizeLinkedLaundryDetails } from "../utils";
import ActivityLogTab from "./Tabs/ActivityLogTab";
import DispatchBatchesTab from "./Tabs/DispatchBatchesTab";
import InventoryTab from "./Tabs/InventoryTab";
import OverviewTab from "./Tabs/OverviewTab";

const getDetailValue = (value) =>
  value === null || value === undefined || value === ""
    ? "Not provided"
    : value;

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="min-w-0">
    <div className="flex items-center gap-2 text-(--theme-text-muted)">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-(--theme-surface-hover)">
        <Icon size={13} />
      </span>
      <p className="m-0 text-[10px] font-black uppercase tracking-wider">
        {label}
      </p>
    </div>
    <p className="m-0 mt-2 wrap-break-word text-sm font-semibold text-(--theme-text-primary)">
      {getDetailValue(value)}
    </p>
  </div>
);

const DetailSection = ({ title, items }) => (
  <section className="border-t border-(--theme-border) px-5 py-5 sm:px-6">
    <h3 className="m-0 mb-5 text-sm font-black text-(--theme-text-primary)">
      {title}
    </h3>
    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <DetailItem key={item.label} {...item} />
      ))}
    </div>
  </section>
);

const LinkedLaundryDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
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
        <div className="h-16 rounded-2xl bg-(--button-ghost-bg)" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              className="h-28 rounded-2xl bg-(--button-ghost-bg)"
              key={index}
            />
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-(--button-ghost-bg)" />
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

  const contactItems = [
    {
      label: "Contact Name",
      value: laundryDetails.contact.name,
      icon: UserRound,
    },
    { label: "Contact Email", value: laundryDetails.contact.email, icon: Mail },
    {
      label: "Contact Phone",
      value: laundryDetails.contact.phone,
      icon: Phone,
    },
    { label: "Location", value: laundryDetails.contact.address, icon: MapPin },
    { label: "Country", value: laundryDetails.contact.country, icon: Globe2 },
  ];

  const tabOptions = [
    { label: "Overview", value: "overview" },
    {
      label: "Dispatch Batches",
      value: "dispatch",
      count: laundryDetails.stats.totalBatches,
    },
    {
      label: "Inventory",
      value: "inventory",
      count: laundryDetails.stats.totalItems,
    },
    { label: "Activity Log", value: "activity" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="m-0 text-2xl font-black text-(--theme-text-primary)">
            {laundryDetails.name}
          </h1>
          <Badge size="md" variant={laundryDetails.statusVariant}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {laundryDetails.status}
          </Badge>
          {laundryDetails.isDefault && (
            <Badge
              leftIcon={<Star className="fill-current" size={14} />}
              size="md"
              variant="warning"
            >
              Default Laundry
            </Badge>
          )}
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

      <Card padding="0" rounded="20px">
        <div className="flex items-center gap-4 px-5 py-5 sm:px-6">
          {laundryDetails.profile.avatar ? (
            <img
              alt={`${laundryDetails.name} avatar`}
              className="h-16 w-16 shrink-0 rounded-2xl object-cover"
              src={laundryDetails.profile.avatar}
            />
          ) : (
            <IconWrapper
              icon={Building2}
              iconSize={24}
              roundedClassName="rounded-2xl"
              sizeClassName="h-16 w-16 shrink-0"
              variant="info"
            />
          )}
          <div className="min-w-0">
            <h2 className="m-0 truncate text-xl font-black text-(--theme-text-primary)">
              {laundryDetails.name}
            </h2>
            <p className="m-0 mt-1 break-all text-xs font-bold text-(--theme-text-muted)">
              {laundryDetails.relationshipId}
            </p>
          </div>
        </div>

        <DetailSection items={contactItems} title="Primary Contact" />

        <div className="border-t border-(--theme-border)">
          <div className="overflow-x-auto px-5 pt-4 sm:px-6">
            <Tabs
              items={tabOptions}
              onChange={setActiveTab}
              value={activeTab}
            />
          </div>
          <div className="rounded-b-[20px] bg-(--theme-surface-strong) p-4 sm:p-6">
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "dispatch" && <DispatchBatchesTab />}
            {activeTab === "inventory" && <InventoryTab />}
            {activeTab === "activity" && <ActivityLogTab />}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LinkedLaundryDetail;

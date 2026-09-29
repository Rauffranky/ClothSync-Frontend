import { useEffect, useState } from "react";
import {
  Calendar,
  CircleCheck,
  CircleX,
  Globe,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  TowelRack,
  User,
} from "lucide-react";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import Modal from "../../../Components/UI/Modal";
import { getAdminLaundryDetails } from "../../../axios/laundries/adminLaundries";
import { normalizeLaundry } from "./data";

const DetailItem = ({ icon: Icon, label, value, color = "var(--color-aurora-teal)" }) => (
  <div className="flex items-start gap-3 rounded-xl border border-(--theme-border) bg-(--theme-surface-strong) p-3.5">
    <span
      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
      style={{
        color,
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
      }}
    >
      <Icon size={16} strokeWidth={2.2} />
    </span>
    <div className="min-w-0 flex-1">
      <p className="m-0 text-xs font-semibold text-(--theme-text-muted)">
        {label}
      </p>
      <p className="m-0 mt-0.5 truncate text-sm font-bold text-(--theme-text-primary)">
        {value || "—"}
      </p>
    </div>
  </div>
);

const LaundryDetailsModal = ({ laundry, onClose }) => {
  const [details, setDetails] = useState(laundry);

  useEffect(() => {
    let isActive = true;
    if (laundry?.apiId || laundry?.id) {
      getAdminLaundryDetails(laundry.apiId || laundry.id)
        .then((res) => {
          if (!isActive) return;
          const payload = res?.data?.data || res?.data || res;
          if (payload && typeof payload === "object") {
            setDetails(normalizeLaundry(payload));
          }
        })
        .catch(() => {});
    }

    return () => {
      isActive = false;
    };
  }, [laundry]);

  if (!details) return null;

  return (
    <Modal
      footer={
        <Button onClick={onClose} rounded="10px" size="sm" variant="outline">
          Close
        </Button>
      }
      onClose={onClose}
      open
      title="Laundry Facility Information"
      width={640}
    >
      <div className="space-y-5">
        {/* Header Profile Banner */}
        <div className="flex items-center gap-4 rounded-2xl border border-(--theme-border) bg-(--theme-surface-hover) p-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-(--color-aurora-teal)/12 text-(--color-aurora-teal)">
            <TowelRack size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="m-0 text-lg font-black tracking-tight text-(--theme-text-primary)">
                {details.companyName}
              </h3>
              <Badge
                leftIcon={
                  details.rawStatus === "active" ? (
                    <CircleCheck size={12} />
                  ) : details.rawStatus === "suspend" || details.rawStatus === "suspended" ? (
                    <ShieldAlert size={12} />
                  ) : (
                    <CircleX size={12} />
                  )
                }
                size="sm"
                variant={details.statusVariant}
              >
                {details.status}
              </Badge>
            </div>
            <p className="m-0 mt-1 text-xs font-medium text-(--theme-text-muted)">
              Facility ID: <span className="font-mono text-(--theme-text-secondary)">{details.id || details.apiId}</span>
            </p>
          </div>
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailItem
            icon={User}
            label="Primary Contact Person"
            value={details.contactName}
          />
          <DetailItem
            icon={Mail}
            label="Contact Email"
            value={details.email}
          />
          <DetailItem
            icon={Phone}
            label="Phone Number"
            value={details.phone}
          />
          <DetailItem
            icon={Globe}
            label="Country"
            value={details.country}
            color="var(--color-sky-blue)"
          />
          <DetailItem
            icon={MapPin}
            label="Street Address"
            value={details.address}
          />
          <DetailItem
            icon={MapPin}
            label="City / State / Postal"
            value={[details.city, details.state, details.postalCode].filter(Boolean).join(", ") || "—"}
          />
          <DetailItem
            icon={Calendar}
            label="Registered Date"
            value={details.created}
          />
        </div>
      </div>
    </Modal>
  );
};

export default LaundryDetailsModal;

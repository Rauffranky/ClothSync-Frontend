import {
  Building2,
  Calendar,
  CircleCheck,
  CircleX,
  Clock,
  Globe,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
} from "lucide-react";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import Modal from "../../../Components/UI/Modal";

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

const BusinessDetailsModal = ({ business, onClose }) => {
  if (!business) return null;

  return (
    <Modal
      footer={
        <Button onClick={onClose} rounded="10px" size="sm" variant="outline">
          Close
        </Button>
      }
      onClose={onClose}
      open
      title="Business Information"
      width={640}
    >
      <div className="space-y-5">
        {/* Header Profile Banner */}
        <div className="flex items-center gap-4 rounded-2xl border border-(--theme-border) bg-(--theme-surface-hover) p-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-(--color-aurora-teal)/12 text-(--color-aurora-teal)">
            <Building2 size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="m-0 text-lg font-black tracking-tight text-(--theme-text-primary)">
                {business.businessName}
              </h3>
              <Badge
                leftIcon={
                  business.status === "Active" ? (
                    <CircleCheck size={12} />
                  ) : (
                    <CircleX size={12} />
                  )
                }
                size="sm"
                variant={business.statusVariant}
              >
                {business.status}
              </Badge>
            </div>
            <p className="m-0 mt-1 text-xs font-medium text-(--theme-text-muted)">
              Tenant ID: <span className="font-mono text-(--theme-text-secondary)">{business.id || business.apiId}</span>
            </p>
          </div>
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailItem
            icon={User}
            label="Owner / Contact"
            value={business.contactName}
          />
          <DetailItem
            icon={Mail}
            label="Email Address"
            value={business.email}
          />
          <DetailItem
            icon={Phone}
            label="Phone Number"
            value={business.phone}
          />
          <DetailItem
            icon={Building2}
            label="Business Type"
            value={business.businessType}
            color="var(--color-sky-blue)"
          />
          <DetailItem
            icon={MapPin}
            label="Full Address"
            value={business.address}
          />
          <DetailItem
            icon={Globe}
            label="Region / Country"
            value={business.location}
          />
          <DetailItem
            icon={Clock}
            label="Timezone"
            value={business.timezone}
            color="var(--color-super-admin-light)"
          />
          <DetailItem
            icon={Calendar}
            label="Registered Date"
            value={business.created}
          />
          <DetailItem
            icon={Shield}
            label="Creation Origin"
            value={business.creationSource}
            color="var(--color-ready)"
          />
        </div>
      </div>
    </Modal>
  );
};

export default BusinessDetailsModal;

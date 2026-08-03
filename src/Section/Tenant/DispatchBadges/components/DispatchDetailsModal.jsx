import {
  Building2,
  FileText,
  MapPin,
  Package,
  Truck,
  User,
} from "lucide-react";
import Badge from "../../../../Components/UI/Badge";
import Button from "../../../../Components/UI/Button";
import Card from "../../../../Components/UI/Card";
import IconWrapper from "../../../../Components/UI/IconWrapper";
import Modal from "../../../../Components/UI/Modal";
import { STATUS_BADGE_VARIANTS } from "../data";

const DispatchDetailsModal = ({ batch, open = false, onClose }) => {
  if (!batch) return null;

  const statusVariant = STATUS_BADGE_VARIANTS[batch.status] || "neutral";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Batch Details - ${batch.id}`}
      description="View dispatch lifecycle, partner information, and linen tracking metadata."
      width={620}
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="outline"
            onClick={() => {
              window.print();
            }}
            leftIcon={<FileText size={16} />}
            size={{ minHeight: 40, padding: "0 18px" }}
            className="rounded-xl border-(--theme-border)"
          >
            Print Manifest
          </Button>

          <Button
            variant="primary"
            onClick={onClose}
            size={{ minHeight: 40, padding: "0 22px" }}
            className="rounded-xl font-semibold"
          >
            Done
          </Button>
        </div>
      }
    >
      <div className="space-y-4 pt-1">
        {/* Status header banner */}
        <Card padding="16px 20px" rounded="16px">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <IconWrapper
                icon={Truck}
                variant="teal"
                sizeClassName="h-10 w-10"
                iconSize={20}
                roundedClassName="rounded-xl"
              />
              <div>
                <div className="text-xs font-semibold text-(--theme-text-secondary)">
                  Batch ID
                </div>
                <div className="text-lg font-bold text-(--theme-text-primary)">
                  {batch.id}
                </div>
              </div>
            </div>
            <Badge variant={statusVariant} size="lg">
              {batch.status}
            </Badge>
          </div>
        </Card>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card padding="14px 16px" rounded="14px">
            <div className="flex items-center gap-3">
              <IconWrapper
                icon={Building2}
                variant="purple"
                sizeClassName="h-8 w-8"
                iconSize={16}
                roundedClassName="rounded-lg"
              />
              <div>
                <div className="text-[11px] font-semibold text-(--theme-text-secondary)">
                  Laundry Partner
                </div>
                <div className="text-sm font-bold text-(--theme-text-primary)">
                  {batch.laundryName}
                </div>
              </div>
            </div>
          </Card>

          <Card padding="14px 16px" rounded="14px">
            <div className="flex items-center gap-3">
              <IconWrapper
                icon={MapPin}
                variant="info"
                sizeClassName="h-8 w-8"
                iconSize={16}
                roundedClassName="rounded-lg"
              />
              <div>
                <div className="text-[11px] font-semibold text-(--theme-text-secondary)">
                  Dispatch Location
                </div>
                <div className="text-sm font-bold text-(--theme-text-primary)">
                  {batch.dispatchLocation}
                </div>
              </div>
            </div>
          </Card>

          <Card padding="14px 16px" rounded="14px">
            <div className="flex items-center gap-3">
              <IconWrapper
                icon={Package}
                variant="success"
                sizeClassName="h-8 w-8"
                iconSize={16}
                roundedClassName="rounded-lg"
              />
              <div>
                <div className="text-[11px] font-semibold text-(--theme-text-secondary)">
                  Total Linen Items
                </div>
                <div className="text-sm font-bold text-(--theme-text-primary)">
                  {batch.items} Items
                </div>
              </div>
            </div>
          </Card>

          <Card padding="14px 16px" rounded="14px">
            <div className="flex items-center gap-3">
              <IconWrapper
                icon={User}
                variant="neutral"
                sizeClassName="h-8 w-8"
                iconSize={16}
                roundedClassName="rounded-lg"
              />
              <div>
                <div className="text-[11px] font-semibold text-(--theme-text-secondary)">
                  Dispatched By
                </div>
                <div className="text-sm font-bold text-(--theme-text-primary)">
                  {batch.createdBy}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Logistics & Timing Section */}
        <div className="bg-(--theme-surface-strong) p-4 rounded-xl border border-(--theme-border) space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-(--theme-text-secondary)">
            Logistics & Transport Info
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-(--theme-text-secondary)">Created:</span>{" "}
              <span className="font-semibold text-(--theme-text-primary)">
                {batch.created}
              </span>
            </div>
            <div>
              <span className="text-(--theme-text-secondary)">Est. Return:</span>{" "}
              <span className="font-semibold text-(--theme-text-primary)">
                {batch.estimatedReturn || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-(--theme-text-secondary)">Assigned Driver:</span>{" "}
              <span className="font-semibold text-(--theme-text-primary)">
                {batch.driverName || "Standard Transport"}
              </span>
            </div>
            <div>
              <span className="text-(--theme-text-secondary)">Vehicle No:</span>{" "}
              <span className="font-semibold text-(--theme-text-primary)">
                {batch.vehicleNumber || "N/A"}
              </span>
            </div>
          </div>

          {batch.notes && (
            <div className="pt-2 border-t border-(--theme-border) text-xs">
              <span className="text-(--theme-text-secondary) font-semibold">
                Notes:
              </span>{" "}
              <span className="text-(--theme-text-primary)">{batch.notes}</span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DispatchDetailsModal;

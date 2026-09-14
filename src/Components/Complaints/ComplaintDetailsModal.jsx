import { useState } from "react";
import {
  Calendar,
  Building2,
  TowelRack,
  User,
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  ZoomIn,
  Image as ImageIcon,
} from "lucide-react";
import Modal from "../UI/Modal";
import Badge from "../UI/Badge";
import Button from "../UI/Button";
import {
  updateAdminComplaintStatus,
  updateTenantComplaintStatus,
  updateLaundryComplaintStatus,
} from "../../axios/complaints";
import { toast } from "../../Utils/toast";

const getPriorityVariant = (priority) => {
  switch (priority) {
    case "urgent":
      return "danger";
    case "high":
      return "warning";
    case "medium":
      return "info";
    case "low":
    default:
      return "neutral";
  }
};

const getStatusVariant = (status) => {
  switch (status) {
    case "resolved":
      return "success";
    case "in_review":
      return "info";
    case "rejected":
      return "danger";
    case "pending":
    default:
      return "warning";
  }
};

const ComplaintDetailsModal = ({
  open,
  onClose,
  complaint,
  role = "superadmin", // 'superadmin' | 'tenant' | 'laundry'
  onStatusUpdated,
}) => {
  const [lightboxImage, setLightboxImage] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  if (!complaint) return null;

  const images = Array.isArray(complaint.images)
    ? complaint.images
    : typeof complaint.images === "string"
    ? JSON.parse(complaint.images || "[]")
    : [];

  const isTenant = role === "tenant";
  const isLaundry = role === "laundry";
  const isSuperAdmin = role === "superadmin";

  const isSender =
    (isTenant && complaint.senderType === "tenant") ||
    (isLaundry && complaint.senderType === "laundry");

  const handleStatusChange = async (nextStatus) => {
    setIsUpdatingStatus(true);
    try {
      let res;
      if (isSuperAdmin) {
        res = await updateAdminComplaintStatus(complaint.id, { status: nextStatus });
      } else if (isTenant) {
        res = await updateTenantComplaintStatus(complaint.id, { status: nextStatus });
      } else {
        res = await updateLaundryComplaintStatus(complaint.id, { status: nextStatus });
      }

      toast.success(`Complaint status updated to ${nextStatus.replace("_", " ")}`);
      if (onStatusUpdated) {
        onStatusUpdated(res?.data || { ...complaint, status: nextStatus });
      }
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Failed to update complaint status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const formattedDate = complaint.createdAt
    ? new Date(complaint.createdAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "N/A";

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={`Complaint Details — ${complaint.ticketNumber}`}
        size="lg"
      >
        <div className="space-y-5">
          {/* Header Metadata Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-(--theme-border) bg-(--theme-surface-strong)/30 p-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-(--theme-text-primary)">
                {complaint.ticketNumber}
              </span>
              <Badge variant={getStatusVariant(complaint.status)} size="sm">
                {complaint.status?.replace("_", " ").toUpperCase()}
              </Badge>
              <Badge variant={getPriorityVariant(complaint.priority)} size="sm">
                {complaint.priority?.toUpperCase()} PRIORITY
              </Badge>
              {!isSuperAdmin && (
                <Badge variant={isSender ? "neutral" : "primary"} size="sm">
                  {isSender ? "Sent by You" : "Received"}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-(--theme-text-muted)">
              <Calendar size={13} />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Involved Parties Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Tenant/Business Party */}
            <div className="rounded-xl border border-(--theme-border) bg-(--theme-surface) p-3.5 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-aurora-teal)/10 text-(--color-aurora-teal)">
                <Building2 size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-(--theme-text-muted)">
                  Business (Tenant)
                </span>
                <p className="font-bold text-sm text-(--theme-text-primary) truncate">
                  {complaint.tenant?.companyName || "Business"}
                </p>
                <p className="text-xs text-(--theme-text-secondary) truncate">
                  {complaint.tenant?.email || "No email available"}
                </p>
              </div>
            </div>

            {/* Laundry Party */}
            <div className="rounded-xl border border-(--theme-border) bg-(--theme-surface) p-3.5 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-aurora-teal)/10 text-(--color-aurora-teal)">
                <TowelRack size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-(--theme-text-muted)">
                  Laundry Partner
                </span>
                <p className="font-bold text-sm text-(--theme-text-primary) truncate">
                  {complaint.laundry?.companyName || "Laundry"}
                </p>
                <p className="text-xs text-(--theme-text-secondary) truncate">
                  {complaint.laundry?.email || "No email available"}
                </p>
              </div>
            </div>
          </div>

          {/* Sender User Info */}
          {complaint.senderUser && (
            <div className="flex items-center gap-2 text-xs text-(--theme-text-secondary) px-1">
              <User size={14} className="text-(--color-aurora-teal)" />
              <span>
                Submitted by:{" "}
                <strong className="text-(--theme-text-primary)">
                  {complaint.senderUser.fullName}
                </strong>{" "}
                ({complaint.senderUser.email}) via {complaint.senderType} portal
              </span>
            </div>
          )}

          {/* Subject & Detailed Message */}
          <div className="rounded-2xl border border-(--theme-border) bg-(--theme-surface) p-4 space-y-2">
            <h3 className="text-base font-bold text-(--theme-text-primary)">
              {complaint.subject}
            </h3>
            <p className="text-sm text-(--theme-text-secondary) whitespace-pre-wrap leading-relaxed">
              {complaint.description}
            </p>
          </div>

          {/* Attached Images Gallery */}
          {images.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon size={15} className="text-(--color-aurora-teal)" />
                <span className="text-xs font-bold uppercase tracking-wider text-(--theme-text-primary)">
                  Attached Photos / Evidence ({images.length})
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setLightboxImage(imgUrl)}
                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-(--theme-border) bg-(--theme-surface) p-1 transition-all hover:border-(--color-aurora-teal) hover:shadow-xs"
                  >
                    <img
                      src={imgUrl}
                      alt={`Evidence ${idx + 1}`}
                      className="h-24 w-full rounded-lg object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/logo.png";
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                      <ZoomIn size={20} className="text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolution Notes (if any) */}
          {complaint.resolutionNotes && (
            <div className="rounded-xl border border-(--color-ready)/30 bg-(--color-ready-bg) p-3 text-xs space-y-1">
              <span className="font-bold text-(--color-completed) uppercase tracking-wider text-[10px]">
                Resolution Notes
              </span>
              <p className="text-(--theme-text-primary)">{complaint.resolutionNotes}</p>
            </div>
          )}

          {/* Status Actions */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-(--theme-border)">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-(--theme-text-secondary)">
                Update Status:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {complaint.status !== "in_review" && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Clock size={12} />}
                    onClick={() => handleStatusChange("in_review")}
                    loading={isUpdatingStatus}
                    type="button"
                  >
                    Mark In Review
                  </Button>
                )}
                {complaint.status !== "resolved" && (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<CheckCircle size={12} />}
                    onClick={() => handleStatusChange("resolved")}
                    loading={isUpdatingStatus}
                    type="button"
                  >
                    Mark Resolved
                  </Button>
                )}
                {complaint.status !== "rejected" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<AlertTriangle size={12} />}
                    onClick={() => handleStatusChange("rejected")}
                    loading={isUpdatingStatus}
                    type="button"
                  >
                    Reject
                  </Button>
                )}
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={onClose} type="button">
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Lightbox Modal for Full Image Zoom */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm transition-all"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black p-2 shadow-2xl">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black"
              title="Close image"
            >
              <X size={18} />
            </button>
            <img
              src={lightboxImage}
              alt="High-resolution evidence"
              className="max-h-[85vh] max-w-full rounded-xl object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ComplaintDetailsModal;

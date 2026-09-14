import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Building2,
  TowelRack,
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileImage,
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  Maximize2,
} from "lucide-react";
import Button from "../UI/Button";
import Card from "../UI/Card";
import Badge from "../UI/Badge";
import Input from "../UI/Input";
import Modal from "../UI/Modal";
import TableSkeleton from "../UI/TableSkeleton";
import {
  getAdminComplaintDetails,
  getTenantComplaintDetails,
  getLaundryComplaintDetails,
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

const ComplaintDetailsView = ({ role = "tenant" }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isTenant = role === "tenant";
  const isLaundry = role === "laundry";
  const isSuperAdmin = role === "superadmin";

  const backRoute = isTenant
    ? "/business/complaints"
    : isLaundry
    ? "/laundry/complaints"
    : "/superadmin/complaints";

  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        let res;
        if (isSuperAdmin) {
          res = await getAdminComplaintDetails(id);
        } else if (isTenant) {
          res = await getTenantComplaintDetails(id);
        } else {
          res = await getLaundryComplaintDetails(id);
        }

        const data = res?.data || res;
        if (isMounted) {
          setComplaint(data);
          if (data?.resolutionNotes) {
            setResolutionNotes(data.resolutionNotes);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load complaint details:", err);
          toast.error("Failed to load complaint details.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (id) {
      fetchDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [id, isSuperAdmin, isTenant, isLaundry]);

  const handleStatusChange = async (nextStatus) => {
    setIsUpdatingStatus(true);
    try {
      let res;
      const payload = {
        status: nextStatus,
        resolutionNotes: resolutionNotes.trim() || undefined,
      };

      if (isSuperAdmin) {
        res = await updateAdminComplaintStatus(id, payload);
      } else if (isTenant) {
        res = await updateTenantComplaintStatus(id, payload);
      } else {
        res = await updateLaundryComplaintStatus(id, payload);
      }

      const updated = res?.data || { ...complaint, status: nextStatus, resolutionNotes };
      setComplaint(updated);
      toast.success(`Complaint status updated to ${nextStatus.replace("_", " ")}`);
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Failed to update complaint status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate(backRoute)}
        >
          Back to Complaints
        </Button>
        <Card className="p-8">
          <TableSkeleton rows={5} cols={3} />
        </Card>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate(backRoute)}
        >
          Back to Complaints
        </Button>
        <Card className="p-12 text-center">
          <h3 className="text-base font-bold text-(--theme-text-primary)">
            Complaint Not Found
          </h3>
          <p className="text-sm text-(--theme-text-secondary) mt-1">
            This ticket could not be found or you do not have permission to view it.
          </p>
        </Card>
      </div>
    );
  }

  const images = Array.isArray(complaint.images)
    ? complaint.images
    : typeof complaint.images === "string"
    ? JSON.parse(complaint.images || "[]")
    : [];

  const isSentByMe =
    (isTenant && complaint.senderType === "tenant") ||
    (isLaundry && complaint.senderType === "laundry");

  const createdDateStr = complaint.createdAt
    ? new Date(complaint.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  const businessName =
    complaint.tenant?.businessName ||
    complaint.tenant?.companyName ||
    complaint.tenant?.fullName ||
    "Partner Business";

  const laundryName =
    complaint.laundry?.companyName ||
    complaint.laundry?.fullName ||
    "Partner Laundry";

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(backRoute)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-(--theme-text-secondary) hover:text-(--theme-text-primary) transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Complaints</span>
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-extrabold tracking-tight text-(--theme-text-primary)">
              Ticket {complaint.ticketNumber}
            </h1>
            <Badge variant={getStatusVariant(complaint.status)} size="sm">
              {complaint.status?.replace("_", " ").toUpperCase()}
            </Badge>
            <Badge variant={getPriorityVariant(complaint.priority)} size="sm">
              {complaint.priority?.toUpperCase()} PRIORITY
            </Badge>
            {!isSuperAdmin && (
              <Badge variant={isSentByMe ? "neutral" : "primary"} size="sm">
                {isSentByMe ? (
                  <span className="flex items-center gap-1">
                    <ArrowUpRight size={13} /> Sent by You
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <ArrowDownLeft size={13} /> Received
                  </span>
                )}
              </Badge>
            )}
          </div>
          <p className="text-xs text-(--theme-text-secondary) mt-1.5 flex items-center gap-1.5">
            <Calendar size={13} />
            <span>Filed on {createdDateStr}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate(backRoute)}
          >
            Back to List
          </Button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Details, Evidence, Resolution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Complaint Subject & Message */}
          <Card className="p-6 space-y-4">
            <div className="pb-3 border-b border-(--theme-border)">
              <span className="text-[11px] font-bold text-(--color-aurora-teal) uppercase tracking-wider">
                Subject
              </span>
              <h2 className="text-lg font-bold text-(--theme-text-primary) mt-0.5">
                {complaint.subject}
              </h2>
            </div>

            <div>
              <span className="text-[11px] font-bold text-(--theme-text-secondary) uppercase tracking-wider block mb-2">
                Detailed Message & Description
              </span>
              <div className="p-4 rounded-xl bg-(--theme-surface-strong)/20 border border-(--theme-border) text-sm leading-relaxed text-(--theme-text-primary) whitespace-pre-wrap">
                {complaint.description}
              </div>
            </div>

            {/* Resolution Notes if any */}
            {complaint.resolutionNotes && (
              <div className="p-4 rounded-xl bg-(--color-ready-bg) border border-(--color-ready)/20 text-sm">
                <div className="flex items-center gap-2 text-(--color-ready) font-bold text-xs uppercase tracking-wider mb-1">
                  <CheckCircle size={15} />
                  <span>Resolution / Closing Remarks</span>
                </div>
                <p className="text-(--theme-text-primary) text-xs leading-relaxed">
                  {complaint.resolutionNotes}
                </p>
              </div>
            )}
          </Card>

          {/* Attached Photos / Evidence Gallery */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-(--theme-border)">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-(--color-aurora-teal)/10 flex items-center justify-center text-(--color-aurora-teal)">
                  <FileImage size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-(--theme-text-primary)">
                    Photographic Evidence
                  </h3>
                  <p className="text-xs text-(--theme-text-secondary)">
                    {images.length} high-resolution evidence photo(s) attached
                  </p>
                </div>
              </div>
              <Badge variant="neutral" size="sm">
                {images.length} / 8 Photos
              </Badge>
            </div>

            {images.length === 0 ? (
              <div className="p-8 text-center text-xs text-(--theme-text-secondary)">
                No photographic evidence was attached to this ticket.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((imgUrl, index) => (
                  <div
                    key={index}
                    onClick={() => setLightboxImage(imgUrl)}
                    className="group relative rounded-xl overflow-hidden border border-(--theme-border) bg-black/5 aspect-square cursor-pointer transition-all hover:shadow-md hover:border-(--color-aurora-teal)"
                  >
                    <img
                      src={imgUrl}
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="p-2 rounded-full bg-black/70 text-white hover:bg-(--color-aurora-teal) transition-colors">
                        <Maximize2 size={16} />
                      </span>
                      <a
                        href={imgUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-full bg-black/70 text-white hover:bg-(--color-aurora-teal) transition-colors"
                        title="Open full image"
                      >
                        <Download size={16} />
                      </a>
                    </div>
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 text-[10px] font-bold text-white">
                      Photo {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (1 Col): Involved Parties & Status Actions */}
        <div className="space-y-6">
          {/* Parties Card */}
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-(--theme-text-primary) pb-3 border-b border-(--theme-border)">
              Involved Parties
            </h3>

            {/* Business Card */}
            <div className="p-3.5 rounded-xl bg-(--theme-surface-strong)/20 border border-(--theme-border) space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-(--color-aurora-teal)/10 text-(--color-aurora-teal) flex items-center justify-center">
                  <Building2 size={16} />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[10px] font-bold text-(--theme-text-secondary) uppercase tracking-wider block">
                    Business (Tenant)
                  </span>
                  <p className="text-xs font-bold text-(--theme-text-primary) truncate">
                    {businessName}
                  </p>
                </div>
              </div>
              <div className="text-[11px] text-(--theme-text-secondary) pl-10 space-y-0.5">
                <p className="truncate">{complaint.tenant?.email || "No email available"}</p>
                <p className="truncate">{complaint.tenant?.phone || "No phone available"}</p>
              </div>
            </div>

            {/* Laundry Card */}
            <div className="p-3.5 rounded-xl bg-(--theme-surface-strong)/20 border border-(--theme-border) space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-(--color-aurora-teal)/10 text-(--color-aurora-teal) flex items-center justify-center">
                  <TowelRack size={16} />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[10px] font-bold text-(--theme-text-secondary) uppercase tracking-wider block">
                    Laundry Partner
                  </span>
                  <p className="text-xs font-bold text-(--theme-text-primary) truncate">
                    {laundryName}
                  </p>
                </div>
              </div>
              <div className="text-[11px] text-(--theme-text-secondary) pl-10 space-y-0.5">
                <p className="truncate">{complaint.laundry?.email || "No email available"}</p>
                <p className="truncate">{complaint.laundry?.phone || "No phone available"}</p>
              </div>
            </div>

            {/* Submitter User Info */}
            <div className="pt-2 border-t border-(--theme-border) flex items-center gap-2 text-xs text-(--theme-text-secondary)">
              <User size={14} className="text-(--color-aurora-teal) shrink-0" />
              <div className="overflow-hidden">
                <span className="text-[10px] text-(--theme-text-muted) block">
                  Logged By
                </span>
                <span className="font-semibold text-(--theme-text-primary) truncate block">
                  {complaint.senderUser?.fullName || "Staff User"}
                </span>
                <span className="text-[10px] truncate block">
                  {complaint.senderUser?.email || ""}
                </span>
              </div>
            </div>
          </Card>

          {/* Status & Actions Card */}
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-(--theme-text-primary) pb-3 border-b border-(--theme-border)">
              {isSuperAdmin ? "Status Overview" : "Status & Actions"}
            </h3>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-(--theme-text-secondary) block mb-1">
                  Current Status:
                </span>
                <Badge variant={getStatusVariant(complaint.status)} size="sm">
                  {complaint.status?.replace("_", " ").toUpperCase()}
                </Badge>
              </div>

              {!isSuperAdmin && (
                <>
                  <div>
                    <Input
                      label="Resolution Notes (Optional)"
                      multiline
                      rows={3}
                      value={resolutionNotes}
                      onChange={(val) => setResolutionNotes(val)}
                      placeholder="Provide closing notes or resolution explanation..."
                      disabled={isUpdatingStatus}
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    {complaint.status !== "in_review" && (
                      <Button
                        variant="outline"
                        size="md"
                        fullWidth
                        leftIcon={<Clock size={15} />}
                        loading={isUpdatingStatus}
                        onClick={() => handleStatusChange("in_review")}
                      >
                        Mark In Review
                      </Button>
                    )}

                    {complaint.status !== "resolved" && (
                      <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        leftIcon={<CheckCircle size={15} />}
                        loading={isUpdatingStatus}
                        onClick={() => handleStatusChange("resolved")}
                      >
                        Mark Resolved
                      </Button>
                    )}

                    {complaint.status !== "rejected" && (
                      <Button
                        variant="ghost"
                        size="md"
                        fullWidth
                        leftIcon={<AlertTriangle size={15} />}
                        loading={isUpdatingStatus}
                        onClick={() => handleStatusChange("rejected")}
                      >
                        Reject Complaint
                      </Button>
                    )}
                  </div>
                </>
              )}

              {isSuperAdmin && (
                <p className="text-xs text-(--theme-text-muted) leading-relaxed pt-1">
                  Super Admin has view-only access. Complaint status and dispute resolution are managed directly between the business and laundry partners.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Evidence Image Preview Modal */}
      <Modal
        open={Boolean(lightboxImage)}
        onClose={() => setLightboxImage(null)}
        title="Evidence Photo Preview"
        width={780}
      >
        <div className="flex flex-col items-center justify-center p-3">
          <img
            src={lightboxImage}
            alt="Evidence full preview"
            className="max-h-[65vh] w-auto rounded-xl object-contain shadow-sm border border-(--theme-border)"
          />
        </div>
      </Modal>
    </div>
  );
};

export default ComplaintDetailsView;

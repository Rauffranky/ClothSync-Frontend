import { ArrowLeft, Building2, Calendar, MapPin, ScanQrCode, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Badge from "../../../../Components/UI/Badge";
import Button from "../../../../Components/UI/Button";
import Card from "../../../../Components/UI/Card";

const BatchHeader = ({
  batch,
  checkoutMode,
}) => {
  const navigate = useNavigate();
  const backPath = checkoutMode ? "/laundry/check-out" : "/laundry/incoming-batches";

  return (
    <div className="space-y-4">
      {/* Top bar with back button and link to bulk scanning */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          className="w-fit"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate(backPath)}
          size="sm"
          variant="outline"
        >
          {checkoutMode ? "Back to Check-Out" : "Back to Batches"}
        </Button>

        <Button
          leftIcon={<ScanQrCode size={15} />}
          onClick={() => navigate("/laundry/bulk-scanning")}
          size="sm"
          variant="primary"
        >
          Go to Bulk Scanning
        </Button>
      </div>

      {/* Main Title & Meta Card */}
      <Card padding="20px 24px" rounded="20px">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-(--theme-text-primary) sm:text-3xl">
                {batch?.id || batch?.batchCode || "Batch Details"}
              </h1>
              <Badge dot size="md" variant={batch?.statusVariant || "info"}>
                {batch?.status || "Pending"}
              </Badge>
              {checkoutMode && (
                <Badge size="sm" variant="purple">
                  Check-Out Mode
                </Badge>
              )}
            </div>

            <p className="text-sm font-medium text-(--theme-text-secondary)">
              {checkoutMode
                ? "View and inspect outgoing batch items and return progress. All scanning operations are performed in Bulk Scanning."
                : "View and inspect incoming batch items and check-in status. All RFID scanning operations are performed in Bulk Scanning."}
            </p>
          </div>

          <Badge dot size="md" variant="neutral">
            View-Only Tracking
          </Badge>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-(--theme-border-soft) pt-4 sm:grid-cols-4">
          <div className="flex items-center gap-2.5">
            <Building2 className="text-(--theme-text-muted)" size={18} />
            <div>
              <div className="text-xs font-semibold text-(--theme-text-muted)">
                Business
              </div>
              <div className="text-sm font-bold text-(--theme-text-primary)">
                {batch?.business || "—"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <MapPin className="text-(--theme-text-muted)" size={18} />
            <div>
              <div className="text-xs font-semibold text-(--theme-text-muted)">
                Dispatch Location
              </div>
              <div className="text-sm font-bold text-(--theme-text-primary)">
                {batch?.location || "—"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Calendar className="text-(--theme-text-muted)" size={18} />
            <div>
              <div className="text-xs font-semibold text-(--theme-text-muted)">
                Dispatch Date
              </div>
              <div className="text-sm font-bold text-(--theme-text-primary)">
                {batch?.dispatchAt || "—"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Tag className="text-(--theme-text-muted)" size={18} />
            <div>
              <div className="text-xs font-semibold text-(--theme-text-muted)">
                Total Tags in Batch
              </div>
              <div className="text-sm font-bold text-(--theme-text-primary)">
                {batch?.totalCount ?? batch?.total ?? 0}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BatchHeader;

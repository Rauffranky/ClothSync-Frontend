import { ArrowLeft, Building2, Calendar, MapPin, Radio, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Badge from "../../../../Components/UI/Badge";
import Button from "../../../../Components/UI/Button";
import Card from "../../../../Components/UI/Card";

const BatchHeader = ({
  batch,
  checkoutMode,
  selectedScanner,
  fixedScanner,
  liveScanMatchesBatch,
  onFixedCommand,
}) => {
  const navigate = useNavigate();
  const backPath = checkoutMode ? "/laundry/check-out" : "/laundry/incoming-batches";

  return (
    <div className="space-y-4">
      {/* Top bar with back button and fixed scanner controls if active */}
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

        {fixedScanner && liveScanMatchesBatch && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-(--theme-text-secondary)">
              Fixed Scanner Control:
            </span>
            <Button
              onClick={() => onFixedCommand?.("start")}
              size="sm"
              variant="primary"
            >
              Start Scan
            </Button>
            <Button
              onClick={() => onFixedCommand?.("stop")}
              size="sm"
              variant="danger"
            >
              Stop Scan
            </Button>
            <Button
              onClick={() => onFixedCommand?.("rescan")}
              size="sm"
              variant="secondary"
            >
              Scan Again
            </Button>
          </div>
        )}
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
                ? "Verify and check out items returning to the business."
                : "Inspect incoming batch items, scan RFID tags, and confirm receipts."}
            </p>
          </div>

          {selectedScanner && (
            <div className="flex items-center gap-2 rounded-xl border border-(--theme-border) bg-(--theme-surface-hover) px-3 py-2 text-xs">
              <Radio className="text-(--color-aurora-teal)" size={16} />
              <div>
                <span className="text-(--theme-text-muted)">Active Scanner: </span>
                <span className="font-bold text-(--theme-text-primary)">
                  {selectedScanner.name || selectedScanner.scannerId}
                </span>
                <span className="ml-1 capitalize text-(--theme-text-muted)">
                  ({selectedScanner.scannerType || "portable"})
                </span>
              </div>
            </div>
          )}
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

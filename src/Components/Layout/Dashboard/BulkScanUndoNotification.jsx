import { useEffect, useState } from "react";
import { Timer, X } from "lucide-react";
import Alert from "../../UI/Alert";
import Badge from "../../UI/Badge";
import Button from "../../UI/Button";

const BulkScanUndoNotification = ({
  notice,
  inline = false,
  onDismiss,
  onUndo,
  isUndoing = false,
}) => {
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(0, new Date(notice.expiresAt).getTime() - Date.now())
  );

  useEffect(() => {
    if (!notice.expiresAt) return undefined;

    const updateRemaining = () => {
      setRemainingMs(Math.max(0, new Date(notice.expiresAt).getTime() - Date.now()));
    };

    updateRemaining();
    const timer = window.setInterval(updateRemaining, 1000);

    return () => window.clearInterval(timer);
  }, [notice.expiresAt]);

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const formattedTime = `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(
    totalSeconds % 60
  ).padStart(2, "0")}`;

  const isExpired = totalSeconds <= 0;

  const getDirectionalMessage = () => {
    const qty = notice.processedTagCount ?? notice.processedCount ?? 0;
    const business = notice.businessName || "Business";
    const laundry = notice.laundryName || "Laundry";

    if (notice.action === "check_out") {
      return (
        <span>
          {qty} Laundry tag(s) checked out successfully from <strong>{business}</strong> to{" "}
          <strong>{laundry}</strong>. You can undo this action in{" "}
          <strong className="font-mono">{formattedTime}</strong>.
        </span>
      );
    }
    if (notice.action === "check_in") {
      return (
        <span>
          {qty} Laundry tag(s) checked in successfully from <strong>{laundry}</strong> to{" "}
          <strong>{business}</strong>. You can undo this action in{" "}
          <strong className="font-mono">{formattedTime}</strong>.
        </span>
      );
    }
    if (notice.kind === "bulk_add") {
      const tagCount = notice.tagCount ?? notice.processedCount ?? 0;
      const assetName = notice.assetName || "Asset";
      return (
        <span>
          {tagCount} new Laundry tag(s) registered successfully and linked to <strong>{assetName}</strong>. You can undo this action in{" "}
          <strong className="font-mono">{formattedTime}</strong>.
        </span>
      );
    }
    return null;
  };

  const directionalMessage = getDirectionalMessage();

  const renderContent = () => {
    if (directionalMessage) {
      return (
        <div className="flex min-w-0 flex-1 items-start sm:items-center gap-2">
          {inline && <Timer aria-hidden="true" size={18} className="shrink-0 mt-0.5 sm:mt-0 text-(--color-overdue)" />}
          <span className="leading-relaxed">
            {isExpired ? <span>Undo time expired.</span> : directionalMessage}
          </span>
          {notice.batchCode && <Badge variant="info">Batch {notice.batchCode}</Badge>}
        </div>
      );
    }

    // Fallback for non-directional (e.g. bulk_add)
    return (
      <div className="flex min-w-0 flex-1 items-start sm:items-center gap-2">
        {inline && <Timer aria-hidden="true" size={18} className="shrink-0 mt-0.5 sm:mt-0 text-(--color-overdue)" />}
        <span className="leading-relaxed flex flex-wrap items-center gap-2">
          {notice.message && <span>{notice.message}</span>}
          {notice.laundryName && <Badge variant="info">{notice.laundryName}</Badge>}
          {notice.batchCode && <Badge variant="info">Batch {notice.batchCode}</Badge>}
          <span>Undo available for</span>
          <Badge className="font-mono text-sm" size="md" variant="danger">
            {formattedTime}
          </Badge>
        </span>
      </div>
    );
  };

  const renderButtons = () => (
    <>
      <Button
        className="shrink-0"
        disabled={isExpired || isUndoing}
        loading={isUndoing}
        onClick={() => onUndo(notice)}
        size="sm"
        variant="danger"
      >
        {isUndoing ? "Undoing..." : "Undo"}
      </Button>
      {!inline && (
        <button
          type="button"
          className="cursor-pointer shrink-0 text-(--color-overdue) opacity-70 hover:opacity-100 transition-opacity"
          onClick={() => onDismiss(notice.id)}
          aria-label="Dismiss undo notice"
        >
          <X size={18} />
        </button>
      )}
    </>
  );

  return (
    <div
      className={
        inline
          ? "px-4 pt-4"
          : "card-glass-inner rounded-2xl overflow-hidden"
      }
    >
      <Alert
        size="sm"
        variant="danger"
        leftIcon={!inline ? <Timer aria-hidden="true" size={18} /> : undefined}
      >
        {inline ? (
          <div className="flex w-full items-start sm:items-center justify-between gap-3">
            {renderContent()}
            <div className="flex shrink-0 items-center gap-3">
              {isExpired && !directionalMessage ? (
                <span className="text-sm font-medium opacity-80">Undo time expired</span>
              ) : null}
              {!isExpired && renderButtons()}
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-2 leading-relaxed">
                {renderContent()}
              </div>
              {!inline && (
                <button
                  type="button"
                  className="cursor-pointer shrink-0 text-(--color-overdue) opacity-70 hover:opacity-100 transition-opacity mt-1"
                  onClick={() => onDismiss(notice.id)}
                  aria-label="Dismiss undo notice"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 pt-1">
              {isExpired ? (
                <span className="text-sm font-medium opacity-80">Undo time expired</span>
              ) : (
                <Button
                  className="shrink-0"
                  disabled={isExpired || isUndoing}
                  loading={isUndoing}
                  onClick={() => onUndo(notice)}
                  size="sm"
                  variant="danger"
                >
                  {isUndoing ? "Undoing..." : "Undo"}
                </Button>
              )}
            </div>
          </div>
        )}
      </Alert>
    </div>
  );
};

export default BulkScanUndoNotification;

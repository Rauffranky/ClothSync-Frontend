import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, MapPin, Tags } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import Dropdown from "../../../Components/UI/Dropdown";
import Input from "../../../Components/UI/Input";
import Modal from "../../../Components/UI/Modal";
import { getSkippedReasonMessage } from "./data";

const SummaryItem = ({ label, value }) => (
  <div className="rounded-xl border border-(--theme-border) bg-(--theme-surface) p-3">
    <div className="text-xs font-semibold text-(--theme-text-muted)">{label}</div>
    <div className="mt-1 text-xl font-black text-(--theme-text-primary)">{value ?? 0}</div>
  </div>
);

const ExistingTagActionModal = ({
  action,
  busy,
  onClose,
  onConfirm,
  open,
  preview,
  scannerLocation,
  selectedRows,
}) => {
  const isCheckOut = action === "check_out";
  const [laundryLinkId, setLaundryLinkId] = useState(
    () => preview?.defaultLaundry?.linkId ?? null,
  );
  const [dispatchLocation, setDispatchLocation] = useState(
    () => scannerLocation ?? "",
  );
  const [notes, setNotes] = useState("");
  const [showSkipped, setShowSkipped] = useState(true);

  const laundryOptions = useMemo(
    () => (preview?.laundries ?? []).map((laundry) => ({
      label: `${laundry.name ?? "Unnamed laundry"}${laundry.isDefault ? " — Default" : ""}`,
      selectedLabel: laundry.name ?? "Unnamed laundry",
      value: laundry.linkId,
    })),
    [preview?.laundries],
  );
  const uniqueAssetCount = new Set(
    selectedRows.map((row) => row.asset?.id ?? row.assetId).filter(Boolean),
  ).size;
  const skippedItems = preview?.skippedItems ?? [];
  const canConfirm =
    !busy &&
    (preview?.validCount ?? 0) > 0 &&
    (!isCheckOut || Boolean(laundryLinkId));

  const submit = () => {
    if (!canConfirm) return;
    onConfirm({
      ...(isCheckOut
        ? {
            laundryLinkId,
            ...(dispatchLocation.trim()
              ? { dispatchLocation: dispatchLocation.trim() }
              : {}),
            ...(notes.trim() ? { notes: notes.trim() } : {}),
          }
        : {}),
    });
  };

  return (
    <Modal
      closeOnBackdrop={!busy}
      description="Review the backend validation results before applying this movement."
      footer={(
        <>
          <Button disabled={busy} onClick={onClose} variant="outline">Cancel</Button>
          <Button
            disabled={!canConfirm}
            loading={busy}
            onClick={submit}
            variant="primary"
          >
            {isCheckOut ? "Confirm Check Out" : "Confirm Check In"}
          </Button>
        </>
      )}
      onClose={() => { if (!busy) onClose(); }}
      open={open}
      title={isCheckOut ? "Check Out Assets" : "Check In Assets"}
      width={720}
    >
      <div className="space-y-5">
        <div className={`grid gap-3 ${isCheckOut ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
          <SummaryItem label="Selected tags" value={preview?.selectedCount} />
          <SummaryItem label="Valid tags" value={preview?.validCount} />
          {isCheckOut && <SummaryItem label="Unique assets" value={uniqueAssetCount} />}
          <SummaryItem label="Skipped tags" value={preview?.skippedCount} />
        </div>

        {(preview?.validCount ?? 0) === 0 && (
          <Alert leftIcon={<AlertTriangle size={18} />} variant="warning">
            No valid tags selected. Review the skipped reasons below.
          </Alert>
        )}

        {isCheckOut ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Dropdown
                disabled={busy}
                label="Select laundry"
                onChange={setLaundryLinkId}
                options={laundryOptions}
                placeholder="Select laundry"
                value={laundryLinkId}
              />
              {!laundryLinkId && (
                <p className="mb-0 mt-1.5 text-xs font-medium text-(--color-overdue)">
                  A linked laundry is required to check out assets.
                </p>
              )}
            </div>
            <Input
              disabled={busy}
              label="Dispatch location"
              leftIcon={<MapPin size={16} />}
              maxLength={160}
              onChange={setDispatchLocation}
              placeholder="Enter dispatch location"
              value={dispatchLocation}
            />
            <Input
              className="sm:col-span-2"
              disabled={busy}
              label="Notes"
              maxLength={2000}
              multiline
              onChange={setNotes}
              placeholder="Optional notes"
              rows={3}
              value={notes}
            />
          </div>
        ) : (
          <div>
            <div className="mb-2 text-sm font-semibold text-(--theme-text-secondary)">
              Original laundry
            </div>
            {(preview?.returnLaundries ?? []).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {preview.returnLaundries.map((laundry) => (
                  <Badge key={laundry.linkId ?? laundry.laundryId ?? laundry.name} variant="info">
                    {laundry.name ?? laundry.laundry?.name ?? "Original laundry"}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="m-0 text-sm text-(--theme-text-muted)">
                Original batch and laundry will be resolved by the backend.
              </p>
            )}
          </div>
        )}

        {skippedItems.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-(--theme-border)">
            <button
              aria-expanded={showSkipped}
              className="flex w-full items-center justify-between gap-3 bg-(--theme-surface) px-4 py-3 text-left text-sm font-bold text-(--theme-text-primary)"
              onClick={() => setShowSkipped((current) => !current)}
              type="button"
            >
              <span className="flex items-center gap-2"><Tags size={16} />Skipped items ({skippedItems.length})</span>
              <ChevronDown className={showSkipped ? "rotate-180" : ""} size={17} />
            </button>
            {showSkipped && (
              <ul className="m-0 space-y-2 border-t border-(--theme-border) p-4">
                {skippedItems.map((item) => (
                  <li className="text-sm text-(--theme-text-secondary)" key={item.tempTagId ?? item.epc}>
                    <span className="font-mono font-bold text-(--theme-text-primary)">{item.epc ?? "Unknown EPC"}</span>
                    {" — "}{getSkippedReasonMessage(item.reason)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ExistingTagActionModal;

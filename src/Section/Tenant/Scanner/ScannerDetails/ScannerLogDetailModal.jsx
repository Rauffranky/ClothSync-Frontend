import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Layers,
  MapPin,
  QrCode,
  Shirt,
  Tag,
  User,
  Waves,
} from "lucide-react";
import Modal from "../../../../Components/UI/Modal";
import Badge from "../../../../Components/UI/Badge";
import Button from "../../../../Components/UI/Button";
import ProgressBar from "../../../../Components/UI/ProgressBar";
import { formatDateTime } from "../../../../Utils/date";

const formatDirection = (direction) => {
  if (!direction) return "-";
  return String(direction)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const getStatusVariant = (status) => {
  const val = String(status || "").toLowerCase();
  if (val.includes("failed") || val.includes("exception") || val.includes("error")) return "danger";
  if (val.includes("unlinked") || val.includes("warning")) return "warning";
  if (val.includes("laundry") || val.includes("transit")) return "info";
  if (val.includes("business") || val.includes("active") || val.includes("ready")) return "success";
  return "neutral";
};

const ScannerLogDetailModal = ({ isOpen, onClose, log }) => {
  const [copied, setCopied] = useState(false);

  if (!log) return null;

  const tagCode = log.tag?.tagCode || log.tagCode;
  const tagId = log.tag?.id || log.tagId;
  const epc = log.tag?.epc || log.epc || "";
  const assetName = log.asset?.name || log.assetName;
  const assetCode = log.asset?.assetCode || log.assetCode;
  const assetId = log.asset?.id || log.assetId;
  const batchCode = log.batch?.batchCode || log.batchCode;
  const batchId = log.batch?.id || log.laundryBatchId || log.batchId;
  const operator = log.operator;
  const metadata = log.metadata || {};
  // Asset Wash Metrics
  const assetWashCount = Number(
    log.assetWashCount ??
    log.asset?.washCount ??
    metadata.assetWashCount ??
    metadata.washCount ??
    0
  );
  const assetWashLimit = Number(
    log.assetWashLimit ??
    log.asset?.washLimit ??
    metadata.assetWashLimit ??
    metadata.washLimit ??
    100
  );
  const assetWashPercent =
    assetWashLimit > 0
      ? Math.min(100, Math.round((assetWashCount / assetWashLimit) * 100))
      : 0;

  // Tag Wash Metrics
  const tagWashCount = Number(
    log.tagWashCount ??
    log.tag?.washCount ??
    log.tag?.totalLaundryCycles ??
    metadata.tagWashCount ??
    0
  );
  const tagWashLimit = Number(
    log.tagWashLimit ??
    log.tag?.washLimit ??
    metadata.tagWashLimit ??
    100
  );
  const tagWashPercent =
    tagWashLimit > 0
      ? Math.min(100, Math.round((tagWashCount / tagWashLimit) * 100))
      : 0;
  const action = log.scanAction || metadata.scanAction || (log.mode === "entry" ? "check_in" : log.mode === "exit" ? "check_out" : null);
  const isCheckIn = action === "check_in";
  const isCheckOut = action === "check_out";
  const scannerConfigMode = log.mode || "entry";
  const isManualOverride = Boolean(
    log.isManualAction ||
    log.actionSource === "manual" ||
    metadata.isManual ||
    metadata.actionSource === "manual" ||
    metadata.source === "manual_checkout" ||
    metadata.source === "bulk_scan_confirmed_action" ||
    (scannerConfigMode === "entry" && isCheckOut) ||
    (scannerConfigMode === "exit" && isCheckIn)
  );

  const handleCopyEpc = async () => {
    if (!epc) return;
    try {
      await navigator.clipboard.writeText(epc);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Scanner Log Details"
      description="Complete event and classification breakdown for this scan activity."
      width={680}
      footer={
        <div className="flex w-full items-center justify-end">
          <Button onClick={onClose} size="sm" variant="secondary">
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-5 py-1">
        {/* Top Highlight Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-(--theme-border-soft) bg-(--button-ghost-bg) p-4">
          <div className="flex items-center gap-3">
            <div
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${
                isCheckIn
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : isCheckOut
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                  : "border-(--theme-border-soft) bg-(--theme-surface-strong) text-(--color-aurora-teal)"
              }`}
            >
              {isCheckIn ? (
                <ArrowDownLeft size={20} />
              ) : isCheckOut ? (
                <ArrowUpRight size={20} />
              ) : (
                <QrCode size={20} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-black text-(--theme-text-primary)">
                  {isCheckIn ? "Check In" : isCheckOut ? "Check Out" : "Scan Event"}
                </span>
                {isManualOverride && (
                  <span className="rounded px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Manual Action
                  </span>
                )}
                <Badge size="sm" variant={getStatusVariant(log.status)}>
                  {log.statusLabel || String(log.status || "Unknown").replace(/[_-]+/g, " ")}
                </Badge>
              </div>
              <p className="m-0 mt-0.5 text-xs font-medium text-(--theme-text-muted)">
                Direction: {formatDirection(log.scanDirection)}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-(--theme-text-secondary)">
              <Clock size={13} className="text-(--color-aurora-teal)" />
              <span>{formatDateTime(log.scannedAt || log.createdAt, true) || "-"}</span>
            </div>
            <span className="mt-1 inline-block rounded-md border border-(--theme-border-soft) px-2 py-0.5 font-mono text-[11px] font-bold uppercase text-(--theme-text-muted)">
              Scanner Mode: {scannerConfigMode}
            </span>
          </div>
        </div>

        {/* Manual Override Clarification Banner */}
        {isManualOverride && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200">
            <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-amber-300">Scanner Mode vs Manual Action:</span>
              <p className="m-0 leading-relaxed text-amber-200/90">
                The scanner hardware was set to <strong className="text-white uppercase font-mono">{scannerConfigMode}</strong> mode, but this item was processed as a <strong className="text-white font-bold">Manual {isCheckIn ? "Check In" : "Check Out"}</strong> override action by the operator.
              </p>
            </div>
          </div>
        )}

        {/* Tag & EPC Card */}
        <div className="rounded-2xl border border-(--theme-border-soft) p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-(--color-sky-blue)" />
              <h3 className="m-0 text-xs font-black uppercase tracking-wider text-(--theme-text-muted)">
                RFID Tag Information
              </h3>
            </div>
            {metadata.tagStatus && (
              <Badge size="xs" variant="success">
                {String(metadata.tagStatus).toUpperCase()}
              </Badge>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <span className="text-xs font-semibold text-(--theme-text-muted)">Tag Code</span>
              <p className="m-0 mt-0.5 text-sm font-bold text-(--color-sky-blue)">
                {tagId ? (
                  <Link
                    to={`/business/tags/${tagId}`}
                    className="inline-flex items-center gap-1 hover:underline"
                  >
                    {tagCode || "—"}
                    <ExternalLink size={12} />
                  </Link>
                ) : (
                  tagCode || "—"
                )}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-(--theme-text-muted)">EPC Number</span>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-(--theme-text-primary)">
                  {epc || "—"}
                </span>
                {epc && (
                  <button
                    type="button"
                    onClick={handleCopyEpc}
                    className="grid h-6 w-6 place-items-center rounded border border-(--theme-border-soft) bg-(--button-ghost-bg) text-(--theme-text-muted) transition hover:text-(--theme-text-primary)"
                    title="Copy EPC"
                  >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tag Wash Counter Meter */}
          <div className="mt-4 rounded-xl border border-(--theme-border-soft) bg-(--theme-surface-strong) p-3">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-(--theme-text-secondary)">
                <Waves size={13} className="text-(--color-sky-blue)" />
                Tag Wash Lifecycle
              </span>
              <span className="font-bold text-(--theme-text-primary)">
                {tagWashCount} / {tagWashLimit} Washes ({tagWashPercent}%)
              </span>
            </div>
            <ProgressBar
              value={tagWashCount}
              max={tagWashLimit}
              variant={tagWashPercent > 85 ? "danger" : tagWashPercent > 60 ? "warning" : "teal"}
              heightClass="h-2"
            />
          </div>
        </div>

        {/* Asset Details Card */}
        <div className="rounded-2xl border border-(--theme-border-soft) p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shirt size={16} className="text-(--color-aurora-teal)" />
              <h3 className="m-0 text-xs font-black uppercase tracking-wider text-(--theme-text-muted)">
                Associated Asset
              </h3>
            </div>
            {metadata.assetStatus && (
              <span className="font-mono text-xs font-semibold text-(--theme-text-muted)">
                Status: {metadata.assetStatus}
              </span>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <span className="text-xs font-semibold text-(--theme-text-muted)">Asset Name</span>
              <p className="m-0 mt-0.5 text-sm font-bold text-(--theme-text-primary)">
                {assetId ? (
                  <Link
                    to={`/business/assets/${assetId}`}
                    className="inline-flex items-center gap-1 hover:underline"
                  >
                    {assetName || "—"}
                    <ExternalLink size={12} />
                  </Link>
                ) : (
                  assetName || "—"
                )}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-(--theme-text-muted)">Asset Code</span>
              <p className="m-0 mt-0.5 font-mono text-xs font-bold text-(--theme-text-secondary)">
                {assetCode || "—"}
              </p>
            </div>
          </div>

          {/* Asset Wash Counter Meter */}
          <div className="mt-4 rounded-xl border border-(--theme-border-soft) bg-(--theme-surface-strong) p-3">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-(--theme-text-secondary)">
                <Waves size={13} className="text-(--color-aurora-teal)" />
                Asset Wash Lifecycle
              </span>
              <span className="font-bold text-(--theme-text-primary)">
                {assetWashCount} / {assetWashLimit} Washes ({assetWashPercent}%)
              </span>
            </div>
            <ProgressBar
              value={assetWashCount}
              max={assetWashLimit}
              variant={assetWashPercent > 85 ? "danger" : assetWashPercent > 60 ? "warning" : "teal"}
              heightClass="h-2"
            />
          </div>
        </div>

        {/* Batch & Zone Two-Column Section */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Location & Scanner Zone */}
          <div className="rounded-2xl border border-(--theme-border-soft) p-4">
            <div className="mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-(--color-ready)" />
              <h3 className="m-0 text-xs font-black uppercase tracking-wider text-(--theme-text-muted)">
                Location & Scanner
              </h3>
            </div>
            <div className="space-y-2.5">
              <div>
                <span className="text-xs font-semibold text-(--theme-text-muted)">Zone / Station</span>
                <p className="m-0 mt-0.5 text-sm font-bold text-(--theme-text-primary)">
                  {log.zone || "Office Scanner"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 border-y border-(--theme-border-soft) py-2">
                <div>
                  <span className="text-xs font-semibold text-(--theme-text-muted)">Scanner Mode</span>
                  <p className="m-0 mt-0.5 font-mono text-xs font-bold uppercase text-(--theme-text-primary)">
                    {scannerConfigMode}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-(--theme-text-muted)">Executed Action</span>
                  <p className="m-0 mt-0.5 text-xs font-bold text-(--theme-text-primary)">
                    {isCheckIn ? "Check In" : isCheckOut ? (isManualOverride ? "Manual Check Out" : "Check Out") : action || "-"}
                  </p>
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-(--theme-text-muted)">Scan Direction</span>
                <p className="m-0 mt-0.5 text-xs font-semibold text-(--theme-text-secondary)">
                  {formatDirection(log.scanDirection)}
                </p>
              </div>
            </div>
          </div>

          {/* Batch Information */}
          <div className="rounded-2xl border border-(--theme-border-soft) p-4">
            <div className="mb-3 flex items-center gap-2">
              <Boxes size={16} className="text-(--color-super-admin-light)" />
              <h3 className="m-0 text-xs font-black uppercase tracking-wider text-(--theme-text-muted)">
                Batch Details
              </h3>
            </div>
            <div className="space-y-2.5">
              <div>
                <span className="text-xs font-semibold text-(--theme-text-muted)">Batch Code</span>
                <p className="m-0 mt-0.5 text-sm font-bold text-(--color-sky-blue)">
                  {batchId ? (
                    <Link
                      to={`/business/dispatch-batches/${batchId}`}
                      className="inline-flex items-center gap-1 hover:underline"
                    >
                      {batchCode || batchId}
                      <ExternalLink size={12} />
                    </Link>
                  ) : (
                    batchCode || "—"
                  )}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-(--theme-text-muted)">Batch Volume</span>
                <p className="m-0 mt-0.5 text-xs font-semibold text-(--theme-text-primary)">
                  {log.items ? `${log.items} Items Scanned` : "Individual Scan"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Operator & System Audit */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Operator Info */}
          <div className="rounded-2xl border border-(--theme-border-soft) p-4">
            <div className="mb-3 flex items-center gap-2">
              <User size={16} className="text-(--color-aurora-teal)" />
              <h3 className="m-0 text-xs font-black uppercase tracking-wider text-(--theme-text-muted)">
                Operator
              </h3>
            </div>
            {operator && operator.name ? (
              <div className="space-y-1">
                <p className="m-0 text-sm font-bold text-(--theme-text-primary)">
                  {operator.name}
                </p>
                {operator.role && (
                  <p className="m-0 text-xs font-medium text-(--theme-text-muted)">
                    {String(operator.role).replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </p>
                )}
                {operator.email && (
                  <p className="m-0 font-mono text-xs text-(--theme-text-muted)">
                    {operator.email}
                  </p>
                )}
              </div>
            ) : (
              <p className="m-0 text-xs font-medium text-(--theme-text-muted)">
                System Automatic Scan
              </p>
            )}
          </div>

          {/* Audit / Technical Info */}
          <div className="rounded-2xl border border-(--theme-border-soft) p-4">
            <div className="mb-3 flex items-center gap-2">
              <Layers size={16} className="text-(--color-pending)" />
              <h3 className="m-0 text-xs font-black uppercase tracking-wider text-(--theme-text-muted)">
                System Metadata
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-(--theme-text-muted)">Event Type:</span>
                <span className="font-semibold text-(--theme-text-primary)">
                  {log.eventType || "classified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--theme-text-muted)">Scan Group:</span>
                <span className="font-semibold text-(--theme-text-primary)">
                  {metadata.scanGroup || "existing_linked"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--theme-text-muted)">Last Activity:</span>
                <span className="font-semibold text-(--theme-text-primary)">
                  {formatDateTime(log.lastActivity, true) || "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Exception Reason if present */}
        {metadata.exceptionReason && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs">
            <span className="font-bold text-red-400">Exception Reason:</span>
            <p className="m-0 mt-1 text-red-200">{metadata.exceptionReason}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ScannerLogDetailModal;

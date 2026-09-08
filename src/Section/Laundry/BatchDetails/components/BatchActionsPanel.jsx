import { useState } from "react";
import { CheckCheck, Clock3, Play, RotateCcw, StopCircle, TriangleAlert, Zap } from "lucide-react";
import Badge from "../../../../Components/UI/Badge";
import Button from "../../../../Components/UI/Button";
import Card from "../../../../Components/UI/Card";
import Dropdown from "../../../../Components/UI/Dropdown";
import Modal from "../../../../Components/UI/Modal";

const BatchActionsPanel = ({
  batch,
  checkoutMode,
  canStartSession,
  compatibleScanners,
  scannerId,
  onScannerChange,
  liveScanMatchesBatch,
  receivedTagIds,
  missingTagIds,
  remainingItems,
  counters,
  hasPendingItems,
  isContinuing,
  isClearing,
  isFinishing,
  isReceiving,
  onContinueScanning,
  onClearScanData,
  onFinishSession,
  onReceive,
  remainingChoice,
  setRemainingChoice,
}) => {
  const [isConfirmingFinishModal, setIsConfirmingFinishModal] = useState(false);
  const [isConfirmingCheckoutModal, setIsConfirmingCheckoutModal] = useState(false);

  const scannerOptions = compatibleScanners.map((s) => ({
    value: s.id,
    label: `${s.name || s.scannerId} (${s.scannerType || "portable"})`,
  }));

  return (
    <Card padding="20px 24px" rounded="20px">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Section: Scanner Status / Selection */}
        <div className="flex flex-1 flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className="text-(--color-aurora-teal)" size={20} />
            <span className="font-bold text-(--theme-text-primary)">
              Operational Actions:
            </span>
          </div>

          {liveScanMatchesBatch ? (
            <Badge dot size="md" variant="success">
              Live Session Active
            </Badge>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <Badge dot size="md" variant="neutral">
                No Active Live Session
              </Badge>
              {canStartSession && (
                <div className="w-64">
                  <Dropdown
                    disabled={isContinuing || isReceiving}
                    onChange={onScannerChange}
                    options={scannerOptions}
                    placeholder="Select Scanner"
                    value={scannerId}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* If No Live Scan Started Yet */}
          {!liveScanMatchesBatch && canStartSession && !checkoutMode && (
            <Button
              disabled={!batch?.apiId || !scannerId || isContinuing}
              leftIcon={<Play size={16} />}
              loading={isContinuing}
              onClick={onContinueScanning}
              variant="primary"
            >
              Start / Continue Scan
            </Button>
          )}

          {!liveScanMatchesBatch && canStartSession && checkoutMode && (
            <Button
              disabled={!batch?.apiId || !scannerId || isContinuing}
              leftIcon={<Play size={16} />}
              loading={isContinuing}
              onClick={() => setIsConfirmingCheckoutModal(true)}
              variant="primary"
            >
              Start Checkout Scan
            </Button>
          )}

          {/* If Live Scan Is Active */}
          {liveScanMatchesBatch && (
            <Button
              disabled={isReceiving || isFinishing}
              leftIcon={<RotateCcw size={16} />}
              loading={isClearing}
              onClick={onClearScanData}
              variant="secondary"
            >
              Clear Scan Data
            </Button>
          )}

          {liveScanMatchesBatch && !checkoutMode && (
            <Button
              disabled={
                isFinishing ||
                (receivedTagIds.length === 0 && missingTagIds.length === 0)
              }
              leftIcon={<CheckCheck size={16} />}
              loading={isReceiving}
              onClick={onReceive}
              variant="primary"
            >
              Confirm Receipt ({receivedTagIds.length} Scanned)
            </Button>
          )}

          {liveScanMatchesBatch && (
            <Button
              disabled={isReceiving || isClearing}
              leftIcon={<StopCircle size={16} />}
              loading={isFinishing}
              onClick={
                checkoutMode || !hasPendingItems
                  ? onFinishSession
                  : () => setIsConfirmingFinishModal(true)
              }
              variant="outline"
            >
              {checkoutMode ? "Finish Checkout" : "Finish Session"}
            </Button>
          )}
        </div>
      </div>

      {/* Pending Items Resolution Banner (When live session is running and some items are not yet scanned) */}
      {liveScanMatchesBatch && remainingItems.length > 0 && !checkoutMode && (
        <div className="mt-4 rounded-xl border border-(--theme-border) bg-(--theme-surface-hover) p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <TriangleAlert className="text-(--color-pending, #f59e0b)" size={20} />
              <div>
                <span className="font-bold text-(--theme-text-primary)">
                  {remainingItems.length} items still not scanned.
                </span>
                <p className="text-xs text-(--theme-text-muted)">
                  Choose how to treat items that have not passed through the scanner:
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                leftIcon={<Clock3 size={15} />}
                onClick={() => setRemainingChoice("wait")}
                size="sm"
                variant={remainingChoice === "wait" ? "primary" : "outline"}
              >
                Wait for Scan
              </Button>
              <Button
                leftIcon={<TriangleAlert size={15} />}
                onClick={() => setRemainingChoice("missing")}
                size="sm"
                variant={remainingChoice === "missing" ? "warning" : "outline"}
              >
                Mark as Missing
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Finish Session with Pending Items */}
      <Modal
        onClose={() => setIsConfirmingFinishModal(false)}
        open={isConfirmingFinishModal}
        title="Finish Scan Session"
        width={480}
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-(--theme-text-secondary)">
            <strong className="text-(--theme-text-primary)">
              {counters?.receivedCount ?? batch?.receivedCount ?? 0}
            </strong>{" "}
            of{" "}
            <strong className="text-(--theme-text-primary)">
              {counters?.totalCount ?? batch?.total ?? 0}
            </strong>{" "}
            items have been received. There are still{" "}
            <strong className="text-(--color-pending, #f59e0b)">
              {counters?.pendingCount ?? batch?.pendingCount ?? 0}
            </strong>{" "}
            pending items.
          </p>
          <p className="text-xs text-(--theme-text-muted)">
            Finishing now will stop this active scan session. You can continue scanning remaining items later.
          </p>

          <div className="mt-5 flex justify-end gap-2.5">
            <Button
              onClick={() => setIsConfirmingFinishModal(false)}
              variant="secondary"
            >
              Keep Scanning
            </Button>
            <Button
              loading={isFinishing}
              onClick={() => {
                setIsConfirmingFinishModal(false);
                onFinishSession();
              }}
              variant="primary"
            >
              Finish Session Now
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Confirm Checkout Start */}
      <Modal
        onClose={() => setIsConfirmingCheckoutModal(false)}
        open={isConfirmingCheckoutModal}
        title="Start Checkout Session"
        width={480}
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-(--theme-text-secondary)">
            Starting this checkout session will activate the scanner for outbound dispatch.
            Every tag must be scanned before items are sent back to the Business.
          </p>
          <div className="mt-5 flex justify-end gap-2.5">
            <Button
              onClick={() => setIsConfirmingCheckoutModal(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              loading={isContinuing}
              onClick={() => {
                setIsConfirmingCheckoutModal(false);
                onContinueScanning();
              }}
              variant="primary"
            >
              Start Session & Scan
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default BatchActionsPanel;

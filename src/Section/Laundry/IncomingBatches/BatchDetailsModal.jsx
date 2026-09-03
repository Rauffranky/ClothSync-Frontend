import { useState } from "react";
import { CheckCheck, Clock3, Tags, TriangleAlert } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import Card from "../../../Components/UI/Card";
import Modal from "../../../Components/UI/Modal";
import Table from "../../../Components/UI/Table";
import { receiveLaundryDispatchBatch } from "../../../axios/batches/laundryBatches";
import { clearLaundryScannerSession } from "../../../axios/scanners/laundryScanners";
import { toast } from "../../../Utils/toast";
import { clearActiveLaundryScan } from "../../../Utils/laundryScanSession";
import {
  getLaundryBatchErrorMessage,
  normalizeReceiptResponse,
} from "./data";

const itemColumns = [
  { key: "epc", label: "Tag EPC", render: (value) => <span className="font-mono font-bold">{value}</span> },
  { key: "tagCode", label: "Tag Code" },
  { key: "assetName", label: "Asset Name" },
  { key: "assetCode", label: "Asset ID" },
  { key: "category", label: "Category" },
  { key: "status", label: "Item Status", render: (value, row) => <Badge size="sm" variant={row.statusVariant}>{value}</Badge> },
];

const BatchDetailsModal = ({
  batch,
  error,
  isLoading,
  liveScan,
  onClose,
  onReceived,
}) => {
  const [remainingChoice, setRemainingChoice] = useState("wait");
  const [isReceiving, setIsReceiving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const liveScanMatchesBatch =
    liveScan?.sessionId &&
    (!liveScan.batchId || liveScan.batchId === batch?.apiId);
  const receivedTagIds = liveScanMatchesBatch
    ? [...new Set(liveScan?.tagIds || [])]
    : [];
  const receivedTagIdSet = new Set(receivedTagIds);
  const remainingItems = (batch?.items || []).filter(
    (item) =>
      item.tagId &&
      !receivedTagIdSet.has(item.tagId) &&
      !["at_laundry", "missing"].includes(item.statusValue),
  );
  const missingTagIds =
    remainingChoice === "missing"
      ? remainingItems.map((item) => item.tagId)
      : [];
  const counters = receipt || batch;

  const handleReceive = async () => {
    if (!liveScanMatchesBatch || isReceiving) return;
    setIsReceiving(true);
    try {
      const response = await receiveLaundryDispatchBatch(batch.apiId, {
        scanSessionId: liveScan.sessionId,
        tagIds: receivedTagIds,
        missingTagIds,
      });
      const nextReceipt = normalizeReceiptResponse(response);
      setReceipt(nextReceipt);
      setRemainingChoice("wait");
      clearActiveLaundryScan();
      onReceived?.(nextReceipt);
      toast.success(response?.message || "Batch receipt confirmed successfully");
      onClose?.();
    } catch (receiveError) {
      toast.error(
        getLaundryBatchErrorMessage(receiveError, "Unable to receive this batch"),
      );
    } finally {
      setIsReceiving(false);
    }
  };

  const handleClearScanData = async () => {
    if (!liveScan?.sessionId || isClearing || isReceiving) return;
    setIsClearing(true);
    try {
      await clearLaundryScannerSession(liveScan.sessionId);
      clearActiveLaundryScan();
      toast.success("Scan data cleared successfully");
      onClose?.();
    } catch (clearError) {
      toast.error(
        getLaundryBatchErrorMessage(clearError, "Unable to clear scan data"),
      );
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Modal
      description={`${batch?.business || ""} · ${batch?.location || ""}`}
      footer={
        <>
          <Button disabled={isReceiving || isClearing} onClick={onClose} variant="secondary">Close</Button>
          {liveScan?.sessionId && (
            <Button
              disabled={isReceiving}
              loading={isClearing}
              onClick={handleClearScanData}
              variant="secondary"
            >
              Clear Scan Data
            </Button>
          )}
          {liveScanMatchesBatch && (
            <Button
              disabled={receivedTagIds.length === 0 && missingTagIds.length === 0}
              leftIcon={<CheckCheck size={16} />}
              loading={isReceiving}
              onClick={handleReceive}
            >
              Confirm Receipt
            </Button>
          )}
        </>
      }
      onClose={onClose}
      open={Boolean(batch)}
      title={batch?.id}
      width={980}
    >
      {isLoading ? (
        <p className="text-sm font-semibold text-(--theme-text-muted)">Loading batch details...</p>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : batch && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ["Total Items", counters?.totalCount ?? batch.total],
              ["Received", counters?.receivedCount ?? batch.receivedCount],
              ["Missing", counters?.missingCount ?? batch.missingCount],
              ["Pending Scan", counters?.pendingCount ?? batch.pendingCount],
            ].map(([label, value]) => (
              <Card key={label} bodyClassName="space-y-1">
                <p className="m-0 text-2xl font-black text-(--theme-text-primary)">{value ?? 0}</p>
                <p className="m-0 text-xs font-bold text-(--theme-text-muted)">{label}</p>
              </Card>
            ))}
          </div>

          {liveScanMatchesBatch && remainingItems.length > 0 && (
            <Card bodyClassName="space-y-3">
              <p className="m-0 font-black text-(--theme-text-primary)">
                {remainingItems.length} item(s) are still pending
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button leftIcon={<Clock3 size={16} />} onClick={() => setRemainingChoice("wait")} variant={remainingChoice === "wait" ? "primary" : "outline"}>
                  Wait for scan
                </Button>
                <Button leftIcon={<TriangleAlert size={16} />} onClick={() => setRemainingChoice("missing")} variant={remainingChoice === "missing" ? "warning" : "outline"}>
                  Mark as Missing
                </Button>
              </div>
            </Card>
          )}

          {receipt && (
            <Alert variant={receipt.batch.receiptComplete ? "success" : "info"}>
              {receipt.receivedNowCount} received now; {receipt.missingCount} missing and {receipt.pendingCount} pending.
            </Alert>
          )}

          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Business", batch.business], ["Status", receipt?.batch.status || batch.status],
              ["Dispatch location", batch.location], ["Dispatch date", batch.dispatchAt],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-black uppercase tracking-wide text-(--theme-text-muted)">{label}</dt>
                <dd className="m-0 mt-1 font-semibold text-(--theme-text-primary)">{value}</dd>
              </div>
            ))}
          </dl>
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-(--theme-text-primary)"><Tags size={16} /> Batch Items</h3>
            <Table columns={itemColumns} compact data={receipt?.batch.items || batch.items || []} emptyText="No batch items returned" rowKey="id" />
          </div>
        </div>
      )}
    </Modal>
  );
};

export default BatchDetailsModal;

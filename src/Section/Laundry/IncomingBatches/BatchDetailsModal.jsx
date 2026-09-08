import { useEffect, useState } from "react";
import { CheckCheck, Clock3, Tags, TriangleAlert } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import Card from "../../../Components/UI/Card";
import Modal from "../../../Components/UI/Modal";
import Table from "../../../Components/UI/Table";
import Dropdown from "../../../Components/UI/Dropdown";
import Pagination from "../../../Components/UI/Pagination";
import { receiveLaundryDispatchBatch } from "../../../axios/batches/laundryBatches";
import {
  clearLaundryScannerSession,
  finishLaundryScannerSession,
  startLaundryScannerSession,
  getLaundryScannerSessionHistory,
  getLaundryScanners,
  issueLaundryFixedScannerCommand,
} from "../../../axios/scanners/laundryScanners";
import { toast } from "../../../Utils/toast";
import { captureLaundryScanEvent, clearActiveLaundryScan } from "../../../Utils/laundryScanSession";
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
  checkoutMode = false,
  onClose,
  onReceived,
}) => {
  const [remainingChoice, setRemainingChoice] = useState("wait");
  const [isReceiving, setIsReceiving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [isConfirmingCheckout, setIsConfirmingCheckout] = useState(false);
  const [isConfirmingFinish, setIsConfirmingFinish] = useState(false);
  const [history, setHistory] = useState({ items: [], pagination: {} });
  const [historyPage, setHistoryPage] = useState(1);
  const [receipt, setReceipt] = useState(null);
  const [scanners, setScanners] = useState([]);
  const [selectedScannerId, setSelectedScannerId] = useState(null);
  const [scannerError, setScannerError] = useState("");
  useEffect(() => {
    let cancelled = false;
    getLaundryScanners({ status: "active", limit: 100 }).then((response) => {
      if (!cancelled) setScanners((response?.data?.data ?? response?.data)?.items || []);
    }).catch((error) => { if (!cancelled) setScannerError(getLaundryBatchErrorMessage(error, "Unable to load scanners")); });
    return () => { cancelled = true; };
  }, []);
  const sessionPurpose = checkoutMode ? "outbound" : "receipt";
  const compatibleScanners = scanners.filter((scanner) =>
    checkoutMode
      ? scanner.scannerMode !== "entry"
      : scanner.scannerMode !== "exit",
  );
  const compatibleScannerIds = new Set(compatibleScanners.map((scanner) => scanner.id));
  const scannerId = selectedScannerId || (
    compatibleScannerIds.has(liveScan?.scannerId) ? liveScan.scannerId : null
  );
  const selectedScanner = compatibleScanners.find((scanner) => scanner.id === scannerId);
  const fixedScanner = selectedScanner?.scannerType === "fixed" ? selectedScanner : null;
  const canStartSession = checkoutMode
    ? ["at_laundry", "washed"].includes(batch?.statusValue)
    : Number(batch?.pendingCount || 0) > 0;
  const runFixedCommand = async (command) => { if (!fixedScanner) return; try { await issueLaundryFixedScannerCommand(fixedScanner.id, command); toast.success(`Fixed scanner ${command} command sent`); } catch (error) { toast.error(getLaundryBatchErrorMessage(error, "Unable to send scanner command")); } };
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
      item.statusValue === "sent",
  );
  const receivedItems = (batch?.items || []).filter((item) =>
    item.tagId && (receivedTagIdSet.has(item.tagId) || ["at_laundry", "washed", "sent_to_business", "returned"].includes(item.statusValue)),
  );
  const missingTagIds =
    remainingChoice === "missing"
      ? remainingItems.map((item) => item.tagId)
      : [];
  const counters = receipt || batch;
  const hasPendingItems = Number(counters?.pendingCount ?? batch?.pendingCount ?? 0) > 0;

  useEffect(() => {
    if (!batch?.apiId) return;
    let cancelled = false;
    getLaundryScannerSessionHistory(batch.apiId, { page: historyPage, limit: 10 })
      .then((response) => {
        if (!cancelled) setHistory(response?.data?.data ?? response?.data ?? { items: [], pagination: {} });
      })
      .catch(() => { if (!cancelled) setHistory({ items: [], pagination: {} }); });
    return () => { cancelled = true; };
  }, [batch?.apiId, historyPage]);

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

  const handleFinishSession = async () => {
    if (!liveScan?.sessionId || isFinishing || isClearing || isReceiving) return;
    setIsFinishing(true);
    try {
      await finishLaundryScannerSession(liveScan.sessionId);
      clearActiveLaundryScan();
      setIsConfirmingFinish(false);
      onReceived?.(batch);
      toast.success(checkoutMode ? "Checkout scan session finished." : "Receipt scan session finished.");
      onClose?.();
    } catch (finishError) {
      toast.error(
        getLaundryBatchErrorMessage(finishError, "Unable to finish scan session"),
      );
    } finally {
      setIsFinishing(false);
    }
  };

  const handleContinueScanning = async () => {
    if (!batch?.apiId || !scannerId || isContinuing || isReceiving || isClearing || isFinishing) return;
    setIsContinuing(true);
    try {
      const response = await startLaundryScannerSession(scannerId, batch.apiId, sessionPurpose);
      captureLaundryScanEvent(response);
      if (fixedScanner) await issueLaundryFixedScannerCommand(fixedScanner.id, "start");
      toast.success(checkoutMode ? "Checkout scan is ready. Scan every tag to send it to the Business." : "A new receipt scan session is ready for this batch.");
      onClose?.();
    } catch (continueError) {
      toast.error(getLaundryBatchErrorMessage(continueError, "Unable to continue scanning this batch"));
    } finally {
      setIsContinuing(false);
    }
  };

  return (
    <Modal
      description={`${batch?.business || ""} · ${batch?.location || ""}`}
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2.5">
          <Button disabled={isReceiving || isClearing || isFinishing} onClick={onClose} variant="secondary">Close</Button>
          {liveScanMatchesBatch && !isConfirmingFinish && !checkoutMode && (
            <Button
              disabled={isFinishing || (receivedTagIds.length === 0 && missingTagIds.length === 0)}
              leftIcon={<CheckCheck size={16} />}
              loading={isReceiving}
              onClick={handleReceive}
            >
              Confirm Receipt
            </Button>
          )}
        </div>
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

          {/* Operational Controls & Scanner Bar */}
          <div className="rounded-xl border border-(--theme-border) bg-(--theme-surface-hover) p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                {!liveScanMatchesBatch && canStartSession && (
                  <div className="w-64">
                    <Dropdown
                      label="Scanner for continuation"
                      onChange={setSelectedScannerId}
                      options={compatibleScanners.map((scanner) => ({
                        value: scanner.id,
                        label: scanner.name || scanner.scannerId,
                      }))}
                      value={scannerId}
                    />
                  </div>
                )}
                {liveScanMatchesBatch && (
                  <Badge dot size="md" variant="success">
                    Live Session Active
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {liveScanMatchesBatch && !isConfirmingFinish && (
                  <Button
                    disabled={isReceiving || isFinishing}
                    loading={isClearing}
                    onClick={handleClearScanData}
                    size="sm"
                    variant="secondary"
                  >
                    Clear Scan Data
                  </Button>
                )}
                {!liveScanMatchesBatch && canStartSession && !checkoutMode && (
                  <Button
                    disabled={!batch?.apiId || !scannerId}
                    loading={isContinuing}
                    onClick={handleContinueScanning}
                    size="sm"
                    variant="primary"
                  >
                    Continue Scanning
                  </Button>
                )}
                {!liveScanMatchesBatch && canStartSession && checkoutMode && !isConfirmingCheckout && (
                  <Button
                    disabled={!batch?.apiId || !scannerId}
                    onClick={() => setIsConfirmingCheckout(true)}
                    size="sm"
                    variant="primary"
                  >
                    Checkout Scan
                  </Button>
                )}
                {liveScanMatchesBatch && (
                  <Button
                    disabled={isReceiving || isClearing}
                    loading={isFinishing}
                    onClick={checkoutMode || !hasPendingItems ? handleFinishSession : () => setIsConfirmingFinish(true)}
                    size="sm"
                    variant="outline"
                  >
                    {checkoutMode ? "Finish Checkout" : "Finish Receipt"}
                  </Button>
                )}
              </div>
            </div>

            {scannerError && <p className="mt-2 text-xs text-(--color-overdue)" role="alert">{scannerError}</p>}

            {fixedScanner && liveScanMatchesBatch && (
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-(--theme-border-soft) pt-3">
                <span className="text-xs font-bold text-(--theme-text-secondary)">Fixed Scanner:</span>
                <Button onClick={() => runFixedCommand("start")} size="sm">Start Scan</Button>
                <Button onClick={() => runFixedCommand("stop")} size="sm" variant="danger">Stop Scan</Button>
                <Button onClick={() => runFixedCommand("rescan")} size="sm" variant="secondary">Scan Again</Button>
              </div>
            )}
          </div>

          {!liveScanMatchesBatch && checkoutMode && isConfirmingCheckout && (
            <Card bodyClassName="space-y-3">
              <p className="m-0 font-semibold">Confirm checkout</p>
              <p className="m-0 text-sm text-(--theme-text-muted)">
                Every tag must be scanned before it can be sent to the Business. Starting this session does not check out any items.
              </p>
              <div className="flex flex-wrap justify-end gap-2">
                <Button onClick={() => setIsConfirmingCheckout(false)} variant="secondary">Cancel</Button>
                <Button disabled={!batch?.apiId || !scannerId} loading={isContinuing} onClick={handleContinueScanning} variant="primary">Start and scan all tags</Button>
              </div>
            </Card>
          )}

          {isConfirmingFinish && (
            <Card bodyClassName="space-y-3">
              <p className="m-0 font-semibold">
                {counters?.receivedCount ?? batch.receivedCount ?? 0} of {counters?.totalCount ?? batch.total ?? 0} items are received. {counters?.pendingCount ?? batch.pendingCount ?? 0} items are still pending.
              </p>
              <div className="flex flex-wrap justify-end gap-2">
                <Button onClick={() => setIsConfirmingFinish(false)} variant="secondary">Continue scanning</Button>
                <Button loading={isFinishing} onClick={handleFinishSession} variant="primary">Finish and continue later</Button>
              </div>
            </Card>
          )}

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
          <div className="grid gap-5 lg:grid-cols-2">
            <Card bodyClassName="space-y-3">
              <h3 className="m-0 text-sm font-black">Remaining Expected Tags ({remainingItems.length})</h3>
              <Table columns={itemColumns.slice(0, 4)} compact data={remainingItems} emptyText="No remaining tags" rowKey="id" />
            </Card>
            <Card bodyClassName="space-y-3">
              <h3 className="m-0 text-sm font-black">Received Tags ({receivedItems.length})</h3>
              <Table columns={itemColumns.slice(0, 4)} compact data={receivedItems} emptyText="No received tags" rowKey="id" />
            </Card>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-black text-(--theme-text-primary)">Previous Sessions</h3>
            <Table compact data={history.items || []} emptyText="No previous sessions" rowKey="id" columns={[
              { key: "status", label: "Status", render: (value) => <Badge size="sm" variant={value === "finished" ? "success" : "neutral"}>{value}</Badge> },
              { key: "scannerName", label: "Scanner" },
              { key: "startedAt", label: "Started" },
              { key: "finishedAt", label: "Finished" },
              { key: "processedCount", label: "Tags" },
            ]} />
            <Pagination pageCount={history.pagination?.totalPages || 0} forcePage={historyPage - 1} totalItems={history.pagination?.totalItems || 0} itemsPerPage={history.pagination?.perPage || 10} onPageChange={({ selected }) => setHistoryPage(selected + 1)} />
          </div>
        </div>
      )}
    </Modal>
  );
};

export default BatchDetailsModal;

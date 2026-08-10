import { useEffect, useRef, useState } from "react";
import { Eraser, Radio } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import Card from "../../../Components/UI/Card";
import Dropdown from "../../../Components/UI/Dropdown";
import Modal from "../../../Components/UI/Modal";
import Table from "../../../Components/UI/Table";
import { clearLaundryScannerSession } from "../../../axios/scanners/laundryScanners";
import { scanIncomingBatchTags } from "../../../axios/batches/laundryBatches";
import { toast } from "../../../Utils/toast";
import { getLaundryBatchErrorMessage, normalizeScanResult } from "./data";

const normalizeEpc = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();
const normalizeMode = (scanner) =>
  String(scanner?.scannerMode || scanner?.mode || "")
    .trim()
    .toLowerCase();

const manualActionOptions = [
  { label: "Check In", value: "check_in" },
  { label: "Check Out", value: "check_out" },
];

const scanColumns = [
  {
    key: "epc",
    label: "EPC",
    render: (value) => <span className="font-mono font-bold">{value}</span>,
  },
  { key: "assetName", label: "Asset" },
  { key: "category", label: "Category" },
  { key: "scannedAt", label: "Scan Time" },
  {
    key: "action",
    label: "Action",
    render: (value) => (value ? String(value).replaceAll("_", " ") : "—"),
  },
  {
    key: "accepted",
    label: "Result",
    render: (value) => (
      <Badge size="sm" variant={value ? "success" : "danger"}>
        {value ? "Accepted" : "Rejected"}
      </Badge>
    ),
  },
  { key: "reason", label: "Message", render: (value) => value || "—" },
];

const ScannerReceiveModal = ({
  batch,
  canClear,
  onClose,
  onScanSuccess,
  open,
  scanner,
}) => {
  const [manualAction, setManualAction] = useState(null);
  const [scanSessionId, setScanSessionId] = useState(null);
  const [scanResults, setScanResults] = useState([]);
  const [serverCounts, setServerCounts] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const automaticScanKeyRef = useRef(null);

  const scannerMode = normalizeMode(scanner);
  const isManualMode = scannerMode === "manual";

  const resetSession = () => {
    setScanSessionId(null);
    setScanResults([]);
    setServerCounts(null);
    setManualAction(null);
  };

  useEffect(() => {
    if (!open || !batch?.apiId || !scanner?.apiId) return undefined;
    // A batch/scanner pair owns one isolated reusable session in this modal.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resetSession();
    return undefined;
  }, [batch?.apiId, open, scanner?.apiId]);

  const acceptedCount =
    serverCounts?.accepted ??
    scanResults.filter((item) => item.accepted).length;
  const rejectedCount =
    serverCounts?.rejected ??
    scanResults.filter((item) => !item.accepted).length;
  const remaining = Math.max((batch?.total || 0) - acceptedCount, 0);

  const mergeResults = (current, additions) => {
    const records = new Map(
      current.map((item) => [
        `${normalizeEpc(item.epc)}-${item.action || item.accepted}`,
        item,
      ]),
    );
    additions.forEach((item) =>
      records.set(
        `${normalizeEpc(item.epc)}-${item.action || item.accepted}`,
        item,
      ),
    );
    return [...records.values()];
  };

  const submitEpcs = async (
    epcs,
    { sessionId = scanSessionId, scanAction = manualAction } = {},
  ) => {
    const normalizedEpcs = [...new Set(epcs.map(normalizeEpc).filter(Boolean))];
    if (!normalizedEpcs.length || isScanning) return sessionId;
    if (isManualMode && !scanAction) {
      toast.warning("Select Check In or Check Out for this manual scanner.");
      return sessionId;
    }

    setIsScanning(true);
    try {
      const response = await scanIncomingBatchTags({
        scannerId: scanner.apiId,
        batchId: batch.apiId,
        sessionId: sessionId || undefined,
        epcs: normalizedEpcs,
        ...(isManualMode ? { scanAction } : {}),
      });
      const data = response?.data || {};
      const nextSessionId = data.session?.id;
      if (!nextSessionId)
        throw new Error(
          "Scan succeeded, but data.session.id was not returned.",
        );

      const rawResults = Array.isArray(data.results)
        ? data.results
        : [
            ...(data.processedItems || []).map((item) => ({
              ...item,
              accepted: true,
            })),
            ...(data.skippedItems || []).map((item) => ({
              ...item,
              accepted: false,
            })),
          ];
      const results = rawResults.map((item) =>
        normalizeScanResult({
          ...item,
          action: item.action || item.scanAction || data.action,
          reason: item.message || item.reason || response?.message,
        }),
      );

      setScanSessionId(nextSessionId);
      setScanResults((current) => mergeResults(current, results));
      setServerCounts({
        accepted: Number.isFinite(
          Number(data.acceptedCount ?? data.processedCount),
        )
          ? Number(data.acceptedCount ?? data.processedCount)
          : undefined,
        rejected: Number.isFinite(
          Number(data.rejectedCount ?? data.skippedCount),
        )
          ? Number(data.rejectedCount ?? data.skippedCount)
          : undefined,
      });
      const processedCount = Number(
        data.processedCount ??
          data.acceptedCount ??
          results.filter((item) => item.accepted).length,
      );
      const skippedCount = Number(
        data.skippedCount ??
          data.rejectedCount ??
          results.filter((item) => !item.accepted).length,
      );
      const message =
        response?.message || "Scanner action completed successfully";
      if (skippedCount > 0 && processedCount === 0) toast.warning(message);
      else if (processedCount > 0) toast.success(message);
      else toast.info(message);

      await onScanSuccess?.({ batchId: batch.apiId, response });
      return nextSessionId;
    } catch (error) {
      toast.error(
        getLaundryBatchErrorMessage(error, "Unable to scan these tags"),
      );
      return sessionId;
    } finally {
      setIsScanning(false);
    }
  };

  const getBatchEpcs = () =>
    (batch?.items || [])
      .map((item) => item.epc)
      .filter((value) => value && value !== "—");

  useEffect(() => {
    if (!open || isManualMode || !batch?.apiId || !scanner?.apiId) return;
    const scanKey = `${batch.apiId}:${scanner.apiId}`;
    if (automaticScanKeyRef.current === scanKey) return;
    automaticScanKeyRef.current = scanKey;

    const batchEpcs = getBatchEpcs();
    if (!batchEpcs.length) {
      toast.info("No EPCs were returned in this batch detail.");
      return;
    }
    // The request synchronizes the newly opened scanner with the backend session.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    submitEpcs(batchEpcs);
    // The selected batch/scanner pair is the trigger for one automatic bulk scan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batch?.apiId, isManualMode, open, scanner?.apiId]);

  const handleManualActionChange = (scanAction) => {
    setManualAction(scanAction);
    const batchEpcs = (batch?.items || [])
      .map((item) => item.epc)
      .filter((value) => value && value !== "—");
    if (!batchEpcs.length) {
      toast.info("No EPCs were returned in this batch detail.");
      return;
    }
    submitEpcs(batchEpcs, { scanAction });
  };

  const handleClear = async () => {
    if (!scanSessionId || isClearing) return;
    setIsClearing(true);
    try {
      const response = await clearLaundryScannerSession(scanSessionId);
      resetSession();
      setConfirmClearOpen(false);
      toast.success(response?.message || "Scan history cleared successfully");
    } catch (error) {
      toast.error(
        getLaundryBatchErrorMessage(error, "Unable to clear scan history"),
      );
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <Modal
        description={`${batch?.id || ""} · ${batch?.business || ""}`}
        footer={
          <>
            <Button onClick={onClose} variant="secondary">
              Close
            </Button>
            {scanSessionId && canClear && (
              <Button
                leftIcon={<Eraser size={15} />}
                onClick={() => setConfirmClearOpen(true)}
                variant="outline"
              >
                Clear Session
              </Button>
            )}
          </>
        }
        onClose={onClose}
        open={open}
        title="Scan Incoming Batch"
        width={1100}
      >
        <div className="space-y-5">
          <Alert variant="info">
            <span className="font-bold">{scanner?.name}</span> is in{" "}
            <span className="font-bold capitalize">{scannerMode}</span> mode.{" "}
            {isManualMode
              ? "Choose an action once; every batch EPC will then scan automatically."
              : "Every EPC in this batch is being scanned automatically."}
          </Alert>
          <div
            className={`grid gap-4 ${isManualMode ? "md:grid-cols-2" : "grid-cols-1"}`}
          >
            <Card bodyClassName="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="m-0 text-xs font-black uppercase tracking-wide text-(--theme-text-muted)">
                  Active Scanner
                </p>
                <p className="m-0 mt-1 font-bold text-(--theme-text-primary)">
                  {scanner?.name}
                </p>
                <p className="m-0 mt-1 font-mono text-xs text-(--theme-text-muted)">
                  {scanner?.id}
                </p>
              </div>
              <Badge dot variant="success">
                {scanner?.mode}
              </Badge>
            </Card>
            {isManualMode && (
              <Dropdown
                disabled={isScanning}
                label="Batch action"
                onChange={handleManualActionChange}
                options={manualActionOptions}
                placeholder="Select once to scan the full batch"
                value={manualAction}
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ["Expected", batch?.total || 0, "neutral"],
              ["Accepted", acceptedCount, "success"],
              ["Rejected", rejectedCount, "danger"],
              ["Remaining", remaining, "warning"],
            ].map(([label, value, variant]) => (
              <Card key={label} bodyClassName="flex items-center gap-3">
                <Radio size={18} />
                <div>
                  <p className="m-0 text-2xl font-black">{value}</p>
                  <p className="m-0 text-xs font-bold text-(--theme-text-muted)">
                    {label}
                  </p>
                </div>
                <Badge className="sr-only" variant={variant}>
                  {label}
                </Badge>
              </Card>
            ))}
          </div>
          <Table
            columns={scanColumns}
            compact
            data={scanResults}
            emptyText={
              isScanning
                ? "Scanning every batch tag..."
                : isManualMode
                  ? "Select the batch action to start automatic scanning"
                  : "Waiting for automatic scan results"
            }
            rowKey="id"
          />
        </div>
      </Modal>
      <Modal
        footer={
          <>
            <Button
              onClick={() => setConfirmClearOpen(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button loading={isClearing} onClick={handleClear} variant="danger">
              Clear Session
            </Button>
          </>
        }
        onClose={() => setConfirmClearOpen(false)}
        open={confirmClearOpen}
        title="Clear scan session?"
        width={500}
      >
        <p className="m-0 text-sm font-medium text-(--theme-text-secondary)">
          This clears scan history only. Completed Check In/Check Out actions
          will not be undone.
        </p>
      </Modal>
    </>
  );
};

export default ScannerReceiveModal;

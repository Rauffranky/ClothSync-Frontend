import { useMemo, useState } from "react";
import { ScanLine } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Dropdown from "../../../Components/UI/Dropdown";
import Modal from "../../../Components/UI/Modal";
import {
  getIncomingBatchDetails as fetchIncomingBatchDetails,
  getIncomingBatches,
} from "../../../axios/batches/laundryBatches";
import { getLaundryScanners } from "../../../axios/scanners/laundryScanners";
import { toast } from "../../../Utils/toast";
import { hasPermission } from "../../../Utils/permissions";
import { getScannerPaginatedCollection, normalizeScanner } from "../../Tenant/Scanner/data";
import ScannerReceiveModal from "../IncomingBatches/ScannerReceiveModal";
import {
  getIncomingBatchCollection,
  getIncomingBatchDetails,
  getLaundryBatchErrorMessage,
} from "../IncomingBatches/data";

const batchTypeOptions = [
  { label: "Incoming — Check In", value: "dispatched" },
  { label: "Received — Check Out", value: "received" },
];

const LaundryScannerTestControl = () => {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [batches, setBatches] = useState([]);
  const [scanners, setScanners] = useState([]);
  const [batchStatus, setBatchStatus] = useState("dispatched");
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [selectedScannerId, setSelectedScannerId] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedScanner, setSelectedScanner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [loadError, setLoadError] = useState("");

  const canViewBatches = hasPermission("incoming_batches", "view");
  const canViewScanners = hasPermission("scanners", "view");
  const canClear = hasPermission("scanners", "edit");

  const loadBatches = async (status) => {
    const response = await getIncomingBatches({ status, page: 1, limit: 100 });
    const collection = getIncomingBatchCollection(response, 100);
    setBatches(collection.rows);
  };

  const loadSelectionData = async () => {
    setSelectorOpen(true);
    setIsLoading(true);
    try {
      const [batchResponse, scannerResponse] = await Promise.all([
        getIncomingBatches({ status: batchStatus, page: 1, limit: 100 }),
        getLaundryScanners({ status: "active", page: 1, limit: 100 }),
      ]);
      const batchCollection = getIncomingBatchCollection(batchResponse, 100);
      const scannerCollection = getScannerPaginatedCollection(scannerResponse, 100);
      const activeScanners = scannerCollection.rows
        .map(normalizeScanner)
        .filter((scanner) => String(scanner.status).toLowerCase() === "active");
      setBatches(batchCollection.rows);
      setScanners(activeScanners);
      setLoadError("");
    } catch (error) {
      setBatches([]);
      setScanners([]);
      setLoadError(getLaundryBatchErrorMessage(error, "Unable to load batches and scanners"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchStatusChange = async (status) => {
    setBatchStatus(status);
    setSelectedBatchId(null);
    setIsLoading(true);
    try {
      await loadBatches(status);
      setLoadError("");
    } catch (error) {
      setBatches([]);
      setLoadError(getLaundryBatchErrorMessage(error, "Unable to load batches"));
    } finally {
      setIsLoading(false);
    }
  };

  const batchOptions = useMemo(
    () => batches.map((batch) => ({
      label: `${batch.id} · ${batch.business} · ${batch.total} item(s)`,
      searchLabel: `${batch.id} ${batch.business}`,
      value: batch.apiId,
    })),
    [batches],
  );

  const scannerOptions = useMemo(
    () => scanners.map((scanner) => ({
      label: `${scanner.name} · ${scanner.mode}`,
      searchLabel: `${scanner.name} ${scanner.id} ${scanner.mode}`,
      value: scanner.apiId,
    })),
    [scanners],
  );

  const handleStart = async () => {
    if (!selectedBatchId || !selectedScannerId || isStarting) return;
    setIsStarting(true);
    try {
      const response = await fetchIncomingBatchDetails(selectedBatchId);
      setSelectedBatch(getIncomingBatchDetails(response));
      setSelectedScanner(scanners.find((scanner) => scanner.apiId === selectedScannerId));
      setSelectorOpen(false);
      setScannerOpen(true);
    } catch (error) {
      toast.error(getLaundryBatchErrorMessage(error, "Unable to load batch details"));
    } finally {
      setIsStarting(false);
    }
  };

  const handleScanSuccess = async ({ batchId }) => {
    const [batchListResult, batchDetailsResult] = await Promise.allSettled([
      getIncomingBatches({ status: batchStatus, page: 1, limit: 100 }),
      fetchIncomingBatchDetails(batchId),
    ]);

    if (batchListResult.status === "fulfilled") {
      setBatches(getIncomingBatchCollection(batchListResult.value, 100).rows);
    }
    if (batchDetailsResult.status === "fulfilled") {
      setSelectedBatch(getIncomingBatchDetails(batchDetailsResult.value));
    }
    if (batchListResult.status === "rejected" || batchDetailsResult.status === "rejected") {
      toast.warning("Scan completed, but refreshed batch data could not be loaded.");
    }
  };

  const closeSelector = () => {
    setSelectorOpen(false);
    setSelectedBatchId(null);
    setSelectedScannerId(null);
    setLoadError("");
  };

  const closeScanner = () => {
    setScannerOpen(false);
    setSelectedBatch(null);
    setSelectedScanner(null);
    setSelectedBatchId(null);
    setSelectedScannerId(null);
  };

  if (!canViewBatches || !canViewScanners) return null;

  return (
    <>
      <Button leftIcon={<ScanLine size={17} />} onClick={loadSelectionData} variant="warning">
        Scan Batch
      </Button>

      <Modal
        description="Choose an incoming or received batch and an active scanner assigned to your Laundry account."
        footer={<><Button onClick={closeSelector} variant="secondary">Cancel</Button><Button disabled={!selectedBatchId || !selectedScannerId || isLoading} loading={isStarting} onClick={handleStart} variant="warning">Open Scanner</Button></>}
        onClose={closeSelector}
        open={selectorOpen}
        title="Select Batch and Scanner"
        width={650}
      >
        <div className="space-y-4">
          <Alert variant="info">Entry checks tags in, Exit checks tags out, Auto chooses from current status, and Manual requires an action.</Alert>
          {loadError && <Alert variant="danger">{loadError}</Alert>}
          <Dropdown disabled={isLoading} label="Batch flow" onChange={handleBatchStatusChange} options={batchTypeOptions} value={batchStatus} />
          <Dropdown disabled={isLoading} label={batchStatus === "received" ? "Received batch" : "Incoming batch"} onChange={setSelectedBatchId} options={batchOptions} placeholder={isLoading ? "Loading batches..." : `Select a ${batchStatus === "received" ? "received" : "dispatched"} batch`} search value={selectedBatchId} />
          <Dropdown disabled={isLoading} label="Active laundry scanner" onChange={setSelectedScannerId} options={scannerOptions} placeholder={isLoading ? "Loading scanners..." : "Select an active scanner"} search value={selectedScannerId} />
          {!isLoading && !loadError && batches.length === 0 && <p className="m-0 text-sm font-semibold text-(--theme-text-muted)">No {batchStatus === "received" ? "received" : "dispatched incoming"} batches are available.</p>}
          {!isLoading && !loadError && scanners.length === 0 && <p className="m-0 text-sm font-semibold text-(--theme-text-muted)">No active assigned scanners are available.</p>}
        </div>
      </Modal>

      {selectedBatch && selectedScanner && (
        <ScannerReceiveModal batch={selectedBatch} canClear={canClear} onClose={closeScanner} onScanSuccess={handleScanSuccess} open={scannerOpen} scanner={selectedScanner} />
      )}
    </>
  );
};

export default LaundryScannerTestControl;

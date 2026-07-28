import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BatteryWarning,
  RefreshCw,
  ShieldAlert,
  WifiOff,
} from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import Card from "../../../Components/UI/Card";
import Pagination from "../../../Components/UI/Pagination";
import ProgressBar from "../../../Components/UI/ProgressBar";
import Table from "../../../Components/UI/Table";
import { getApiErrorMessage } from "../../../axios/api";
import { getTenantScannerWarnings } from "../../../axios/scanners/tenantScanners";
import { getScannerPaginatedCollection, normalizeScanner } from "./data";

const ITEMS_PER_PAGE = 5;

const signalLabels = {
  low_signal: "Low Signal",
  offline: "Offline",
  online: "Online",
  warning: "Warning",
};

const getWarningReason = (scanner) => {
  if (scanner.warningReason) return scanner.warningReason;
  if (scanner.warningMessage) return scanner.warningMessage;
  if (scanner.signalStatus === "offline") return "Scanner is offline";
  if (scanner.signalStatus === "low_signal") return "Signal strength is low";
  if (scanner.signalStatus === "warning") return "Signal requires attention";
  if (Number(scanner.batteryLevel) <= 20) return "Battery level is low";
  return "Scanner requires attention";
};

const ScannerWarnings = ({ 
  refreshKey = 0,
  getScannerWarnings = getTenantScannerWarnings,
}) => {
  const [warnings, setWarnings] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    getScannerWarnings({
      page: currentPage + 1,
      limit: ITEMS_PER_PAGE,
    })
      .then((response) => {
        if (!isActive) return;
        const collection = getScannerPaginatedCollection(
          response,
          ITEMS_PER_PAGE,
        );
        setWarnings(collection.rows.map(normalizeScanner));
        setTotalItems(collection.totalItems);
        setTotalPages(collection.totalPages);
        setLoadError("");
      })
      .catch((error) => {
        if (!isActive) return;
        setWarnings([]);
        setTotalItems(0);
        setTotalPages(0);
        setLoadError(
          getApiErrorMessage(error, "Unable to load scanner warnings"),
        );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [currentPage, refreshKey, retryKey, getScannerWarnings]);

  const retryLoad = () => {
    setIsLoading(true);
    setLoadError("");
    setRetryKey((current) => current + 1);
  };

  const columns = [
    {
      key: "name",
      label: "Scanner",
      render: (_, scanner) => (
        <div className="min-w-44">
          <p className="m-0 font-black text-(--theme-text-primary)">
            {scanner.name}
          </p>
          <p className="m-0 mt-1 font-mono text-xs font-semibold text-(--theme-text-muted)">
            {scanner.id}
          </p>
        </div>
      ),
    },
    {
      key: "warningReason",
      label: "Attention Required",
      sortable: false,
      render: (_, scanner) => (
        <div className="flex min-w-52 items-center gap-2 font-semibold text-(--color-overdue)">
          <AlertTriangle className="shrink-0" size={16} />
          <span>{getWarningReason(scanner)}</span>
        </div>
      ),
    },
    {
      key: "signalStatus",
      label: "Signal",
      render: (value) => (
        <Badge
          leftIcon={value === "offline" ? <WifiOff size={12} /> : undefined}
          size="sm"
          variant={
            value === "online"
              ? "success"
              : value === "offline"
                ? "danger"
                : "warning"
          }
        >
          {signalLabels[value] || value || "Unknown"}
        </Badge>
      ),
    },
    {
      key: "batteryLevel",
      label: "Battery",
      render: (value) => {
        const batteryLevel = Number(value) || 0;
        return (
          <div className="min-w-28 space-y-2">
            <div className="flex items-center justify-between gap-3 text-xs font-bold text-(--theme-text-secondary)">
              <BatteryWarning size={14} />
              <span>{batteryLevel}%</span>
            </div>
            <ProgressBar
              heightClass="h-1.5"
              value={batteryLevel}
              variant={batteryLevel <= 20 ? "danger" : "warning"}
            />
          </div>
        );
      },
    },
    {
      key: "operator",
      label: "Operator",
      render: (value) => value || "Unassigned",
    },
    {
      key: "lastActivity",
      label: "Last Activity",
      render: (value) => (
        <span className="whitespace-nowrap font-mono text-xs font-semibold text-(--theme-text-muted)">
          {value}
        </span>
      ),
    },
  ];

  return (
    <Card padding="0" rounded="18px">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-(--theme-border-soft) px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--color-overdue)_12%,var(--theme-surface))] text-(--color-overdue)">
            <ShieldAlert size={21} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="m-0 text-lg font-black text-(--theme-text-primary)">
                Scanners Requiring Attention
              </h2>
              {!isLoading && !loadError && (
                <Badge size="sm" variant={totalItems ? "danger" : "success"}>
                  {totalItems}
                </Badge>
              )}
            </div>
            <p className="m-0 mt-1 text-sm font-medium text-(--theme-text-muted)">
              Devices with signal, battery, or operational warnings.
            </p>
          </div>
        </div>
        <Button
          aria-label="Refresh scanner warnings"
          disabled={isLoading}
          leftIcon={<RefreshCw size={15} />}
          onClick={retryLoad}
          size="sm"
          variant="secondary"
        >
          Refresh
        </Button>
      </div>

      <div className="p-4">
        {loadError && (
          <Alert
            className="mb-4"
            leftIcon={<AlertTriangle size={18} />}
            variant="danger"
          >
            {loadError}
          </Alert>
        )}
        <Table
          columns={columns}
          data={warnings}
          emptyText="All clear — no scanners currently require attention"
          loading={isLoading}
          rowKey={(scanner) => scanner.apiId || scanner.id}
          skeletonRows={ITEMS_PER_PAGE}
        />
        <Pagination
          forcePage={currentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={({ selected }) => {
            setIsLoading(true);
            setCurrentPage(selected);
          }}
          pageCount={totalPages}
          totalItems={totalItems}
        />
      </div>
    </Card>
  );
};

export default ScannerWarnings;

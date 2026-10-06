import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Cpu,
  Eye,
  FileText,
  Gauge,
  History,
  Logs,
  MapPin,
  RefreshCw,
  UserRound,
} from "lucide-react";
import ScannerLogDetailModal from "./ScannerLogDetailModal";
import Alert from "../../../../Components/UI/Alert";
import Button from "../../../../Components/UI/Button";
import Card from "../../../../Components/UI/Card";
import Table from "../../../../Components/UI/Table";
import Badge from "../../../../Components/UI/Badge";
import Pagination from "../../../../Components/UI/Pagination";
import ProgressBar from "../../../../Components/UI/ProgressBar";
import ToggleSwitch from "../../../../Components/UI/ToggleSwitch";

const WashCountCell = ({ count, limit }) => {
  if (count === null || count === undefined) {
    return <span className="text-(--theme-text-muted)">—</span>;
  }
  const isCritical = limit ? count >= limit * 0.9 : false;
  return (
    <div className="min-w-16 max-w-20">
      <div className="mb-1 flex items-end gap-1">
        <span
          className={`text-xs font-black ${isCritical ? "text-(--color-overdue)" : "text-(--theme-text-primary)"}`}
        >
          {count}
        </span>
        {limit != null && (
          <span className="text-[11px] font-semibold text-(--theme-text-muted)">
            / {limit}
          </span>
        )}
      </div>
      {limit != null && limit > 0 && (
        <ProgressBar
          heightClass="h-1.5"
          max={limit}
          value={count}
          variant={isCritical ? "danger" : "teal"}
        />
      )}
    </div>
  );
};
import { getApiErrorMessage } from "../../../../axios/api";
import { getTenantScannerDetails, getTenantScannerLogs, issueTenantFixedScannerCommand } from "../../../../axios/scanners/tenantScanners";
import { formatDateTime, formatTimeWithUserPreferences } from "../../../../Utils/date";
import { normalizeScanner } from "../data";
import HeaderCard from "./HeaderCard";
import AddScannerModal from "../AddScannerModal";
import { configureTenantScanner } from "../../../../axios/scanners/tenantScanners";
import {
  reconnectTenantScannerDevice,
  replaceTenantScannerDevice,
  updateTenantScannerAccess,
  rotateTenantScannerKey,
  revokeTenantScannerKey,
} from "../../../../axios/scanners/tenantScanners";
import { getTenantStaffOptions } from "../../../../axios/staff/tenantStaff";
import { getTenantStaffRoles } from "../../../../axios/staffRoles/tenantStaffRoles";
import ScannerHardwareRecoveryModal from "./ScannerHardwareRecoveryModal";
import ScannerAccessModal from "./ScannerAccessModal";
import GlobalTooltip from "../../../../Components/UI/Tooltip";
import { toast } from "../../../../Utils/toast";

const summaryItems = [
  { key: "lastActivity", label: "Last Activity", icon: Logs },
  { key: "reads", label: "Total Reads", icon: Gauge },
  { key: "location", label: "Zone", icon: MapPin },
  { key: "operator", label: "Operator", icon: UserRound },
];

const DetailField = ({ label, value, mono = false }) => (
  <div>
    <dt className="text-xs font-bold uppercase tracking-wide text-(--theme-text-muted)">
      {label}
    </dt>
    <dd
      className={`m-0 mt-1 wrap-break-word font-bold text-(--theme-text-primary) ${mono ? "font-mono text-xs" : "text-sm"}`}
    >
      {value === null || value === undefined || value === ""
        ? "Not assigned"
        : value}
    </dd>
  </div>
);

const ScannerDetailsIndex = ({
  getScannerDetails = getTenantScannerDetails,
  getScannerLogs = getTenantScannerLogs,
  configureScanner = configureTenantScanner,
  getStaffOptions = getTenantStaffOptions,
  getRoleOptions = getTenantStaffRoles,
  reconnectScanner = reconnectTenantScannerDevice,
  replaceScanner = replaceTenantScannerDevice,
  updateAccess = updateTenantScannerAccess,
  rotateKey = rotateTenantScannerKey,
  revokeKey = revokeTenantScannerKey,
  policyOwnerType = "tenant",
  issueFixedCommand = issueTenantFixedScannerCommand,
}) => {
  const { id } = useParams();
  const [scanner, setScanner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(null);
  const [isRecoverySubmitting, setIsRecoverySubmitting] = useState(false);
  const [isAccessOpen, setIsAccessOpen] = useState(false);
  const [staffOptions, setStaffOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsPagination, setLogsPagination] = useState({});
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState("");
  const [logsRefreshKey, setLogsRefreshKey] = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    if (!scanner?.apiId) return undefined;
    let isActive = true;
    getScannerLogs(scanner.apiId, { page: logsPage, limit: 50 })
      .then((response) => {
        if (!isActive) return;
        const payload = response?.data?.data ?? response?.data ?? response ?? {};
        const items = payload?.items || payload?.logs || payload?.docs || [];
        setLogs(Array.isArray(items) ? items : []);
        setLogsPagination(payload?.pagination || {});
        setLogsError("");
      })
      .catch((error) => {
        if (isActive) setLogsError(getApiErrorMessage(error, "Unable to load scanner logs"));
      })
      .finally(() => { if (isActive) setLogsLoading(false); });
    return () => { isActive = false; };
  }, [getScannerLogs, logsPage, logsRefreshKey, scanner?.apiId]);

  useEffect(() => {
    let isActive = true;

    getScannerDetails(id)
      .then((response) => {
        if (!isActive) return;
        const payload = response?.data ?? response ?? {};
        const details = payload?.item || payload?.scanner || payload;
        setScanner(normalizeScanner(details));
        setLoadError("");
      })
      .catch((error) => {
        if (!isActive) return;
        setScanner(null);
        setLoadError(
          getApiErrorMessage(error, "Unable to load scanner details"),
        );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [id, retryKey, getScannerDetails]);

  const [isScanning, setIsScanning] = useState(false);
  const [scanStartTime, setScanStartTime] = useState(null);
  const [isCommandRunning, setIsCommandRunning] = useState(false);

  const retryLoad = () => {
    setIsLoading(true);
    setLoadError("");
    setRetryKey((current) => current + 1);
  };
  const runFixedCommand = async (command) => {
    setIsCommandRunning(true);
    try {
      await issueFixedCommand(scanner.apiId, command);
      const scannerName = scanner?.scannerName || scanner?.name || "Fixed Scanner";
      if (command === "start") {
        const now = new Date();
        setScanStartTime(now);
        setIsScanning(true);
        toast.scannerStart({
          startTime: now,
          formattedTime: formatTimeWithUserPreferences(now, true),
          scannerName,
        });
      } else if (command === "stop") {
        const stopTime = new Date();
        let totalDuration = "";
        if (scanStartTime) {
          const diffSec = Math.max(0, Math.floor((stopTime.getTime() - scanStartTime.getTime()) / 1000));
          const mins = Math.floor(diffSec / 60);
          const secs = diffSec % 60;
          totalDuration = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
        }
        setIsScanning(false);
        setScanStartTime(null);
        toast.scannerStop({
          stopTime,
          formattedTime: formatTimeWithUserPreferences(stopTime, true),
          totalDuration,
          scannerName,
        });
      } else {
        toast.success(`Fixed scanner ${command} command sent`);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to send fixed scanner command"));
    } finally {
      setIsCommandRunning(false);
    }
  };

  const handleConfigure = async (values) => {
    const operatorIds = Array.isArray(values.assignedOperatorIds)
      ? values.assignedOperatorIds.filter(Boolean)
      : values.assignedOperatorId
      ? [values.assignedOperatorId]
      : [];

    const response = await configureScanner(scanner.apiId, {
      scannerType: values.scannerType.toLowerCase(),
      scannerMode: values.scannerMode.toLowerCase(),
      location: values.location.trim(),
      zoneName: values.zoneName.trim(),
      status: (values.status || "Active").toLowerCase(),
      assignedOperatorId: operatorIds[0] || null,
      assignedOperatorIds: operatorIds,
      translations: {
        en: {
          name: values.scannerName.trim(),
          zoneName: values.zoneName.trim(),
          location: values.location.trim(),
          notes: values.customNotes.trim(),
        },
      },
    });
    const payload = response?.data ?? response ?? {};
    const updated = payload?.item || payload?.scanner || payload;
    setScanner(normalizeScanner(updated));
    setIsConfigureOpen(false);
  };

  const handleRecovery = async (values) => {
    if (!scanner?.apiId) throw new Error("Scanner backend ID is missing");
    setIsRecoverySubmitting(true);
    try {
      const recover = recoveryMode === "replace"
        ? replaceScanner
        : reconnectScanner;
      const response = await recover(scanner.apiId, values);
      toast.success(response?.message || "Scanner hardware updated successfully");
      setRecoveryMode(null);
      setIsLoading(true);
      setRetryKey((current) => current + 1);
    } finally {
      setIsRecoverySubmitting(false);
    }
  };

  useEffect(() => {
    if (!isAccessOpen) return;
    Promise.all([
      getStaffOptions({ status: "active", limit: 100 }),
      getRoleOptions({ status: "active", limit: 100 }),
    ]).then(([staffResponse, roleResponse]) => {
      setStaffOptions((staffResponse?.data?.items || []).filter((item) => item?.id).map((item) => ({ value: item.id, label: item.fullName || item.name || item.email })));
      setRoleOptions((roleResponse?.data?.items || []).filter((item) => item?.id).map((item) => ({ value: item.id, label: item.name || item.title })));
    }).catch(() => { setStaffOptions([]); setRoleOptions([]); });
  }, [getRoleOptions, getStaffOptions, isAccessOpen]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4" aria-label="Loading scanner details">
        <div className="h-28 rounded-2xl bg-(--button-ghost-bg)" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              className="h-24 rounded-2xl bg-(--button-ghost-bg)"
              key={index}
            />
          ))}
        </div>
        <div className="h-48 rounded-2xl bg-(--button-ghost-bg)" />
      </div>
    );
  }

  if (!scanner) {
    return (
      <Alert leftIcon={<AlertTriangle size={18} />} variant="danger">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>{loadError || "Scanner details not found"}</span>
          <Button
            leftIcon={<RefreshCw size={14} />}
            onClick={retryLoad}
            size="sm"
            variant="secondary"
          >
            Try Again
          </Button>
        </div>
      </Alert>
    );
  }

  const assignedOperator = scanner.assignedOperator || {};
  const assignedOperatorUser = assignedOperator.user || {};
  const assignedOperators =
    Array.isArray(scanner.assignedOperators) && scanner.assignedOperators.length > 0
      ? scanner.assignedOperators
      : assignedOperator.id ||
        assignedOperatorUser.name ||
        assignedOperatorUser.fullName
      ? [
          {
            id: assignedOperator.id,
            name:
              assignedOperatorUser.name ||
              assignedOperatorUser.fullName ||
              assignedOperator.name,
            email: assignedOperatorUser.email || assignedOperator.email,
          },
        ]
      : [];
  const createdByUser = scanner.createdByUser || {};
  const creatorRole = createdByUser.role
    ? String(createdByUser.role)
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase())
    : null;

  const logColumns = [
    {
      key: "tag",
      label: "Tag",
      accessor: (log) => log.tag?.tagCode || log.tagCode || log.tag?.epc || log.epc || "-",
      render: (_, log) => {
        const tagCode = log.tag?.tagCode || log.tagCode;
        const epc = log.tag?.epc || log.epc;
        const tagId = log.tag?.id || log.tagId;
        return (
          <div className="flex flex-col">
            {tagCode ? (
              <span className="font-bold text-(--color-sky-blue)">
                {tagId ? (
                  <Link
                    to={`/business/tags/${tagId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="hover:underline"
                  >
                    {tagCode}
                  </Link>
                ) : (
                  tagCode
                )}
              </span>
            ) : null}
            <span className={`font-mono text-xs ${tagCode ? "text-(--theme-text-muted)" : "text-(--theme-text-primary)"}`}>
              {epc || "-"}
            </span>
          </div>
        );
      },
      sortable: false,
    },
    {
      key: "asset",
      label: "Asset",
      accessor: (log) => log.asset?.name || log.assetName || "-",
      render: (_, log) => {
        const assetName = log.asset?.name || log.assetName;
        const assetCode = log.asset?.assetCode || log.assetCode;
        const assetId = log.asset?.id || log.assetId;
        if (!assetName && !assetCode) return <span className="text-(--theme-text-muted)">—</span>;
        return (
          <div className="flex flex-col">
            {assetName ? (
              <span className="font-semibold text-(--theme-text-primary)">
                {assetId ? (
                  <Link
                    to={`/business/assets/${assetId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="hover:underline"
                  >
                    {assetName}
                  </Link>
                ) : (
                  assetName
                )}
              </span>
            ) : null}
            {assetCode ? (
              <span className="font-mono text-xs text-(--theme-text-muted)">
                {assetCode}
              </span>
            ) : null}
          </div>
        );
      },
      sortable: false,
    },
    {
      key: "zone",
      label: "Zone",
      accessor: (log) => log.zone || "Office Scanner",
      render: (_, log) => (
        <div className="flex items-center gap-1.5">
          <MapPin size={13} className="shrink-0 text-(--color-aurora-teal)" />
          <span className="text-xs font-semibold text-(--theme-text-primary)">
            {log.zone || "Office Scanner"}
          </span>
        </div>
      ),
      sortable: false,
    },
    {
      key: "action",
      label: "Action / Mode",
      accessor: (log) => log.scanAction || log.mode || "-",
      render: (_, log) => {
        const action = log.scanAction || log.metadata?.scanAction || (log.mode === "entry" ? "check_in" : log.mode === "exit" ? "check_out" : null);
        const isCheckIn = action === "check_in";
        const isCheckOut = action === "check_out";
        const scannerConfigMode = log.mode || "entry";
        const isManualOverride = Boolean(
          log.isManualAction ||
          log.actionSource === "manual" ||
          log.metadata?.isManual ||
          (scannerConfigMode === "entry" && isCheckOut) ||
          (scannerConfigMode === "exit" && isCheckIn)
        );

        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {action ? (
                <span
                  className={`inline-flex w-fit items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold border ${
                    isCheckIn
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : isCheckOut
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                      : "border-(--theme-border-soft) bg-(--theme-surface-strong) text-(--theme-text-primary)"
                  }`}
                >
                  {isCheckIn ? <ArrowDownLeft size={12} /> : isCheckOut ? <ArrowUpRight size={12} /> : null}
                  {isCheckIn ? "Check In" : isCheckOut ? (isManualOverride ? "Manual Check Out" : "Check Out") : action}
                </span>
              ) : null}
            </div>
            <span className="font-mono text-[11px] text-(--theme-text-muted)">
              Mode: <strong className="uppercase text-(--theme-text-primary)">{scannerConfigMode}</strong>
            </span>
          </div>
        );
      },
      sortable: false,
    },
    {
      key: "direction",
      label: "Direction",
      accessor: (log) => log.scanDirection || "-",
      render: (_, log) => {
        const dir = log.scanDirection;
        if (!dir) return <span className="text-(--theme-text-muted)">—</span>;
        const isReturning = String(dir).includes("returning");
        const isGoing = String(dir).includes("going");
        return (
          <span
            className={`inline-flex w-fit items-center rounded-lg border px-2 py-0.5 text-xs font-semibold ${
              isReturning
                ? "border-sky-500/30 bg-sky-500/10 text-sky-400"
                : isGoing
                ? "border-purple-500/30 bg-purple-500/10 text-purple-400"
                : "border-(--theme-border-soft) bg-(--theme-surface-strong) text-(--theme-text-secondary)"
            }`}
          >
            {String(dir).replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
        );
      },
      sortable: false,
    },
    {
      key: "status",
      label: "Status",
      accessor: (log) => log.status || log.scanStatus || "-",
      sortable: false,
      render: (_, log) => {
        const valStr = String(log.status || "").toLowerCase();
        const variant =
          valStr.includes("failed") || valStr.includes("exception")
            ? "danger"
            : valStr.includes("unlinked")
            ? "warning"
            : valStr.includes("business") || valStr.includes("active")
            ? "success"
            : "info";
        return (
          <Badge size="sm" variant={variant}>
            {log.statusLabel || String(log.status || "").replace(/[_-]+/g, " ")}
          </Badge>
        );
      },
    },
    {
      key: "batch",
      label: "Batch",
      accessor: (log) => log.batch?.batchCode || log.batchCode || log.batchId || "-",
      render: (_, log) => {
        const batchCode = log.batch?.batchCode || log.batchCode;
        const batchId = log.batch?.id || log.laundryBatchId || log.batchId;
        const itemsCount = log.items;
        if (!batchCode && !batchId) return <span className="text-(--theme-text-muted)">—</span>;
        return (
          <div className="flex flex-col">
            {batchId ? (
              <Link
                to={`/business/dispatch-batches/${batchId}`}
                onClick={(e) => e.stopPropagation()}
                className="font-bold text-(--color-sky-blue) hover:underline"
              >
                {batchCode || batchId}
              </Link>
            ) : (
              <span className="font-semibold text-(--theme-text-primary)">
                {batchCode || "—"}
              </span>
            )}
            {itemsCount ? (
              <span className="text-[11px] font-medium text-(--theme-text-muted)">
                {itemsCount} items
              </span>
            ) : null}
          </div>
        );
      },
      sortable: false,
    },
    {
      key: "assetWashCount",
      label: "Asset Washes",
      accessor: (log) =>
        log.assetWashCount ??
        log.asset?.washCount ??
        log.metadata?.assetWashCount ??
        (log.asset ? (log.metadata?.washCount ?? 0) : "-"),
      render: (_, log) => {
        const count =
          log.assetWashCount ??
          log.asset?.washCount ??
          log.metadata?.assetWashCount ??
          (log.asset ? (log.metadata?.washCount ?? 0) : null);
        const limit =
          log.assetWashLimit ??
          log.asset?.washLimit ??
          log.metadata?.assetWashLimit ??
          (log.asset ? (log.metadata?.washLimit ?? 100) : null);
        return <WashCountCell count={count} limit={limit} />;
      },
      sortable: false,
    },
    {
      key: "tagWashCount",
      label: "Tag Washes",
      accessor: (log) =>
        log.tagWashCount ??
        log.tag?.washCount ??
        log.tag?.totalLaundryCycles ??
        log.metadata?.tagWashCount ??
        (log.tagCode || log.epc ? (log.metadata?.washCount ?? 0) : "-"),
      render: (_, log) => {
        const count =
          log.tagWashCount ??
          log.tag?.washCount ??
          log.tag?.totalLaundryCycles ??
          log.metadata?.tagWashCount ??
          (log.tagCode || log.epc ? (log.metadata?.washCount ?? 0) : null);
        const limit =
          log.tagWashLimit ??
          log.tag?.washLimit ??
          log.metadata?.tagWashLimit ??
          (log.tagCode || log.epc ? (log.metadata?.washLimit ?? 100) : null);
        return <WashCountCell count={count} limit={limit} />;
      },
      sortable: false,
    },
    {
      key: "operator",
      label: "Operator",
      accessor: (log) => log.operator?.name || log.operatorName || "-",
      render: (_, log) => {
        const operator = log.operator;
        if (!operator || !operator.name) {
          return <span className="text-(--theme-text-muted)">—</span>;
        }
        const roleLabel = operator.role
          ? String(operator.role)
              .replace(/[_-]+/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())
          : "";
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-(--theme-text-primary)">
              {operator.name}
            </span>
            {roleLabel ? (
              <span className="text-[11px] font-medium text-(--theme-text-muted)">
                {roleLabel}
              </span>
            ) : null}
          </div>
        );
      },
      sortable: false,
    },
    {
      key: "activity",
      label: "Activity",
      accessor: (log) => formatDateTime(log.scannedAt || log.createdAt || log.lastActivity, true) || "-",
      sortable: false,
    },
    {
      key: "actions",
      label: "Details",
      render: (_, log) => (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLog(log);
          }}
          size="xs"
          variant="secondary"
          leftIcon={<Eye size={13} className="text-(--color-sky-blue)" />}
        >
          View
        </Button>
      ),
      sortable: false,
    },
  ];

  return (
    <div className="space-y-6">
      <HeaderCard
        data={scanner}
        onConfigure={() => setIsConfigureOpen(true)}
        onReconnect={() => setRecoveryMode("reconnect")}
        onReplace={() => setRecoveryMode("replace")}
        onAccess={() => setIsAccessOpen(true)}
      />
      {String(scanner.type || scanner.scannerType).toLowerCase() === "fixed" ? (
        <Card padding="16px" rounded="16px">
          <div className="flex flex-wrap items-center gap-3">
            <ToggleSwitch
              checked={isScanning}
              checkedLabel="Stop Scan"
              checkedVariant="danger"
              disabled={isCommandRunning}
              loading={isCommandRunning}
              onChange={(shouldStart) => runFixedCommand(shouldStart ? "start" : "stop")}
              size="md"
              uncheckedLabel="Start Scan"
              uncheckedVariant="primary"
            />
            <Button
              disabled={isCommandRunning}
              onClick={() => runFixedCommand("rescan")}
              size="sm"
              variant="secondary"
            >
              Scan Again
            </Button>
          </div>
        </Card>
      ) : null}

      {!String(scanner.status).toLowerCase().includes("active") ? (
        <Alert leftIcon={<AlertTriangle size={18} />} variant="warning">
          This scanner is not active. Scanning remains disabled until hardware
          recovery, configuration, and backend activation are complete.
        </Alert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => {
          const Icon = item.icon;
          const isOperatorCard = item.key === "operator";
          const operatorCount = assignedOperators.length;
          const label =
            isOperatorCard && operatorCount > 1
              ? `Operators (${operatorCount})`
              : item.label;

          return (
            <Card key={item.key} padding="16px 18px" rounded="16px">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-(--theme-border-soft) bg-(--button-ghost-bg)">
                  <Icon size={16} className="text-(--color-aurora-teal)" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-[11px] font-black uppercase tracking-[0.12em] text-(--theme-text-muted)">
                    {label}
                  </p>
                  {isOperatorCard ? (
                    operatorCount === 0 ? (
                      <p className="m-0 mt-1 text-sm font-bold text-(--color-overdue)">
                        Unassigned
                      </p>
                    ) : operatorCount === 1 ? (
                      <p className="m-0 mt-1 truncate text-sm font-bold text-(--theme-text-primary)">
                        {assignedOperators[0]?.name || "-"}
                      </p>
                    ) : (
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {assignedOperators.slice(0, 3).map((op, idx) => (
                          <span
                            key={op.id || idx}
                            className="inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-bold"
                            style={{
                              color: "var(--color-aurora-teal)",
                              background: "rgba(20, 184, 166, 0.12)",
                              border: "1px solid rgba(20, 184, 166, 0.24)",
                            }}
                          >
                            {op.name}
                          </span>
                        ))}
                        {operatorCount > 3 && (
                          <GlobalTooltip
                            position="top"
                            text={assignedOperators
                              .slice(3)
                              .map((o) => o.name)
                              .filter(Boolean)
                              .join(", ")}
                          >
                            <span
                              className="inline-flex cursor-pointer items-center rounded-lg px-2 py-0.5 text-xs font-bold"
                              style={{
                                color: "var(--theme-text-secondary)",
                                background: "var(--theme-surface-strong)",
                                border: "1px solid var(--theme-border-soft)",
                              }}
                            >
                              +{operatorCount - 3} more
                            </span>
                          </GlobalTooltip>
                        )}
                      </div>
                    )
                  ) : (
                    <p className="m-0 mt-1 text-sm font-bold text-(--theme-text-primary)">
                      {scanner[item.key] ?? "-"}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card padding="20px" rounded="18px">
          <div className="mb-5 flex items-center gap-3">
            <Cpu size={19} className="text-(--color-aurora-teal)" />
            <h2 className="m-0 text-lg font-black text-(--theme-text-primary)">
              Device Configuration
            </h2>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailField label="Scanner ID" mono value={scanner.id} />
            <DetailField label="Scanner Type" value={scanner.scannerTypeLabel || scanner.type} />
            <DetailField label="Scanner Mode" value={scanner.scannerModeLabel || scanner.mode} />
            <DetailField label="Status" value={scanner.statusLabel || scanner.status} />
          </dl>
        </Card>

        <Card padding="20px" rounded="18px">
          <div className="mb-5 flex items-center gap-3">
            <History size={19} className="text-(--color-aurora-teal)" />
            <h2 className="m-0 text-lg font-black text-(--theme-text-primary)">
              Ownership & Audit
            </h2>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailField label="Created By" value={createdByUser.name} />
            <DetailField label="Creator Role" value={creatorRole} />
            <DetailField
              label="Created At"
              value={formatDateTime(scanner.createdAt)}
            />
            <DetailField
              label="Updated At"
              value={formatDateTime(scanner.updatedAt)}
            />
          </dl>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card padding="20px" rounded="18px">
          <div className="mb-5 flex items-center gap-3">
            <UserRound size={19} className="text-(--color-aurora-teal)" />
            <h2 className="m-0 text-lg font-black text-(--theme-text-primary)">
              {assignedOperators.length > 1
                ? `Assigned Operators (${assignedOperators.length})`
                : "Assigned Operator"}
            </h2>
          </div>
          {assignedOperators.length > 0 ? (
            <div className="space-y-4">
              {assignedOperators.map((operator, index) => {
                const opName =
                  operator.name ||
                  operator.user?.name ||
                  operator.user?.fullName ||
                  "-";
                const opEmail = operator.email || operator.user?.email || "-";

                return (
                  <dl
                    key={operator.id || index}
                    className={`grid gap-4 sm:grid-cols-2 ${
                      index > 0
                        ? "border-t border-(--theme-border-soft) pt-4"
                        : ""
                    }`}
                  >
                    <DetailField
                      label={
                        assignedOperators.length > 1
                          ? `Operator ${index + 1} Name`
                          : "Name"
                      }
                      value={opName}
                    />
                    <DetailField
                      label={
                        assignedOperators.length > 1
                          ? `Operator ${index + 1} Email`
                          : "Email"
                      }
                      value={opEmail}
                    />
                  </dl>
                );
              })}
            </div>
          ) : (
            <p className="m-0 text-sm font-medium text-(--theme-text-muted)">
              No operator assigned.
            </p>
          )}
        </Card>

        <Card padding="20px" rounded="18px">
          <div className="mb-5 flex items-center gap-3">
            <FileText size={19} className="text-(--color-aurora-teal)" />
            <h2 className="m-0 text-lg font-black text-(--theme-text-primary)">
              Notes
            </h2>
          </div>
          <p className="m-0 text-sm font-medium leading-relaxed text-(--theme-text-secondary)">
            {scanner.customNotes || "No notes provided."}
          </p>
        </Card>
      </div>

      <Card padding="20px" rounded="18px">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-(--theme-border-soft) bg-(--button-ghost-bg)">
              <Logs size={19} className="text-(--color-aurora-teal)" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="m-0 text-lg font-black text-(--theme-text-primary)">Scanner Logs</h2>
                <span className="rounded-full bg-(--button-ghost-bg) px-2.5 py-0.5 font-mono text-xs font-bold text-(--color-aurora-teal)">
                  {logsPagination.totalItems || logs.length} Records
                </span>
              </div>
              <p className="m-0 mt-0.5 text-xs font-medium text-(--theme-text-muted)">
                RFID scans, movement directions, batches, and wash lifecycle records. Click any row to view full details.
              </p>
            </div>
          </div>
          <Button leftIcon={<RefreshCw size={14} />} onClick={() => { setLogsLoading(true); setLogsRefreshKey((key) => key + 1); }} size="sm" variant="outline">
            Refresh
          </Button>
        </div>

        {logsError ? <Alert variant="danger">{logsError}</Alert> : null}
        <Table
          columns={logColumns}
          data={logs}
          emptyText="No scanner logs found."
          loading={logsLoading}
          rowKey={(log, index) => log.id || log._id || `${log.tagId}-${index}`}
          tableClassName="min-w-[1100px]"
          onRowClick={(log) => setSelectedLog(log)}
          rowClassName="cursor-pointer hover:bg-(--button-ghost-bg)/40 transition-colors"
        />
        <Pagination
          forcePage={logsPage - 1}
          itemsPerPage={50}
          onPageChange={({ selected }) => { setLogsLoading(true); setLogsPage(selected + 1); }}
          pageCount={Number(logsPagination.totalPages || 0)}
          totalItems={Number(logsPagination.totalItems || logsPagination.total || 0)}
        />
      </Card>

      <AddScannerModal
        getStaffOptions={getStaffOptions}
        initialValues={{
          ...scanner,
          status:
            String(scanner?.status || "").trim().toLowerCase() === "inactive"
              ? "Inactive"
              : "Active",
          scannerName: scanner.name,
          scannerId: scanner.id,
          scannerType: scanner.type,
          scannerMode: scanner.mode,
          location: scanner.scannerLocation,
          zoneName: scanner.zoneName,
          assignedOperatorId: scanner.assignedOperatorId,
          assignedOperatorIds:
            Array.isArray(scanner.assignedOperatorIds) &&
            scanner.assignedOperatorIds.length > 0
              ? scanner.assignedOperatorIds
              : scanner.assignedOperatorId
              ? [scanner.assignedOperatorId]
              : [],
          customNotes: scanner.customNotes,
        }}
        isOpen={isConfigureOpen}
        mode="edit"
        onClose={() => setIsConfigureOpen(false)}
        onSubmit={handleConfigure}
      />

      <ScannerHardwareRecoveryModal
        isOpen={Boolean(recoveryMode)}
        isSubmitting={isRecoverySubmitting}
        mode={recoveryMode}
        onClose={() => setRecoveryMode(null)}
        onSubmit={handleRecovery}
        scanner={scanner}
      />
      <ScannerAccessModal isOpen={isAccessOpen} onClose={() => setIsAccessOpen(false)} scanner={scanner} staffOptions={staffOptions} roleOptions={roleOptions} policyOwnerType={policyOwnerType} onSave={(payload) => updateAccess(scanner.apiId, payload)} onRotate={() => rotateKey(scanner.apiId).then((response) => response?.data || response)} onRevoke={() => revokeKey(scanner.apiId)} />

      <ScannerLogDetailModal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
      />
    </div>
  );
};

export default ScannerDetailsIndex;

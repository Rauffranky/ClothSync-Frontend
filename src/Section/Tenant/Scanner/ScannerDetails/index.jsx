import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  AlertTriangle,
  Cpu,
  FileText,
  Gauge,
  History,
  Logs,
  MapPin,
  RefreshCw,
  UserRound,
} from "lucide-react";
import Alert from "../../../../Components/UI/Alert";
import Button from "../../../../Components/UI/Button";
import Card from "../../../../Components/UI/Card";
import Table from "../../../../Components/UI/Table";
import Badge from "../../../../Components/UI/Badge";
import Pagination from "../../../../Components/UI/Pagination";
import { getApiErrorMessage } from "../../../../axios/api";
import { getTenantScannerDetails, getTenantScannerLogs } from "../../../../axios/scanners/tenantScanners";
import { formatDateTime } from "../../../../Utils/date";
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

  const retryLoad = () => {
    setIsLoading(true);
    setLoadError("");
    setRetryKey((current) => current + 1);
  };

  const handleConfigure = async (values) => {
    const response = await configureScanner(scanner.apiId, {
      scannerType: values.scannerType.toLowerCase(),
      scannerMode: values.scannerMode.toLowerCase(),
      location: values.location.trim(),
      zoneName: values.zoneName.trim(),
      status: values.status.toLowerCase(),
      assignedOperatorId: values.assignedOperatorId || null,
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
  const createdByUser = scanner.createdByUser || {};
  const creatorRole = createdByUser.role
    ? String(createdByUser.role)
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase())
    : null;

  const logColumns = [
    { key: "tag", label: "Tag", accessor: (log) => log.tagId || log.tag?.epc || log.epc || "-", className: "font-mono text-xs", sortable: false },
    { key: "mode", label: "Mode", accessor: (log) => log.mode || log.scanMode || "-", sortable: false },
    {
      key: "status", label: "Status", accessor: (log) => log.status || log.scanStatus || "-", sortable: false,
      render: (value) => <Badge size="sm" variant={String(value).toLowerCase().includes("failed") ? "danger" : "info"}>{String(value).replace(/[_-]+/g, " ")}</Badge>,
    },
    { key: "batch", label: "Batch", accessor: (log) => log.batchId || log.batch?.id || log.batch?.batchNumber || "-", sortable: false },
    { key: "activity", label: "Activity", accessor: (log) => formatDateTime(log.createdAt || log.scannedAt || log.lastActivityAt, true) || "-", sortable: false },
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

      {!String(scanner.status).toLowerCase().includes("active") ? (
        <Alert leftIcon={<AlertTriangle size={18} />} variant="warning">
          This scanner is not active. Scanning remains disabled until hardware
          recovery, configuration, and backend activation are complete.
        </Alert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => {
          const Icon = item.icon;
          const value = scanner[item.key];

          return (
            <Card key={item.key} padding="16px 18px" rounded="16px">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-(--theme-border-soft) bg-(--button-ghost-bg)">
                  <Icon size={16} className="text-(--color-aurora-teal)" />
                </div>
                <div className="min-w-0">
                  <p className="m-0 text-[11px] font-black uppercase tracking-[0.12em] text-(--theme-text-muted)">
                    {item.label}
                  </p>
                  <p className="m-0 mt-1 text-sm font-bold text-(--theme-text-primary)">
                    {value ?? "-"}
                  </p>
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
              Assigned Operator
            </h2>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailField
              label="Name"
              value={assignedOperatorUser.name || assignedOperatorUser.fullName}
            />
            <DetailField label="Email" value={assignedOperatorUser.email} />
          </dl>
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
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Logs size={19} className="text-(--color-aurora-teal)" />
            <h2 className="m-0 text-lg font-black text-(--theme-text-primary)">Scanner Logs</h2>
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
          tableClassName="min-w-[720px]"
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
          scannerName: scanner.name,
          scannerId: scanner.id,
          scannerType: scanner.type,
          scannerMode: scanner.mode,
          location: scanner.scannerLocation,
          zoneName: scanner.zoneName,
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
    </div>
  );
};

export default ScannerDetailsIndex;

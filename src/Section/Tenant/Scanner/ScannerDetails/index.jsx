import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  AlertTriangle,
  Battery,
  Cpu,
  Gauge,
  Logs,
  RefreshCw,
  ShieldAlert,
  UserRound,
  Wifi,
} from "lucide-react";
import Alert from "../../../../Components/UI/Alert";
import Badge from "../../../../Components/UI/Badge";
import Button from "../../../../Components/UI/Button";
import Card from "../../../../Components/UI/Card";
import ProgressBar from "../../../../Components/UI/ProgressBar";
import { getApiErrorMessage } from "../../../../axios/api";
import { getTenantScannerDetails } from "../../../../axios/scanners/tenantScanners";
import { formatDateTime } from "../../../../Utils/date";
import { normalizeScanner } from "../data";
import HeaderCard from "./HeaderCard";

const summaryItems = [
  { key: "lastActivity", label: "Last Activity", icon: Logs },
  { key: "reads", label: "Total Reads", icon: Gauge },
  { key: "location", label: "Location", icon: Cpu },
  { key: "operator", label: "Operator", icon: ShieldAlert },
];

const signalLabels = {
  low_signal: "Low Signal",
  offline: "Offline",
  online: "Online",
  warning: "Warning",
};

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

const ScannerDetailsIndex = () => {
  const { id } = useParams();
  const [scanner, setScanner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    getTenantScannerDetails(id)
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
  }, [id, retryKey]);

  const retryLoad = () => {
    setIsLoading(true);
    setLoadError("");
    setRetryKey((current) => current + 1);
  };

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

  const batteryLevel = Number(scanner.batteryLevel) || 0;
  const assignedOperator = scanner.assignedOperator || {};
  const assignedOperatorUser = assignedOperator.user || {};

  return (
    <div className="space-y-6">
      <HeaderCard data={scanner} />

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
            <DetailField label="Firmware" value={scanner.firmwareVersion} />
            <DetailField label="Scanner Type" value={scanner.scannerTypeLabel || scanner.type} />
            <DetailField label="Scanner Mode" value={scanner.scannerModeLabel || scanner.mode} />
            <DetailField label="Status" value={scanner.statusLabel || scanner.status} />
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-(--theme-text-muted)">
                Signal
              </dt>
              <dd className="m-0 mt-2">
                <Badge
                  leftIcon={<Wifi size={12} />}
                  size="sm"
                  variant={scanner.signalStatus === "online" ? "success" : "warning"}
                >
                  {signalLabels[scanner.signalStatus] || scanner.signalStatus}
                </Badge>
              </dd>
            </div>
            <DetailField label="Locale" value={scanner.locale} />
            <DetailField label="Laundry ID" mono value={scanner.laundryId} />
          </dl>
        </Card>

        <Card padding="20px" rounded="18px">
          <div className="mb-5 flex items-center gap-3">
            <Battery size={19} className="text-(--color-aurora-teal)" />
            <h2 className="m-0 text-lg font-black text-(--theme-text-primary)">
              Battery & Notes
            </h2>
          </div>
          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm font-bold text-(--theme-text-secondary)">
                <span>Battery Level</span>
                <span>{batteryLevel}%</span>
              </div>
              <ProgressBar
                heightClass="h-2"
                value={batteryLevel}
                variant={batteryLevel <= 20 ? "danger" : "success"}
              />
            </div>
            <div>
              <p className="m-0 text-xs font-bold uppercase tracking-wide text-(--theme-text-muted)">
                Notes
              </p>
              <p className="m-0 mt-2 text-sm font-medium leading-relaxed text-(--theme-text-secondary)">
                {scanner.customNotes || "No notes provided."}
              </p>
            </div>
          </div>
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
            <DetailField label="Full Name" value={assignedOperatorUser.fullName} />
            <DetailField label="Email" value={assignedOperatorUser.email} />
            <DetailField label="Phone" value={assignedOperatorUser.phone} />
            <DetailField label="Staff Status" value={assignedOperator.status} />
            <DetailField label="Location" value={assignedOperator.locationName} />
            <DetailField label="Language" value={assignedOperator.language} />
            <DetailField
              label="Invited At"
              value={formatDateTime(assignedOperator.invitedAt)}
            />
            <DetailField label="Operator Created By" mono value={assignedOperator.createdBy} />
            <DetailField
              label="Operator Created At"
              value={formatDateTime(assignedOperator.createdAt)}
            />
            <DetailField
              label="Operator Updated At"
              value={formatDateTime(assignedOperator.updatedAt)}
            />
          </dl>
        </Card>


      </div>

    </div>
  );
};

export default ScannerDetailsIndex;

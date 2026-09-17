import {
  AlertTriangle,
  Hash,
  LogIn,
  LogOut,
  MapPin,
  RadioTower,
  Settings,
  Tag,
  Timer,
  Zap,
} from "lucide-react";
import Badge from "../../../Components/UI/Badge";
import Card from "../../../Components/UI/Card";
import Button from "../../../Components/UI/Button";
import Dropdown from "../../../Components/UI/Dropdown";
import ToggleSwitch from "../../../Components/UI/ToggleSwitch";
import { formatTimeWithUserPreferences } from "../../../Utils/date";
import { formatStatusLabel } from "../../../Utils/status";

const getScannerName = (scanner) =>
  scanner?.name ??
  scanner?.scannerName ??
  scanner?.translations?.en?.name ??
  scanner?.translations?.en?.scannerName ??
  "—";

const ScannerStatusCard = ({
  session,
  scanner,
  lastEpc,
  scannersList = [],
  onSelectScanner,
  onFixedCommand,
  isCommandRunning,
  onClearSession,
  isClearing,
  hasEntries = false,
  selectedCount = 0,
  eligibleSelectedCount = null,
  onCreateComplaint,
  onCheckIn,
  onCheckOut,
  isActionInProgress = false,
}) => {
  const isStarting = isCommandRunning === "start" || session?.status === "starting";
  const isStopping = isCommandRunning === "stop" || session?.status === "stopping";
  const isSessionActive = session?.status === "active";

  const isOffline = Boolean(
    session?.status === "offline" ||
    (scanner && (
      scanner.isOnline === false ||
      scanner.status === "offline" ||
      scanner.status === "inactive" ||
      scanner.signalStatus === "offline"
    ))
  );

  const isConnected = Boolean(
    !isOffline && (isSessionActive || isStarting || isStopping || scanner?.isOnline || scanner?.status === "active")
  );
  const isFixedScanner =
    String(scanner?.scannerType || scanner?.type || "").toLowerCase() === "fixed";
  const isManualMode =
    String(scanner?.scannerMode || scanner?.mode || "").toLowerCase() === "manual";
  const isTransitioning = Boolean(isCommandRunning) || isStarting || isStopping;

  const fields = [
    {
      icon: Hash,
      label: "Scanner ID",
      value: scanner?.scannerId || scanner?.id || "—",
    },
    {
      icon: RadioTower,
      label: "Scanner Name",
      value: getScannerName(scanner),
    },
    {
      icon: MapPin,
      label: "Location",
      value: scanner?.location || scanner?.zoneName || scanner?.locationName || "—",
    },
    {
      icon: Zap,
      label: "Status",
      value: isStarting
        ? "Starting"
        : isStopping
        ? "Stopping"
        : isSessionActive
        ? "Active"
        : isOffline
        ? "Offline"
        : scanner?.isOnline || scanner?.status === "active"
        ? "Online"
        : "Offline",
    },
    {
      icon: Settings,
      label: "Mode",
      value: scanner?.scannerMode || scanner?.mode
        ? formatStatusLabel(scanner?.scannerMode || scanner?.mode)
        : session
        ? "Bulk Scan"
        : "—",
    },
    {
      icon: Timer,
      label: "Scan Start",
      value: session?.startedAt
        ? formatTimeWithUserPreferences(session.startedAt, true)
        : "—",
    },
    {
      icon: Tag,
      label: "Last EPC",
      value: lastEpc || "—",
      badge: Boolean(lastEpc),
    },
  ];

  return (
    <Card className="mb-6" padding="24px">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              isStarting || isStopping
                ? "bg-amber-400 animate-pulse"
                : isSessionActive
                ? "bg-(--color-aurora-teal) animate-pulse"
                : isConnected
                ? "bg-(--color-aurora-teal)"
                : "bg-rose-500"
            }`}
          />
          <h2 className="text-lg font-black text-(--theme-text-primary)">
            Scanner Status
          </h2>
        </div>
        <Badge
          dot
          variant={
            isStarting || isStopping
              ? "warning"
              : isSessionActive
              ? "success"
              : isConnected
              ? "info"
              : "danger"
          }
        >
          {isStarting
            ? "Starting Scanner..."
            : isStopping
            ? "Stopping Scanner..."
            : isSessionActive
            ? "Session Active & Scanning"
            : isConnected
            ? "Scanner Connected"
            : "Scanner Offline"}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 xl:flex-nowrap">
        {fields.map(({ icon: Icon, label, value, badge }) => (
          <div key={label}>
            <p className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-(--theme-text-secondary)">
              <Icon aria-hidden="true" className="text-(--theme-text-muted)" size={15} />
              {label}
            </p>
            {badge ? (
              <Badge
                className="border-none bg-[color-mix(in_srgb,var(--color-aurora-teal)_15%,var(--theme-surface))] font-mono text-sm"
                size="md"
                variant="primary"
              >
                {value}
              </Badge>
            ) : label === "Status" ? (
              <p
                className={`font-black capitalize ${
                  value === "Active" || value === "Online"
                    ? "text-emerald-400"
                    : value === "Starting" || value === "Stopping"
                    ? "text-amber-400"
                    : "text-rose-500"
                }`}
              >
                {value}
              </p>
            ) : (
              <p className="font-black capitalize text-(--theme-text-primary)">{value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Fixed Scanner Control Buttons Toolbar - Only shown when scanner type is fixed */}
      {(isFixedScanner || session) && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-(--theme-border-soft) pt-4">
          {/* Left Side: Scanner Device Selector */}
          <div className="flex items-center gap-2">
            {isFixedScanner && scannersList && scannersList.length > 0 && (
              <>
                <span className="text-xs font-bold text-(--theme-text-secondary)">
                  Scanner:
                </span>
                <Dropdown
                  width="w-48"
                  options={scannersList.map((s) => ({
                    value: s.id || s.scannerId,
                    label: s.name || s.scannerName || s.scannerId || `Scanner #${s.id}`,
                  }))}
                  value={scanner?.id || scanner?.scannerId}
                  onChange={(selected) => {
                    const found = scannersList.find(
                      (s) => (s.id || s.scannerId) === selected.value,
                    );
                    if (found) onSelectScanner?.(found);
                  }}
                />
              </>
            )}
          </div>

          {/* Right Side: Operational Actions (Scanner Toggle, Scan Again, Session & Tag Actions) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isFixedScanner && (
              <>
                <ToggleSwitch
                  checked={isSessionActive || isStarting}
                  checkedLabel={isStarting ? "Starting..." : isStopping ? "Stopping..." : "Stop Scan"}
                  checkedVariant="danger"
                  disabled={isTransitioning}
                  loading={isTransitioning}
                  onChange={(shouldStart) => {
                    if (isTransitioning) return;
                    if (shouldStart) {
                      onFixedCommand?.("start");
                    } else {
                      onFixedCommand?.("stop");
                    }
                  }}
                  size="md"
                  uncheckedLabel="Start Scan"
                  uncheckedVariant="primary"
                />
                <Button
                  disabled={isTransitioning}
                  loading={isCommandRunning === "rescan"}
                  onClick={() => onFixedCommand?.("rescan")}
                  size="sm"
                  variant="secondary"
                >
                  Scan Again
                </Button>
              </>
            )}

            {selectedCount > 0 ? (
              <>
                {isManualMode && (
                  <>
                    <Button
                      disabled={isActionInProgress}
                      leftIcon={<LogIn size={14} />}
                      loading={isActionInProgress}
                      onClick={onCheckIn}
                      size="sm"
                      variant="primary"
                    >
                      Check In ({selectedCount})
                    </Button>
                    <Button
                      disabled={isActionInProgress}
                      leftIcon={<LogOut size={14} />}
                      loading={isActionInProgress}
                      onClick={onCheckOut}
                      size="sm"
                      variant="secondary"
                    >
                      Check Out ({selectedCount})
                    </Button>
                  </>
                )}
                <Button
                  className={eligibleSelectedCount === 0 ? "opacity-75" : ""}
                  leftIcon={<AlertTriangle size={14} />}
                  onClick={onCreateComplaint}
                  size="sm"
                  title={
                    eligibleSelectedCount === 0
                      ? "Selected tag(s) are not linked to any business or batch"
                      : undefined
                  }
                  variant="outline"
                >
                  Complaint (
                  {eligibleSelectedCount != null && eligibleSelectedCount > 0
                    ? eligibleSelectedCount
                    : selectedCount}
                  )
                </Button>
              </>
            ) : (
              (session || hasEntries) && (
                <Button
                  disabled={Boolean(isClearing || isTransitioning)}
                  loading={isClearing}
                  onClick={onClearSession}
                  size="sm"
                  variant="secondary"
                >
                  Finish / Clear Session
                </Button>
              )
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default ScannerStatusCard;

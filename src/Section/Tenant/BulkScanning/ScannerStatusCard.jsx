import { Hash, MapPin, RadioTower, Settings, Tag, Timer, Zap } from "lucide-react";
import Badge from "../../../Components/UI/Badge";
import Card from "../../../Components/UI/Card";
import Button from "../../../Components/UI/Button";
import ToggleSwitch from "../../../Components/UI/ToggleSwitch";
import { formatTimeWithUserPreferences } from "../../../Utils/date";
import { formatStatusLabel } from "../../../Utils/status";

const getScannerName = (scanner) =>
  scanner?.name ??
  scanner?.scannerName ??
  scanner?.translations?.en?.name ??
  scanner?.translations?.en?.scannerName ??
  "-";

const ScannerStatusCard = ({
  session,
  scanner,
  lastEpc,
  onFixedCommand,
  isCommandRunning,
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
    !isOffline && (isSessionActive || isStarting || isStopping || scanner?.isOnline || scanner?.status === "active" || scanner || session)
  );
  const isTransitioning = Boolean(isCommandRunning) || isStarting || isStopping;
  const fields = [
    { icon: Hash, label: "Scanner ID", value: scanner?.scannerId ?? "-" },
    { icon: RadioTower, label: "Scanner Name", value: getScannerName(scanner) },
    {
      icon: MapPin,
      label: "Location",
      value: scanner?.location ?? scanner?.zoneName ?? "-",
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
    { icon: Settings, label: "Mode", value: formatStatusLabel(scanner?.scannerMode) },
    {
      icon: Timer,
      label: "Scan Start",
      value: formatTimeWithUserPreferences(session?.startedAt, true),
    },
    { icon: Tag, label: "Last EPC", value: lastEpc ?? "-", badge: true },
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
          <h2 className="text-lg font-black text-(--theme-text-primary)">Scanner Status</h2>
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
      {String(scanner?.scannerType || scanner?.type).toLowerCase() === "fixed" && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
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
        </div>
      )}
    </Card>
  );
};

export default ScannerStatusCard;

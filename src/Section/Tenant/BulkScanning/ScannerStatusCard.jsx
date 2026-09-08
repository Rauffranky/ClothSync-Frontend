import { Hash, MapPin, RadioTower, Settings, Tag, Timer, Zap } from "lucide-react";
import Badge from "../../../Components/UI/Badge";
import Card from "../../../Components/UI/Card";
import Button from "../../../Components/UI/Button";
import { formatTimeWithUserPreferences } from "../../../Utils/date";
import { formatStatusLabel } from "../../../Utils/status";

const getScannerName = (scanner) =>
  scanner?.name ??
  scanner?.scannerName ??
  scanner?.translations?.en?.name ??
  scanner?.translations?.en?.scannerName ??
  "-";

const ScannerStatusCard = ({ session, scanner, lastEpc, onFixedCommand }) => {
  const isConnected = Boolean(scanner || session);
  const fields = [
    { icon: Hash, label: "Scanner ID", value: scanner?.scannerId ?? "-" },
    { icon: RadioTower, label: "Scanner Name", value: getScannerName(scanner) },
    {
      icon: MapPin,
      label: "Location",
      value: scanner?.location ?? scanner?.zoneName ?? "-",
    },
    { icon: Zap, label: "Status", value: formatStatusLabel(session?.status) },
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
          <div className="h-2.5 w-2.5 rounded-full bg-(--theme-text-primary)" />
          <h2 className="text-lg font-black text-(--theme-text-primary)">Scanner Status</h2>
        </div>
        <Badge dot variant={isConnected ? "success" : "neutral"}>
          {isConnected ? "Connected" : "Waiting for session"}
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
            ) : (
              <p className="font-black capitalize text-(--theme-text-primary)">{value}</p>
            )}
          </div>
        ))}
      </div>
      {String(scanner?.scannerType || scanner?.type).toLowerCase() === "fixed" && (
        <div className="mt-5 flex flex-wrap gap-2"><Button onClick={() => onFixedCommand?.("start")}>Start Scan</Button><Button onClick={() => onFixedCommand?.("stop")} variant="danger">Stop Scan</Button><Button onClick={() => onFixedCommand?.("rescan")} variant="secondary">Scan Again</Button></div>
      )}
    </Card>
  );
};

export default ScannerStatusCard;

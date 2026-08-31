import { Cpu, Radio, Smartphone } from "lucide-react";
import IconWrapper from "../../../../Components/UI/IconWrapper";
import Card from "../../../../Components/UI/Card";
import Badge from "../../../../Components/UI/Badge";

const detailIconMap = {
  Fixed: Radio,
  Portable: Smartphone,
};

const statusVariantMap = {
  Active: "success",
  Warning: "warning",
  Inactive: "danger",
};

const HeaderCard = ({ data, onConfigure, onReconnect, onReplace, onAccess }) => {
  const DeviceIcon = detailIconMap[data.type] || Cpu;

  return (
    <Card padding="18px 22px" rounded="18px">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <IconWrapper
            icon={DeviceIcon}
            variant={data.type === "Portable" ? "warning" : "purple"}
            sizeClassName="h-14 w-14 shrink-0"
            roundedClassName="rounded-[16px]"
            iconSize={30}
          />

          <div className="min-w-0 space-y-1">
            <div>
              <h2 className="m-0 text-[28px] font-black leading-tight text-(--theme-text-primary)">
                {data.name}
              </h2>
              <p className="m-0 mt-1 font-mono text-sm font-semibold text-(--theme-text-muted)">
                {data.id}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onConfigure ? (
            <button
              type="button"
              onClick={onConfigure}
              className="rounded-xl border border-(--theme-border-soft) px-3 py-2 text-sm font-bold text-(--theme-text-primary) transition hover:bg-(--button-ghost-bg)"
            >
              Configure Scanner
            </button>
          ) : null}
          {onReconnect ? (
            <button type="button" onClick={onReconnect} className="rounded-xl border border-(--theme-border-soft) px-3 py-2 text-sm font-bold text-(--theme-text-primary) transition hover:bg-(--button-ghost-bg)">
              Reconnect Device
            </button>
          ) : null}
          {onReplace ? (
            <button type="button" onClick={onReplace} className="rounded-xl bg-(--button-danger-bg) px-3 py-2 text-sm font-bold text-(--button-danger-text) transition hover:opacity-90">
              Replace Device
            </button>
          ) : null}
          {onAccess ? <button type="button" onClick={onAccess} className="rounded-xl border border-(--theme-border-soft) px-3 py-2 text-sm font-bold text-(--theme-text-primary) transition hover:bg-(--button-ghost-bg)">Access & Credentials</button> : null}
          <Badge size="md" variant={statusVariantMap[data.status] || "neutral"}>
            {data.status}
          </Badge>
          <Badge
            size="md"
            variant={data.type === "Portable" ? "warning" : "purple"}
          >
            {data.type}
          </Badge>
          <Badge
            size="md"
            variant={
              data.mode === "Entry"
                ? "info"
                : data.mode === "Exit"
                  ? "success"
                  : "neutral"
            }
          >
            {data.mode}
          </Badge>
        </div>
      </div>
    </Card>
  );
};

export default HeaderCard;

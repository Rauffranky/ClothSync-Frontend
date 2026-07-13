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

const HeaderCard = ({ data }) => {
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

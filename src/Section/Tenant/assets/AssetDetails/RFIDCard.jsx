import { CalendarDays, Cpu, Eye, Radio } from "lucide-react";
import Card from "../../../../Components/UI/Card";
import Button from "../../../../Components/UI/Button";
import IconWrapper from "../../../../Components/UI/IconWrapper";
import Alert from "../../../../Components/UI/Alert";
import Badge from "../../../../Components/UI/Badge";

const RFIDCard = ({ data }) => {
  return (
    <Card bodyClassName="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconWrapper
            icon={Cpu}
            variant="info"
            sizeClassName="h-10 w-10"
            iconSize={20}
            roundedClassName="rounded-xl"
          />
          <h3 className="m-0 font-bold text-(--theme-text-primary)">
            RFID Tag
          </h3>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<Eye size={14} />}>
          View Detail
        </Button>
      </div>

      <Card bodyClassName="space-y-3" padding="18px 20px">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-(--theme-text-muted)">
            <Radio aria-hidden="true" size={15} /> Tag EPC
          </div>
          <Badge size="sm" variant="info">
            {data.rfid.tagId}
          </Badge>
        </div>
        <div className="break-all font-mono text-sm font-black tracking-wide text-(--theme-text-primary)">
          {data.rfid.tagEpc}
        </div>
      </Card>

      <div className="rounded-xl border border-(--theme-border) bg-(--theme-surface) p-4">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-(--theme-text-muted)">
            <CalendarDays aria-hidden="true" size={15} /> Linked Date
          </div>
          <p className="m-0 text-sm font-bold text-(--theme-text-primary)">
            {data.rfid.linkedDate}
          </p>
      </div>

      {data.rfid.previousTag && (
        <Alert variant="orange" rounded="rounded-xl">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-bold uppercase tracking-wider">
              Previous Tag
            </div>
            <div className="text-xs font-bold">{data.rfid.previousTag.id}</div>
            <div className="text-[11px] font-medium opacity-80">
              {data.rfid.previousTag.epc}
            </div>
            <div className="text-[11px] font-medium">
              Unlinked {data.rfid.previousTag.unlinkedDate} —{" "}
              {data.rfid.previousTag.reason}
            </div>
          </div>
        </Alert>
      )}
    </Card>
  );
};

export default RFIDCard;

import { Cpu, Eye } from "lucide-react";
import Card from "../../../../Components/UI/Card";
import Button from "../../../../Components/UI/Button";
import IconWrapper from "../../../../Components/UI/IconWrapper";
import Alert from "../../../../Components/UI/Alert";

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

      <Card>
        <div className="text-xs font-bold uppercase tracking-wider text-(--theme-text-muted)">
          Tag EPC{" "}
          <span className="text-(--theme-text-primary)">
            ({data.rfid.tagId})
          </span>
        </div>
        <div className="font-mono text-[13px] font-black text-(--theme-text-primary) break-all">
          {data.rfid.tagEpc}
        </div>
      </Card>

      <div className="">
        <div className="text-xs font-bold uppercase tracking-wider text-(--theme-text-muted)">
          Linked Date{" "}
          <span className="text-(--theme-text-primary)">
            ({data.rfid.linkedDate})
          </span>
        </div>
      </div>

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
    </Card>
  );
};

export default RFIDCard;

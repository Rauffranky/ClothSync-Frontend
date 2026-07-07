import { Cpu, Eye } from "lucide-react";
import Card from "../../../../Components/UI/Card";
import Button from "../../../../Components/UI/Button";
import IconWrapper from "../../../../Components/UI/IconWrapper";

const RFIDCard = ({ data }) => {
    return (
        <Card className="w-full md:w-[340px] shrink-0" bodyClassName="flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <IconWrapper icon={Cpu} variant="info" sizeClassName="h-10 w-10" iconSize={20} roundedClassName="rounded-xl" />
                    <h3 className="m-0 font-bold text-(--theme-text-primary)">RFID Tag</h3>
                </div>
                <Button variant="secondary" size="sm" leftIcon={<Eye size={14} />}>
                    View Detail
                </Button>
            </div>

            <div className="rounded-xl border border-(--theme-border) p-4 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-(--theme-text-muted)">Tag EPC</div>
                <div className="font-mono text-[13px] font-black text-(--theme-text-primary) break-all">
                    {data.rfid.tagEpc}
                </div>
                <div className="text-xs font-bold text-blue-500">
                    {data.rfid.tagId}
                </div>
            </div>

            <div className="space-y-1 px-1">
                <div className="text-xs font-bold uppercase tracking-wider text-(--theme-text-muted)">Linked Date</div>
                <div className="font-mono text-[13px] font-bold text-(--theme-text-primary)">
                    {data.rfid.linkedDate}
                </div>
            </div>

            <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4 dark:border-orange-500/30 dark:bg-orange-500/10 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-orange-800 dark:text-orange-400">Previous Tag</div>
                <div className="text-xs font-bold text-orange-700 dark:text-orange-300">
                    {data.rfid.previousTag.id}
                </div>
                <div className="text-[11px] font-medium text-orange-600/80 dark:text-orange-400/80">
                    {data.rfid.previousTag.epc}
                </div>
                <div className="text-[11px] font-medium text-orange-600 dark:text-orange-400">
                    Unlinked {data.rfid.previousTag.unlinkedDate} — {data.rfid.previousTag.reason}
                </div>
            </div>
        </Card>
    );
};

export default RFIDCard;

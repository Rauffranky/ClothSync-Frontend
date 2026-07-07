import { RefreshCw, Building2, FileText } from "lucide-react";
import Card from "../../../../Components/UI/Card";
import IconWrapper from "../../../../Components/UI/IconWrapper";
import ProgressBar from "../../../../Components/UI/ProgressBar";

const OverviewTab = ({ data }) => {
    const stats = [
        {
            id: "wash-cycles",
            icon: RefreshCw,
            variant: "success",
            value: (
                <>
                    {data.washCount} <span className="text-sm font-semibold text-(--theme-text-muted)">/ {data.maxWash}</span>
                </>
            ),
            isMono: true,
            label: "Total Wash Cycles",
            subtext: `${Math.round((data.washCount / data.maxWash) * 100)}% of lifecycle used`,
        },
        {
            id: "assigned-laundry",
            icon: Building2,
            variant: "info",
            value: data.assignedLaundry,
            isMono: false,
            label: "Assigned Laundry",
            subtext: "Automatic dispatch mode",
        },
        {
            id: "current-batch",
            icon: FileText,
            variant: "purple",
            value: data.currentBatch.id,
            isMono: true,
            label: "Current Batch",
            subtext: `${data.currentBatch.status} — ${data.currentBatch.date}`,
        }
    ];

    return (
        <div className="space-y-4">
            <div className="grid gap-2 md:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.id} bodyClassName="flex flex-col gap-4">
                        <IconWrapper icon={stat.icon} variant={stat.variant} sizeClassName="h-8 w-8 rounded-lg" iconSize={16} />
                        <div className="space-y-1">
                            <div className={`text-lg font-black text-(--theme-text-primary) ${stat.isMono ? 'font-mono' : ''}`}>
                                {stat.value}
                            </div>
                            <div className="text-sm font-bold text-(--theme-text-primary)">{stat.label}</div>
                            <div className="text-xs font-medium text-(--theme-text-muted)">
                                {stat.subtext}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card bodyClassName="flex flex-col gap-4">
                <h3 className="m-0 text-xs font-bold uppercase tracking-wider text-(--theme-text-muted)">Wash Cycle Progress</h3>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <ProgressBar value={data.washCount} max={data.maxWash} variant="success" heightClass="h-3" />
                    </div>
                    <div className="font-mono text-sm font-bold text-(--theme-text-primary)">
                        {data.washCount} <span className="text-xs font-semibold text-(--theme-text-muted)">/ {data.maxWash}</span>
                    </div>
                </div>
            </Card>

            <Card bodyClassName="flex flex-col gap-4">
                <h3 className="m-0 text-xs font-bold uppercase tracking-wider text-(--theme-text-muted)">Description</h3>
                <p className="m-0 text-sm font-medium text-(--theme-text-primary)">
                    {data.description}
                </p>
            </Card>
        </div>
    );
};

export default OverviewTab;

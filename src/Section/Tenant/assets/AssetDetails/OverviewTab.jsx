import { RefreshCw, Building2, FileText } from "lucide-react";
import Card from "../../../../Components/UI/Card";
import IconWrapper from "../../../../Components/UI/IconWrapper";
import ProgressBar from "../../../../Components/UI/ProgressBar";

const OverviewTab = ({ data }) => {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
                <Card bodyClassName="flex flex-col gap-4">
                    <IconWrapper icon={RefreshCw} variant="success" sizeClassName="h-8 w-8 rounded-lg" iconSize={16} />
                    <div className="space-y-1">
                        <div className="font-mono text-lg font-black text-(--theme-text-primary)">
                            {data.washCount} <span className="text-sm font-semibold text-(--theme-text-muted)">/ {data.maxWash}</span>
                        </div>
                        <div className="text-sm font-bold text-(--theme-text-primary)">Total Wash Cycles</div>
                        <div className="text-xs font-medium text-(--theme-text-muted)">
                            {Math.round((data.washCount / data.maxWash) * 100)}% of lifecycle used
                        </div>
                    </div>
                </Card>
                <Card bodyClassName="flex flex-col gap-4">
                    <IconWrapper icon={Building2} variant="info" sizeClassName="h-8 w-8 rounded-lg" iconSize={16} />
                    <div className="space-y-1">
                        <div className="text-lg font-black text-(--theme-text-primary)">
                            {data.assignedLaundry}
                        </div>
                        <div className="text-sm font-bold text-(--theme-text-primary)">Assigned Laundry</div>
                        <div className="text-xs font-medium text-(--theme-text-muted)">
                            Automatic dispatch mode
                        </div>
                    </div>
                </Card>
                <Card bodyClassName="flex flex-col gap-4">
                    <IconWrapper icon={FileText} variant="purple" sizeClassName="h-8 w-8 rounded-lg" iconSize={16} />
                    <div className="space-y-1">
                        <div className="font-mono text-lg font-black text-(--theme-text-primary)">
                            {data.currentBatch.id}
                        </div>
                        <div className="text-sm font-bold text-(--theme-text-primary)">Current Batch</div>
                        <div className="text-xs font-medium text-(--theme-text-muted)">
                            {data.currentBatch.status} — {data.currentBatch.date}
                        </div>
                    </div>
                </Card>
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

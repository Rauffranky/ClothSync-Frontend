import { Cpu } from "lucide-react";
import Card from "../../../../Components/UI/Card";
import Badge from "../../../../Components/UI/Badge";
import IconWrapper from "../../../../Components/UI/IconWrapper";
import ScanLogsTable from "./ScanLogsTable";
import StatsRow from "./StatsRow";

const TagDetailIndex = () => {
    return (
        <div className="space-y-6">
            <Card padding="18px 22px" rounded="18px">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <IconWrapper
                            icon={Cpu}
                            variant="primary"
                            sizeClassName="h-14 w-14 shrink-0"
                            roundedClassName="rounded-[16px]"
                            iconSize={30}
                        />
                        <div className="min-w-0 space-y-1">
                            <div>
                                <h2 className="m-0 text-[28px] font-black leading-tight text-(--theme-text-primary)">
                                    Tag-001
                                </h2>
                                <p className="m-0 mt-1 font-mono text-sm font-semibold text-(--theme-text-muted)">
                                    E2800189200040D6...
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <Badge variant="success" size="md">Active</Badge>
                        <Badge variant="purple" size="md">In Laundry</Badge>
                    </div>
                </div>
            </Card>

            {/* Stats Row */}
            <StatsRow />
            <div>
                <div className="flex items-center gap-3 mb-4 px-1">
                    <h3 className="m-0 text-xl font-bold text-(--tenant-primary)">Scan Logs</h3>
                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-(--tenant-soft) text-(--tenant-primary) text-sm font-bold">
                        2
                    </div>
                </div>
                <Card padding="0" rounded="18px">
                    <ScanLogsTable />
                </Card>
            </div>
        </div>
    );
};

export default TagDetailIndex;

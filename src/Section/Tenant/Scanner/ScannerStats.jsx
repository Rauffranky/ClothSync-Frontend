
import Card from "../../../Components/UI/Card";
import IconWrapper from "../../../Components/UI/IconWrapper";
import { scannerStats } from "./data";

const ScannerStats = () => {
    return (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
            {scannerStats.map((stat) => (
                <Card key={stat.id} bodyClassName="flex flex-col gap-3 h-full">
                    <IconWrapper
                        icon={stat.icon}
                        variant={stat.variant}
                        sizeClassName="h-10 w-10 shrink-0"
                        roundedClassName="rounded-[12px]"
                        iconSize={18}
                    />
                    <div className="mt-1 space-y-1">
                        <div className="text-2xl font-black leading-none text-(--theme-text-primary)">
                            {stat.value}
                        </div>
                        <div className="text-sm font-bold leading-tight text-(--theme-text-primary)">
                            {stat.label}
                        </div>
                        <div className="text-xs font-medium text-(--theme-text-muted)">
                            {stat.subtext}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default ScannerStats;

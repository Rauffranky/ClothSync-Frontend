import { Clock, Activity, MapPin, User } from "lucide-react";
import Card from "../../../../Components/UI/Card";

const StatsRow = () => {
    const stats = [
        { key: "lastScan", label: "LAST SCAN", value: "18 min ago", Icon: Clock },
        { key: "recentReads", label: "RECENT READS", value: "87", Icon: Activity },
        { key: "location", label: "LOCATION", value: "Roaming", Icon: MapPin },
        { key: "operator", label: "OPERATOR", value: "James Dawson", Icon: User },
    ];

    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => {
                const Icon = item.Icon;
                return (
                    <Card key={item.key} padding="16px 18px" rounded="16px">
                        <div className="flex items-start gap-3">
                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-(--theme-border-soft) bg-(--button-ghost-bg)">
                                <Icon size={16} className="text-(--color-aurora-teal)" />
                            </div>
                            <div className="min-w-0">
                                <p className="m-0 text-[11px] font-black uppercase tracking-[0.12em] text-(--theme-text-muted)">
                                    {item.label}
                                </p>
                                <p className="m-0 mt-1 text-sm font-bold text-(--theme-text-primary)">
                                    {item.value}
                                </p>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default StatsRow;

import {
    AlertCircle,
    Building2,
    Cuboid,
    RotateCcw,
    ShieldCheck,
    Truck,
    WashingMachine,
} from "lucide-react";
import Card from "../../../Components/UI/Card";
import IconWrapper from "../../../Components/UI/IconWrapper";

const getStats = (counts) => [
    {
        value: counts?.totalAssets,
        label: "Total Assets",
        helper: "all registered",
        icon: Cuboid,
        variant: "info",
    },
    {
        value: counts?.inBusiness,
        label: "In Business",
        helper: "on-premise",
        icon: Building2,
        variant: "business",
    },
    {
        value: counts?.sentToLaundry,
        label: "Sent to Laundry",
        helper: "dispatched",
        icon: Truck,
        variant: "sent",
    },
    {
        value: counts?.atLaundry,
        label: "In Laundry",
        helper: "processing",
        icon: WashingMachine,
        variant: "laundry",
    },
    {
        value: counts?.washed,
        label: "Washed",
        helper: "ready to return",
        icon: ShieldCheck,
        variant: "washed",
    },
    {
        value: counts?.returned,
        label: "Returned",
        helper: "back this week",
        icon: RotateCcw,
        variant: "returned",
    },
    {
        value: counts?.missing,
        label: "Missing / Lost",
        helper: "flagged",
        icon: AlertCircle,
        variant: "missing",
    },
];

const AssetStats = ({ counts }) => {
    const stats = getStats(counts);

    return (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {stats.map((item, index) => {
                const Icon = item.icon;

                return (
                    <Card
                        key={index}
                        className="min-h-40"
                        padding="14px"
                        rounded="8px"
                    >
                        <IconWrapper
                            icon={Icon}
                            iconSize={14}
                            roundedClassName="rounded-md"
                            sizeClassName="h-6 w-6"
                            variant={item.variant}
                        />

                        <p className="m-0 mt-2 text-xl font-black leading-none text-(--theme-text-primary)">
                            {item.value ?? "—"}
                        </p>
                        <p className="m-0 mt-1 text-xs font-bold leading-4 text-(--theme-text-primary)">
                            {item.label}
                        </p>
                        <p className="m-0 mt-0.5 text-[10px] font-semibold leading-4 text-(--theme-text-muted)">
                            {item.helper}
                        </p>
                    </Card>
                );
            })}
        </section>
    );
};

export default AssetStats;

import { AlertCircle, CheckCircle, Link, Link2Off, Tag } from "lucide-react";
import IconWrapper from "../../../Components/UI/IconWrapper";
import Card from "../../../Components/UI/Card";


const getStats = (counts) => [
    {
        value: counts?.totalTags,
        label: "Total Tags",
        helper: "all registered tags",
        icon: Tag,
        variant: "info",
    },
    {
        value: counts?.mappedTags,
        label: "Mapped Tags",
        helper: "linked to an asset",
        icon: Link,
        variant: "success",
    },
    {
        value: counts?.unmappedTags,
        label: "Unmapped Tags",
        helper: "available for mapping",
        icon: Link2Off,
        variant: "secondary",
    },
    {
        value: counts?.activeTags,
        label: "Active Tags",
        helper: "in circulation",
        icon: CheckCircle,
        variant: "primary",
    },
    {
        value: counts?.unlinkedTags,
        label: "Unlinked Tags",
        helper: "detached or orphaned",
        icon: AlertCircle,
        variant: "warning",
    },
];

const StatsCards = ({ counts }) => {
    const stats = getStats(counts);

    return (
        <section className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((item, index) => {
                const Icon = item.icon;
                return (
                    <Card
                        key={index}
                        padding="16px"
                        rounded="12px"
                    >
                        <IconWrapper
                            icon={Icon}
                            iconSize={16}
                            roundedClassName="rounded-md"
                            sizeClassName="h-8 w-8"
                            variant={item.variant}
                        />

                        <p className="m-0 mt-3 text-2xl font-black leading-none text-(--theme-text-primary)">
                            {item.value ?? "—"}
                        </p>
                        <p className="m-0 mt-1 text-sm font-bold leading-4 text-(--theme-text-primary)">
                            {item.label}
                        </p>
                        <p className="m-0 mt-1 text-xs font-semibold leading-4 text-(--theme-text-muted)">
                            {item.helper}
                        </p>
                    </Card>
                );
            })}
        </section>
    );
};

export default StatsCards;

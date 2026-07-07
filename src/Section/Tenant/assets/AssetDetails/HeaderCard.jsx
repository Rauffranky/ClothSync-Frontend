import { Shirt, Layers, MapPin, Building2, Clock } from "lucide-react";
import Card from "../../../../Components/UI/Card";
import Badge from "../../../../Components/UI/Badge";
import IconWrapper from "../../../../Components/UI/IconWrapper";
import ProgressBar from "../../../../Components/UI/ProgressBar";

const HeaderCard = ({ data }) => {
    return (
        <Card >
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
                {/* Icon */}
                <IconWrapper
                    icon={Shirt}
                    variant={data.statusVariant}
                    sizeClassName="h-16 w-16 shrink-0"
                    roundedClassName="rounded-[16px]"
                    iconSize={40}
                />

                {/* Details */}
                <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h2 className="m-0 text-2xl font-bold text-(--theme-text-primary)">
                                {data.name}
                            </h2>
                            <p className="m-0 mt-1 font-mono text-sm font-semibold text-(--theme-text-muted)">
                                {data.id}
                            </p>
                        </div>
                        <Badge variant={data.statusVariant} dot>
                            {data.status}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-y-5 gap-x-4 md:grid-cols-3">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-(--theme-text-muted)">
                                <Layers size={14} /> Category
                            </div>
                            <p className="m-0 font-semibold text-sm text-(--theme-text-primary)">
                                {data.category}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-(--theme-text-muted)">
                                <Layers size={14} /> Category Type
                            </div>
                            <p className="m-0 font-semibold text-sm text-(--theme-text-primary)">
                                {data.categoryType}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-(--theme-text-muted)">
                                <MapPin size={14} /> Zone
                            </div>
                            <p className="m-0 font-semibold text-sm text-(--theme-text-primary)">
                                {data.zone}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-(--theme-text-muted)">
                                <Building2 size={14} /> Assigned Laundry
                            </div>
                            <p className="m-0 font-semibold text-sm text-(--theme-text-primary)">
                                {data.assignedLaundry}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-(--theme-text-muted)">
                                <Clock size={14} /> Last Scanned
                            </div>
                            <p className="m-0 font-mono text-xs font-semibold text-(--theme-text-primary)">
                                {data.lastScanned}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-(--theme-text-muted)">
                                <MapPin size={14} /> Last Scan Location
                            </div>
                            <p className="m-0 font-semibold text-sm text-(--theme-text-primary)">
                                {data.lastScanLocation}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="h-4 w-4 shrink-0 rounded border border-(--theme-border) flex items-center justify-center">
                            <div className="h-1.5 w-1.5 rounded-full bg-(--color-ready)"></div>
                        </div>
                        <div className="flex-1">
                            <ProgressBar value={data.washCount} max={data.maxWash} variant="success" />
                        </div>
                        <div className="shrink-0 text-sm font-bold text-(--theme-text-primary)">
                            {data.washCount} <span className="text-xs font-semibold text-(--theme-text-muted)">/ {data.maxWash} washes</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default HeaderCard;

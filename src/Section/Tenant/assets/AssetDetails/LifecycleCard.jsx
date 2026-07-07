import { Building2, Truck, Shirt, CheckCircle2, RotateCcw } from "lucide-react";
import Card from "../../../../Components/UI/Card";
import IconWrapper from "../../../../Components/UI/IconWrapper";

const ICON_MAP = {
    "In Business": Building2,
    "Sent to Laundry": Truck,
    "In Laundry": Shirt,
    "Sent to Business": CheckCircle2,
    "Returned": RotateCcw,
};

const VARIANT_COLORS = {
    success: "var(--color-ready)",
    warning: "var(--color-pending)",
    purple: "var(--color-super-admin-light)",
    info: "var(--color-sky-blue)",
    neutral: "var(--color-cancelled)",
};

const LifecycleCard = ({ data }) => {
    // Find the last active step index
    const lastActiveIndex = data.lifecycle.reduce(
        (acc, step, i) => (step.active ? i : acc),
        -1,
    );

    return (
        <Card>
            <h3 className="m-0 mb-6 text-xs font-bold uppercase tracking-widest text-(--theme-text-muted)">
                Asset Lifecycle
            </h3>

            <div className="relative flex items-start justify-between gap-0 overflow-visible px-2 pt-4 pb-2">
                {data.lifecycle.map((step, index) => {
                    const Icon = ICON_MAP[step.label];
                    const isActive = step.active;
                    const isLast = index === data.lifecycle.length - 1;
                    const isCurrent = index === lastActiveIndex;
                    const color = VARIANT_COLORS[step.variant] || VARIANT_COLORS.neutral;
                    const nextActive = data.lifecycle[index + 1]?.active;

                    return (
                        <div
                            key={step.label}
                            className="flex flex-1 items-start"
                        // style={{ minWidth: 100 }}
                        >
                            {/* Step node */}
                            <div className="relative z-10 flex flex-col items-center gap-3"
                                style={{ width: 80 }}
                            >
                                {/* Glowing ring for current step */}
                                <div
                                    className="relative flex items-center justify-center rounded-full transition-all duration-500"
                                    style={{
                                        width: isCurrent ? 60 : 52,
                                        height: isCurrent ? 60 : 52,
                                        boxShadow: isCurrent
                                            ? `0 0 0 4px color-mix(in srgb, ${color} 18%, transparent), 0 8px 24px color-mix(in srgb, ${color} 30%, transparent)`
                                            : isActive
                                                ? `0 4px 12px color-mix(in srgb, ${color} 15%, transparent)`
                                                : "none",
                                    }}
                                >
                                    <IconWrapper
                                        icon={Icon}
                                        variant={isActive ? step.variant : "neutral"}
                                        sizeClassName={`${isCurrent ? "h-[60px] w-[60px]" : "h-[52px] w-[52px]"} shrink-0`}
                                        roundedClassName="rounded-full"
                                        iconSize={isCurrent ? 26 : 22}
                                        className={`transition-all duration-500 ${!isActive ? "opacity-35" : ""}`}
                                    />

                                    {/* Pulsing dot for current step */}
                                    {isCurrent && (
                                        <span
                                            className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-(--theme-surface)"
                                            style={{
                                                background: color,
                                                boxShadow: `0 0 10px ${color}`,
                                                animation: "pulse 2s infinite",
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Label */}
                                <span
                                    className={`text-center text-[11px] font-bold leading-tight transition-colors duration-300 ${isCurrent
                                        ? "text-(--theme-text-primary)"
                                        : isActive
                                            ? "text-(--theme-text-secondary)"
                                            : "text-(--theme-text-muted) opacity-50"
                                        }`}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {/* Connector line */}
                            {!isLast && (
                                <div className="relative mt-[24px] flex flex-1 items-center px-1">
                                    {/* Track background */}
                                    <div className="h-[3px] w-full rounded-full bg-(--theme-border) overflow-hidden">
                                        {/* Filled portion */}
                                        <div
                                            className="h-full rounded-full transition-all duration-700 ease-out"
                                            style={{
                                                width: isActive && nextActive ? "100%" : isActive ? "50%" : "0%",
                                                background: isActive
                                                    ? `linear-gradient(90deg, ${color}, ${nextActive ? (VARIANT_COLORS[data.lifecycle[index + 1].variant] || color) : color})`
                                                    : "transparent",
                                            }}
                                        />
                                    </div>

                                    {/* Animated dot on active connectors */}
                                    {isActive && isCurrent && (
                                        <div
                                            className="absolute h-2 w-2 rounded-full"
                                            style={{
                                                background: color,
                                                boxShadow: `0 0 8px ${color}`,
                                                left: "50%",
                                                top: "50%",
                                                transform: "translate(-50%, -50%)",
                                                animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

export default LifecycleCard;

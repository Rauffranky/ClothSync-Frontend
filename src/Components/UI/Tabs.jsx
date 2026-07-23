import Card from "./Card";

const Tabs = ({
    items = [],
    value,
    onChange,
    className = "",
    itemClassName = "",
    rounded = "14px",
}) => {
    return (
        <Card
            shadow="none"
            padding="10px"
            className={`${className}`}
        >
            {/* Mobile: horizontal scrollable flex — Desktop: equal-width grid */}
            <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div
                    className="flex gap-1.5 md:grid"
                    style={{
                        gridTemplateColumns: `repeat(${items.length || 1}, minmax(0, 1fr))`,
                    }}
                >
                    {items.map((item) => {
                        const isActive = item.value === value;

                        return (
                            <button
                                className={`flex shrink-0 min-h-11 items-center justify-center gap-2 px-3 text-sm font-bold transition-all duration-200 md:shrink ${itemClassName}`}
                                disabled={item.disabled}
                                key={item.value}
                                onClick={() => onChange?.(item.value)}
                                style={{
                                    border: "1px solid",
                                    borderRadius: rounded,
                                    color: isActive
                                        ? "var(--button-primary-text)"
                                        : "var(--theme-text-secondary)",
                                    background: isActive
                                        ? "var(--gradient-aurora-flow)"
                                        : "transparent",
                                    borderColor: isActive ? "transparent" : "transparent",
                                    boxShadow: isActive
                                        ? "0 12px 22px rgba(20, 184, 166, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.22)"
                                        : "none",
                                    cursor: item.disabled ? "not-allowed" : "pointer",
                                    opacity: item.disabled ? 0.58 : 1,
                                    whiteSpace: "nowrap",
                                }}
                                type="button"
                            >
                                {item.icon}
                                <span>{item.label}</span>
                                {item.count !== undefined && (
                                    <span
                                        className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-black"
                                        style={{
                                            color: isActive
                                                ? "var(--color-aurora-teal)"
                                                : "var(--theme-text-muted)",
                                            background: isActive
                                                ? "var(--button-primary-text)"
                                                : "var(--button-ghost-bg-hover)",
                                        }}
                                    >
                                        {item.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
};

export default Tabs;


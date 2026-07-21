const GroupedBarChart = ({
  ariaLabel,
  categories = [],
  maxValue = 100,
  series = [],
  ticks = [],
  valueSuffix = "",
}) => (
  <div>
    <div className="overflow-x-auto">
      <div
        aria-label={ariaLabel}
        className="min-w-140"
        role="img"
      >
        <div className="flex h-60">
          <div className="relative w-10 shrink-0">
            {ticks.map((tick) => (
              <span
                aria-hidden="true"
                className="absolute right-2 -translate-y-1/2 text-[10px] text-(--theme-text-muted)"
                key={tick}
                style={{ bottom: `${(tick / maxValue) * 100}%` }}
              >
                {tick}{valueSuffix}
              </span>
            ))}
          </div>

          <div className="relative flex-1 border-b border-(--theme-border-soft)">
            {ticks.map((tick) => (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 border-t border-dashed border-(--theme-border-soft)"
                key={tick}
                style={{ bottom: `${(tick / maxValue) * 100}%` }}
              />
            ))}

            <div className="absolute inset-0 flex items-end justify-around px-4">
              {categories.map((category) => (
                <div
                  className="flex h-full min-w-18 flex-1 items-end justify-center gap-1.5 px-2"
                  key={category.label}
                >
                  {series.map((item) => {
                    const value = Number(category.values[item.key]) || 0;

                    return (
                      <div
                        className="relative flex h-full w-full max-w-10 items-end"
                        key={item.key}
                        title={`${category.label} — ${item.label}: ${value}${valueSuffix}`}
                      >
                        <span
                          className="block w-full rounded-t-md opacity-90"
                          style={{
                            background: item.color,
                            height: `${Math.min((value / maxValue) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ml-10 flex justify-around px-4 pt-2">
          {categories.map((category) => (
            <span
              className="min-w-18 flex-1 px-2 text-center text-[10px] font-semibold text-(--theme-text-muted)"
              key={category.label}
            >
              {category.label}
            </span>
          ))}
        </div>
      </div>
    </div>

    <div className="mt-4 flex flex-wrap justify-center gap-4" aria-hidden="true">
      {series.map((item) => (
        <div
          className="flex items-center gap-1.5 text-[11px] font-semibold text-(--theme-text-secondary)"
          key={item.key}
        >
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: item.color }} />
          {item.label}
        </div>
      ))}
    </div>
  </div>
);

export default GroupedBarChart;

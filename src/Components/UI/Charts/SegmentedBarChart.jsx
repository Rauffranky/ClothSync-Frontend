const SegmentedBarChart = ({
  ariaLabel,
  data = [],
  heightClass = "h-2",
  showLegend = true,
  emptyText = "No chart data available",
}) => {
  const total = data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);

  if (!data.length || total <= 0) {
    return <p className="text-sm font-semibold text-(--theme-text-muted)">{emptyText}</p>;
  }

  return (
    <div role="img" aria-label={ariaLabel}>
      <div className={`flex w-full overflow-hidden rounded-full bg-(--theme-surface-strong) ${heightClass}`}>
        {data.map((item) => (
          <span
            key={item.label}
            aria-hidden="true"
            style={{ background: item.color, width: `${(item.value / total) * 100}%` }}
          />
        ))}
      </div>
      {showLegend && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1" aria-hidden="true">
          {data.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-xs font-semibold text-(--theme-text-muted)">
              <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SegmentedBarChart;

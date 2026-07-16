const TableSkeleton = ({
  rows = 6,
  columns = 5,
  showHeader = true,
  className = "",
}) => {
  const columnItems = Array.from({ length: columns });
  const rowItems = Array.from({ length: rows });

  return (
    <div className={`w-full overflow-hidden bg-(--theme-surface-solid) ${className}`}>
      {showHeader && (
        <div className="grid grid-cols-[repeat(var(--skeleton-columns),minmax(120px,1fr))] gap-4 border-b border-(--theme-border-soft) bg-(--theme-bg-soft) px-4 py-3">
          {columnItems.map((_, index) => (
            <div
              key={`header-${index}`}
              className="h-4 w-24 animate-pulse rounded-full bg-(--theme-border-soft)"
            />
          ))}
        </div>
      )}

      <div className="divide-y divide-(--theme-border-soft)">
        {rowItems.map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="grid grid-cols-[repeat(var(--skeleton-columns),minmax(120px,1fr))] gap-4 px-4 py-4"
          >
            {columnItems.map((__, columnIndex) => (
              <div
                key={`cell-${rowIndex}-${columnIndex}`}
                className={[
                  "h-4 animate-pulse rounded-full bg-(--theme-border-soft)",
                  columnIndex % 3 === 0
                    ? "w-28"
                    : columnIndex % 3 === 1
                      ? "w-20"
                      : "w-32",
                ].join(" ")}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableSkeleton;

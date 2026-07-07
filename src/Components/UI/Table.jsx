import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import TableSkeleton from "./TableSkeleton";

const getValue = (row, accessor) => {
  if (typeof accessor === "function") return accessor(row);
  if (!accessor) return undefined;

  return String(accessor)
    .split(".")
    .reduce((value, key) => value?.[key], row);
};

const alignClasses = {
  left: "text-left justify-start",
  center: "text-center justify-center",
  right: "text-right justify-end",
};

const Table = ({
  columns = [],
  data = [],
  rowKey = "id",
  loading = false,
  skeletonRows = 6,
  emptyText = "No records found",
  emptyState,
  actions,
  sortBy,
  sortDirection,
  onSort,
  onRowClick,
  className = "",
  tableClassName = "",
  headerClassName = "",
  rowClassName = "",
  cellClassName = "",
  compact = false,
}) => {
  const hasActions = Boolean(actions);
  const resolvedColumns =
    columns.length > 0
      ? columns
      : Object.keys(data[0] || {}).map((key) => ({
          key,
          label: key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (character) => character.toUpperCase()),
        }));
  const visibleColumns = resolvedColumns.filter((column) => column.hidden !== true);

  const getRowKey = (row, index) =>
    typeof rowKey === "function" ? rowKey(row, index) : row?.[rowKey] ?? index;

  const getSortDirection = (column) => {
    const sortKey = column.sortKey || column.accessor || column.key;
    return sortBy === sortKey ? sortDirection : undefined;
  };

  const renderSortIcon = (direction) => {
    if (direction === "asc") return <ArrowUp size={14} />;
    if (direction === "desc") return <ArrowDown size={14} />;
    return <ArrowUpDown size={14} />;
  };

  const handleSort = (column) => {
    if (!column.sortable || !onSort) return;

    const sortKey = column.sortKey || column.accessor || column.key;
    const currentDirection = getSortDirection(column);
    const nextDirection = currentDirection === "asc" ? "desc" : "asc";

    onSort(sortKey, nextDirection, column);
  };

  const renderCell = (row, column, rowIndex) => {
    const value = getValue(row, column.accessor || column.key);
    if (column.render) return column.render(value, row, rowIndex);
    return value ?? "-";
  };

  return (
    <div
      className={[
        "overflow-hidden rounded-2xl border border-(--theme-border) bg-(--theme-surface) shadow-(--layout-panel-shadow)",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="w-full overflow-x-auto">
        <table
          className={[
            "min-w-full border-separate border-spacing-0",
            tableClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {loading ? (
            <tbody>
              <tr>
                <td colSpan={visibleColumns.length + (hasActions ? 1 : 0)}>
                  <div style={{ "--skeleton-columns": visibleColumns.length + (hasActions ? 1 : 0) }}>
                    <TableSkeleton
                      rows={skeletonRows}
                      columns={visibleColumns.length + (hasActions ? 1 : 0)}
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            <>
              <thead>
                <tr className={["bg-(--button-ghost-bg)", headerClassName].filter(Boolean).join(" ")}>
                  {visibleColumns.map((column) => {
                    const direction = getSortDirection(column);
                    const alignClass = alignClasses[column.align || "left"];

                    return (
                      <th
                        key={column.key || column.accessor}
                        scope="col"
                        className="border-b border-(--theme-border) px-4 py-3 text-xs font-black uppercase tracking-wide whitespace-nowrap text-(--theme-text-muted)"
                        style={{ width: column.width }}
                      >
                        <button
                          type="button"
                          disabled={!column.sortable || !onSort}
                          onClick={() => handleSort(column)}
                          className={[
                            "flex w-full min-w-0 items-center gap-2 bg-transparent p-0 font-inherit text-inherit",
                            alignClass,
                            column.sortable && onSort
                              ? "cursor-pointer hover:text-(--theme-text-primary)"
                              : "cursor-default",
                          ].join(" ")}
                        >
                          <span className="whitespace-nowrap">{column.label}</span>
                          {column.sortable && onSort && (
                            <span className={direction ? "text-(--color-aurora-teal)" : ""}>
                              {renderSortIcon(direction)}
                            </span>
                          )}
                        </button>
                      </th>
                    );
                  })}

                  {hasActions && (
                    <th
                      scope="col"
                      className="border-b border-(--theme-border) px-4 py-3 text-right text-xs font-black uppercase tracking-wide whitespace-nowrap text-(--theme-text-muted)"
                    >
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              {data.length === 0 ? (
                <tbody>
                  <tr>
                    <td
                      className="px-4 py-12 text-center text-sm font-semibold text-(--theme-text-muted)"
                      colSpan={visibleColumns.length + (hasActions ? 1 : 0)}
                    >
                      {emptyState || emptyText}
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {data.map((row, rowIndex) => (
                    <tr
                      key={getRowKey(row, rowIndex)}
                      onClick={() => onRowClick?.(row, rowIndex)}
                      className={[
                        "group text-sm text-(--theme-text-secondary)",
                        onRowClick ? "cursor-pointer" : "",
                        typeof rowClassName === "function"
                          ? rowClassName(row, rowIndex)
                          : rowClassName,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {visibleColumns.map((column) => {
                        const alignClass = alignClasses[column.align || "left"];
                        const cellContent = renderCell(row, column, rowIndex);

                        return (
                          <td
                            key={column.key || column.accessor}
                            className={[
                              "border-b border-(--theme-border) px-4 whitespace-nowrap transition-colors group-hover:bg-[color-mix(in_srgb,var(--color-aurora-teal)_8%,transparent)]",
                              compact ? "py-2.5" : "py-3.5",
                              column.align === "right"
                                ? "text-right"
                                : column.align === "center"
                                  ? "text-center"
                                  : "text-left",
                              typeof cellClassName === "function"
                                ? cellClassName(row, column, rowIndex)
                                : cellClassName,
                              column.className,
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            {column.render ? (
                              <div
                                className={[
                                  "flex items-center whitespace-nowrap",
                                  alignClass,
                                ].join(" ")}
                              >
                                {cellContent}
                              </div>
                            ) : (
                              <span className="whitespace-nowrap">
                                {cellContent}
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {hasActions && (
                        <td className="border-b border-(--theme-border) px-4 py-3.5 text-right whitespace-nowrap transition-colors group-hover:bg-[color-mix(in_srgb,var(--color-aurora-teal)_8%,transparent)]">
                          {typeof actions === "function"
                            ? actions(row, rowIndex)
                            : actions}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              )}
            </>
          )}
        </table>
      </div>
    </div>
  );
};

export default Table;

import Card from "./Card";

const DEFAULT_LINE_WIDTHS = ["w-16", "w-28", "w-36"];

const CardSkeleton = ({
  lines = 3,
  showIcon = true,
  lineWidths = DEFAULT_LINE_WIDTHS,
  className = "",
  ...cardProps
}) => {
  const skeletonLines = Array.from({ length: lines });

  return (
    <Card
      aria-busy="true"
      aria-label="Loading card content"
      className={className}
      {...cardProps}
    >
      <div className="animate-pulse">
        {showIcon && (
          <div className="h-10 w-10 rounded-xl bg-(--theme-border-soft)" />
        )}

        <div className={showIcon ? "mt-4 space-y-2.5" : "space-y-2.5"}>
          {skeletonLines.map((_, index) => (
            <div
              className={`h-4 max-w-full rounded-full bg-(--theme-border-soft) ${lineWidths[index % lineWidths.length] || "w-full"}`}
              key={index}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};

export default CardSkeleton;

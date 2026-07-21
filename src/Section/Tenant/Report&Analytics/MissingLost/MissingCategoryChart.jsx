import { ChartCard } from "../../../../Components/UI/Charts";
import { missingByCategory } from "./data";

const MAX_VALUE = Math.max(...missingByCategory.map((item) => item.value), 1);

const MissingCategoryChart = () => (
  <ChartCard
    description="Breakdown of unresolved asset losses per category"
    title="Missing / Lost by Category"
  >
    <div
      aria-label="Missing or lost items by category: Bath Towels 4, Bed Linen 3, Uniforms 2, Pool Towels 2"
      className="space-y-4 py-2"
      role="img"
    >
      {missingByCategory.map((item) => (
        <div
          className="grid grid-cols-[88px_1fr_20px] items-center gap-3 text-xs"
          key={item.label}
        >
          <span className="text-right font-semibold text-(--theme-text-muted)">
            {item.label}
          </span>
          <div className="h-8 overflow-hidden rounded-r-md bg-(--theme-surface-strong)">
            <div
              className="h-full rounded-r-md bg-(--color-overdue)"
              style={{ width: `${(item.value / MAX_VALUE) * 100}%` }}
            />
          </div>
          <span className="font-black text-(--theme-text-secondary)">
            {item.value}
          </span>
        </div>
      ))}
      <div
        aria-hidden="true"
        className="ml-[100px] mr-8 flex justify-between border-t border-(--theme-border-soft) pt-2 text-[10px] text-(--theme-text-muted)"
      >
        {[0, 1, 2, 3, 4].map((tick) => <span key={tick}>{tick}</span>)}
      </div>
    </div>
  </ChartCard>
);

export default MissingCategoryChart;

import { ChartCard } from "../../../../Components/UI/Charts";
import ProgressBar from "../../../../Components/UI/ProgressBar";

const throughputData = [
  { label: "Grand Plaza", value: 800, color: "var(--color-sky-blue)" },
  { label: "CityCare", value: 500, color: "var(--color-aurora-purple)" },
  { label: "Royal Suites", value: 300, color: "var(--color-aurora-teal)" },
  { label: "Metro Textile", value: 900, color: "var(--color-sunset-orange)" },
];

const MAX = 1000;
const LABEL_W = 72; // px – left column width

const BusinessThroughput = () => {
  return (
    <ChartCard title="Business-Wise Throughput" subtitle="Items in laundry this week">
      <div className="mt-4 flex flex-col gap-1">
        {/* Chart area with dotted vertical gridlines */}
        <div className="relative">
          {/* Gridlines — positioned after label column */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0"
            style={{ left: LABEL_W + 16 }}
          >
            {[0, 25, 50, 75, 100].map((pct) => (
              <div
                key={pct}
                className="absolute inset-y-0 border-l border-dashed border-(--theme-border-soft)"
                style={{ left: `${pct}%` }}
              />
            ))}
          </div>

          {/* Rows */}
          <div className="relative z-10 flex flex-col gap-3.5 py-1">
            {throughputData.map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <span
                  className="shrink-0 text-right text-[11px] font-semibold leading-tight text-(--theme-text-muted)"
                  style={{ width: LABEL_W }}
                >
                  {item.label}
                </span>
                <div className="flex-1">
                  <ProgressBar
                    value={item.value}
                    max={MAX}
                    color={item.color}
                    heightClass="h-3"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* X-axis tick labels */}
        <div
          className="flex justify-between text-[10px] text-(--theme-text-muted)"
          style={{ paddingLeft: LABEL_W + 16 }}
        >
          {[0, 250, 500, 1000].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
    </ChartCard>
  );
};

export default BusinessThroughput;

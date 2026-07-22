import { ChartCard } from "../../../../Components/UI/Charts";
import ProgressBar from "../../../../Components/UI/ProgressBar";

const itemsByCategoryData = [
  { label: "Towels", value: 412, color: "var(--color-sky-blue)" },
  { label: "Bedsheets", value: 298, color: "var(--color-aurora-purple)" },
  { label: "Uniforms", value: 187, color: "var(--color-aurora-teal)" },
  { label: "Pillow Covers", value: 143, color: "var(--color-sunset-orange)" },
  { label: "Robes", value: 98, color: "var(--color-aurora-purple)" },
  { label: "Mats", value: 62, color: "var(--color-neon-cyan)" },
];

const ItemsByCategory = () => {
  return (
    <ChartCard title="Items by Category" subtitle="All businesses combined">
      <div className="mt-3 flex flex-col gap-3">
        {itemsByCategoryData.map((item) => (
          <div key={item.label} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-(--theme-text-muted)">{item.label}</span>
              <span className="text-xs font-black text-(--theme-text-primary)">{item.value}</span>
            </div>
            <ProgressBar
              value={item.value}
              max={450}
              color={item.color}
              heightClass="h-1.5"
            />
          </div>
        ))}
      </div>
    </ChartCard>
  );
};

export default ItemsByCategory;

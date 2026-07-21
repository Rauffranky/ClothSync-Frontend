import Card from "../../../../Components/UI/Card";
import { turnaroundStats } from "./data";

const TurnaroundStats = () => (
  <div className="grid gap-4 sm:grid-cols-3">
    {turnaroundStats.map((stat) => (
      <Card key={stat.id} padding="16px 20px">
        <p className="text-xs font-black uppercase tracking-wide text-(--theme-text-muted)">
          {stat.label}
        </p>
        <p className="mt-2 text-3xl font-black" style={{ color: stat.color }}>
          {stat.value}
        </p>
        <p className="mt-1 text-xs font-semibold text-(--theme-text-muted)">
          {stat.detail}
        </p>
      </Card>
    ))}
  </div>
);

export default TurnaroundStats;

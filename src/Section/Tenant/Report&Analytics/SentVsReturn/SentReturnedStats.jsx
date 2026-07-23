import { TrendingDown, TrendingUp } from "lucide-react";
import Card from "../../../../Components/UI/Card";
import { sentReturnedStats } from "./data";

const SentReturnedStats = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
    {sentReturnedStats.map((stat) => {
      const TrendIcon = stat.positive ? TrendingUp : TrendingDown;

      return (
        <Card key={stat.id} padding="16px 20px">
          <p className="text-xs font-bold uppercase tracking-wide text-(--theme-text-muted)">
            {stat.label}
          </p>
          <p className="mt-2 text-2xl font-bold" style={{ color: stat.color }}>
            {stat.value}
          </p>
          {/* <div
            className="mt-2 flex items-center gap-1 text-xs font-bold"
            style={{
              color: stat.positive
                ? "var(--color-seafoam)"
                : "var(--color-overdue)",
            }}
          >
            <TrendIcon aria-hidden="true" size={13} />
            <span>{stat.change}</span>
          </div> */}
        </Card>
      );
    })}
  </div>
);

export default SentReturnedStats;

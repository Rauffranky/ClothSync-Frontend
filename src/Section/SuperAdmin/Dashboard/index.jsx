import { LayoutGrid, Sparkles } from "lucide-react";
import Card from "../../../Components/UI/Card";
import IconWrapper from "../../../Components/UI/IconWrapper";

const Dashboard = () => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-(--theme-text-primary) md:text-3xl">
            Super Admin Dashboard
          </h1>
          <p className="text-sm font-medium text-(--theme-text-secondary)">
            System-wide platform overview, metrics, and administration.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-(--theme-text-muted)">
          <Sparkles size={15} className="text-(--color-aurora-teal)" />
          {currentDate}
        </div>
      </div>

      {/* Empty Dashboard State Card */}
      <Card className="flex flex-col items-center justify-center p-12 text-center md:p-20">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-(--theme-border) bg-(--theme-surface-hover) shadow-[0_12px_28px_rgba(20,184,166,0.12)]">
          <IconWrapper color="teal" size="lg">
            <LayoutGrid size={36} className="text-(--color-aurora-teal)" />
          </IconWrapper>
        </div>
        <h2 className="text-xl font-bold text-(--theme-text-primary)">
          Dashboard is currently empty
        </h2>
        <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-(--theme-text-secondary)">
          Global analytics, tenant health monitoring, and system metrics will be
          configured here. Use the navigation sidebar to manage system policies
          and terms.
        </p>
      </Card>
    </div>
  );
};

export default Dashboard;

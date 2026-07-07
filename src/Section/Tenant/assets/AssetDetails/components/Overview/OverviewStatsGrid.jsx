import { Building2, FileText, RefreshCw } from "lucide-react";
import OverviewStatCard from "./OverviewStatCard";

const OverviewStatsGrid = ({ data }) => {
  const stats = [
    {
      id: "wash-cycles",
      icon: RefreshCw,
      variant: "success",
      value: (
        <>
          {data.washCount}{" "}
          <span className="text-sm font-semibold text-(--theme-text-muted)">
            / {data.maxWash}
          </span>
        </>
      ),
      isMono: true,
      label: "Total Wash Cycles",
      subtext: `${Math.round((data.washCount / data.maxWash) * 100)}% of lifecycle used`,
    },
    {
      id: "assigned-laundry",
      icon: Building2,
      variant: "info",
      value: data.assignedLaundry,
      label: "Assigned Laundry",
      subtext: "Automatic dispatch mode",
    },
    {
      id: "current-batch",
      icon: FileText,
      variant: "purple",
      value: data.currentBatch.id,
      isMono: true,
      label: "Current Batch",
      subtext: `${data.currentBatch.status} - ${data.currentBatch.date}`,
    },
  ];

  return (
    <div className="grid gap-2 md:grid-cols-3">
      {stats.map((stat) => (
        <OverviewStatCard key={stat.id} stat={stat} />
      ))}
    </div>
  );
};

export default OverviewStatsGrid;

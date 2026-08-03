import {
  AlertTriangle,
  CheckCircle2,
  User,
  Zap,
} from "lucide-react";
import Badge from "../../../../../Components/UI/Badge";
import Card from "../../../../../Components/UI/Card";

const ActivityLogTab = ({ logs = [], batchId = "BATCH-1024" }) => {
  const getLogIcon = (type) => {
    switch (type) {
      case "system":
        return {
          icon: Zap,
          bgClass: "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
        };
      case "user":
        return {
          icon: User,
          bgClass: "bg-blue-100 text-blue-600 border-blue-400 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-700",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          bgClass: "bg-amber-100 text-amber-600 border-amber-400 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-700",
        };
      case "success":
      default:
        return {
          icon: CheckCircle2,
          bgClass: "bg-teal-100 text-teal-600 border-teal-400 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-700",
        };
    }
  };

  return (
    <Card className="p-6 mt-4 space-y-6" rounded="20px" >
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-(--theme-text-primary)">
          Activity Log
        </h3>
        <p className="text-xs font-semibold text-(--theme-text-secondary) mt-0.5">
          Full audit trail for {batchId}
        </p>
      </div>

      {/* Timeline List */}
      <div className="relative border-l-2 border-(--theme-border) ml-4 space-y-6 py-4">
        {logs.map((log) => {
          const { icon: LogIcon, bgClass } = getLogIcon(log.iconType);
          const isSystem = log.userType === "system";

          return (
            <div key={log.id} className="relative pl-7">
              {/* Timeline Dot Node */}
              <div className="absolute -left-[17px] top-0.5 bg-(--theme-surface) p-0.5 rounded-full">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${bgClass}`}
                >
                  <LogIcon size={14} strokeWidth={2.5} />
                </span>
              </div>

              {/* Log Item Content */}
              <div className="space-y-2">
                {/* Title */}
                <h4 className="text-sm font-bold text-(--theme-text-primary) leading-snug">
                  {log.event}
                </h4>

                {/* Actor & Timestamp Row */}
                <div className="flex items-center gap-2 text-xs font-medium text-(--theme-text-secondary)">
                  <Badge
                    variant={isSystem ? "neutral" : "info"}
                    size="sm"
                    className="font-bold"
                  >
                    {isSystem ? "⚡ System" : `👤 ${log.user}`}
                  </Badge>
                  <span>{log.timestamp}</span>
                </div>

                {/* Details Box */}
                {log.details && (
                  <div className="p-3 rounded-xl bg-(--theme-surface-strong) border border-(--theme-border) text-xs font-medium text-(--theme-text-secondary) max-w-2xl leading-relaxed">
                    {log.details}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ActivityLogTab;

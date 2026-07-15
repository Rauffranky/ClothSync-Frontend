import Card from "../../../../../Components/UI/Card";
import Badge from "../../../../../Components/UI/Badge";
import { activityLogs } from "../data";

const ActivityLogTab = () => {
  return (
    <div className="">
      <Card padding="24px" rounded="20px">
        <div className="relative border-l-2 border-(--theme-border) ml-6 space-y-8 py-2">
          {activityLogs.map((log, index) => {
            const Icon = log.icon;
            return (
              <div key={index} className="relative pl-8">
                {/* Timeline Dot/Icon */}
                <div className="absolute -left-[19px] top-0 bg-(--theme-surface) rounded-full p-1">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white ${log.variant === 'primary' ? 'border-blue-500 text-blue-500' :
                    log.variant === 'warning' ? 'border-yellow-500 text-yellow-500' :
                      log.variant === 'purple' ? 'border-purple-500 text-purple-500' :
                        log.variant === 'danger' ? 'border-red-500 text-red-500' :
                          'border-green-500 text-green-500'
                    }`}>
                    <Icon size={16} strokeWidth={3} />
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="m-0 text-base font-black text-(--theme-text-primary)">
                        {log.title}
                      </h4>
                      {log.badge && (
                        <Badge variant={log.variant} size="sm">
                          {log.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="m-0 mt-2 text-sm font-semibold text-(--theme-text-muted)">
                      {log.desc}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-(--theme-text-muted) whitespace-nowrap">
                    {log.date}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default ActivityLogTab;

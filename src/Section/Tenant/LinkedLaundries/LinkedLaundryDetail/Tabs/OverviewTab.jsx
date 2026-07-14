import { ChevronRight } from "lucide-react";
import Card from "../../../../../Components/UI/Card";
import Badge from "../../../../../Components/UI/Badge";
import Button from "../../../../../Components/UI/Button";
import IconWrapper from "../../../../../Components/UI/IconWrapper";
import { recentBatches, laundryDetails } from "../data";

const OverviewTab = () => {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_350px]">
      {/* Recent Batch Activity */}
      <Card padding="20px" rounded="16px">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="m-0 text-base font-black text-(--theme-text-primary)">
            Recent Batch Activity
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-500 font-bold hover:bg-blue-500/10"
            rightIcon={<ChevronRight size={14} />}
          >
            View All Batches
          </Button>
        </div>

        <div className="space-y-3">
          {recentBatches.map((batch) => {
            const Icon = batch.icon;
            return (
              <Card key={batch.id} padding="16px" rounded="12px" variant="bordered">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <IconWrapper
                      icon={Icon}
                      variant={batch.statusVariant}
                      sizeClassName="h-10 w-10 shrink-0"
                      roundedClassName="rounded-xl"
                      iconSize={18}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="m-0 font-black text-blue-500">{batch.id}</p>
                        <Badge variant={batch.statusVariant} size="sm" leftIcon={<Icon size={12} />}>
                          {batch.status}
                        </Badge>
                      </div>
                      <p className="m-0 mt-1 text-xs font-semibold text-(--theme-text-muted)">
                        {batch.date} <span className="mx-1">•</span> {batch.items} items
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {batch.delayed > 0 && (
                      <span className="text-sm font-bold text-orange-500">
                        {batch.delayed} delayed
                      </span>
                    )}
                    <Button variant="secondary" size="sm" leftIcon={<Icon size={14} />}>
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Performance Summary */}
      <div>
        <h3 className="m-0 mb-4 text-base font-black text-(--theme-text-primary)">
          Performance Summary — Last 30 Days
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Card padding="16px" rounded="12px">
            <p className="m-0 text-3xl font-black text-blue-500 text-center">
              {laundryDetails.performance.totalDispatched}
            </p>
            <p className="m-0 mt-1 text-xs font-bold text-(--theme-text-muted) text-center">
              Total Dispatched
            </p>
          </Card>

          <Card padding="16px" rounded="12px">
            <p className="m-0 text-3xl font-black text-green-500 text-center">
              {laundryDetails.performance.returnRate}
            </p>
            <p className="m-0 mt-1 text-xs font-bold text-(--theme-text-muted) text-center">
              Return Rate
            </p>
          </Card>

          <Card padding="16px" rounded="12px">
            <p className="m-0 text-3xl font-black text-orange-500 text-center">
              {laundryDetails.performance.delayedRate}
            </p>
            <p className="m-0 mt-1 text-xs font-bold text-(--theme-text-muted) text-center">
              Delayed Rate
            </p>
          </Card>

          <Card padding="16px" rounded="12px">
            <p className="m-0 text-3xl font-black text-blue-400 text-center">
              {laundryDetails.performance.avgTurnaround}
            </p>
            <p className="m-0 mt-1 text-xs font-bold text-(--theme-text-muted) text-center">
              Avg Turnaround
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;

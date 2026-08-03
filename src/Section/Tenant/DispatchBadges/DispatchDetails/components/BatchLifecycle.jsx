import { Check } from "lucide-react";
import Card from "../../../../../Components/UI/Card";

const BatchLifecycle = ({ steps = [] }) => {
  if (!steps || steps.length === 0) return null;

  return (
    <Card padding="20px 24px" rounded="20px">
      <div className="text-xs font-bold uppercase tracking-wider text-(--theme-text-secondary) mb-6">
        Batch Lifecycle
      </div>

      <div className="overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="min-w-[650px] relative flex items-center justify-between px-6">
          {/* Connector Line behind nodes */}
          <div className="absolute top-[17px] left-[40px] right-[40px] h-[2px] bg-teal-700/30 dark:bg-teal-800/40 -z-0">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${(steps.filter(
                  (s) => s.state === "completed" || s.state === "active",
                ).length -
                    1) *
                  (100 / (steps.length - 1))
                  }%`,
              }}
            />
          </div>

          {/* Lifecycle Steps */}
          {steps.map((step) => {
            const isCompleted = step.state === "completed";
            const isActive = step.state === "active";

            return (
              <div
                key={step.id}
                className="relative z-10 flex flex-col items-center text-center group min-w-[90px]"
              >
                {/* Node Icon */}
                <div className="mb-2">
                  {isCompleted && (
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md">
                      <Check size={16} strokeWidth={3} />
                    </div>
                  )}

                  {isActive && (
                    <div className="h-8 w-8 rounded-full bg-blue-600/15 border-2 border-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-4 ring-blue-500/10">
                      <div className="h-3.5 w-3.5 rounded-full bg-blue-600" />
                    </div>
                  )}

                  {!isCompleted && !isActive && (
                    <div className="h-8 w-8 rounded-full bg-teal-500/10 dark:bg-teal-950/30 border border-teal-600/40 dark:border-teal-700/40 flex items-center justify-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-teal-600/60 dark:bg-teal-600/70" />
                    </div>
                  )}
                </div>

                {/* Step Label */}
                <div
                  className={`text-xs font-bold leading-tight mb-0.5 ${isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : isCompleted
                        ? "text-(--theme-text-primary)"
                        : "text-(--theme-text-secondary)"
                    }`}
                >
                  {step.label}
                </div>

                {/* Step Time */}
                <div className="text-[11px] font-medium text-(--theme-text-secondary)">
                  {step.time}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default BatchLifecycle;

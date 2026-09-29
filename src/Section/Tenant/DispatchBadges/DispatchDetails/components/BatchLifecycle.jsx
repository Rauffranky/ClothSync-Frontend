import {
  ScanLine,
  Boxes,
  Truck,
  Shirt,
  Building2,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import Card from "../../../../../Components/UI/Card";
import IconWrapper from "../../../../../Components/UI/IconWrapper";

const ICON_MAP = {
  scanning: ScanLine,
  created: Boxes,
  batch_created: Boxes,
  dispatched: Truck,
  sent_to_laundry: Truck,
  in_laundry: Shirt,
  sent_to_business: Building2,
  returned: RotateCcw,
  completed: CheckCircle2,

  Scanning: ScanLine,
  "Batch Created": Boxes,
  Dispatched: Truck,
  "Sent to Laundry": Truck,
  "In Laundry": Shirt,
  "Sent to Business": Building2,
  "Sent To Business": Building2,
  Returned: RotateCcw,
  Completed: CheckCircle2,
};

const STEP_VARIANTS = {
  scanning: "teal",
  created: "info",
  batch_created: "info",
  dispatched: "warning",
  sent_to_laundry: "warning",
  in_laundry: "purple",
  sent_to_business: "info",
  returned: "success",
  completed: "success",

  Scanning: "teal",
  "Batch Created": "info",
  Dispatched: "warning",
  "Sent to Laundry": "warning",
  "In Laundry": "purple",
  "Sent to Business": "info",
  "Sent To Business": "info",
  Returned: "success",
  Completed: "success",
};

const VARIANT_COLORS = {
  success: "var(--color-ready)",
  warning: "var(--color-pending)",
  purple: "var(--color-super-admin-light)",
  info: "var(--color-sky-blue)",
  teal: "var(--color-aurora-teal)",
  neutral: "var(--color-cancelled)",
};

const BatchLifecycle = ({ steps = [] }) => {
  if (!steps || steps.length === 0) return null;

  // Determine active/current step index
  const activeIndex = steps.findIndex(
    (s) => s.state === "active" || s.active === true,
  );
  const lastCompletedIndex = steps.reduce(
    (acc, s, i) => (s.state === "completed" || s.completed ? i : acc),
    -1,
  );
  const currentIndex =
    activeIndex !== -1
      ? activeIndex
      : lastCompletedIndex !== -1
        ? lastCompletedIndex
        : 0;

  return (
    <Card padding="24px" rounded="20px">
      <h3 className="m-0 mb-6 text-xs font-bold uppercase tracking-widest text-(--theme-text-muted)">
        Batch Lifecycle
      </h3>

      <div className="overflow-x-auto pb-4 pt-2 scrollbar-none [&::-webkit-scrollbar]:hidden">
        <div className="min-w-170 relative flex items-start justify-between px-2">
          {steps.map((step, index) => {
            const Icon =
              ICON_MAP[step.id] ||
              ICON_MAP[step.label] ||
              ICON_MAP[step.key] ||
              CheckCircle2;

            const isLast = index === steps.length - 1;
            const isCurrent = index === currentIndex;
            const isPassed =
              index < currentIndex ||
              step.state === "completed" ||
              step.completed;
            const isStepActive = isPassed || isCurrent;

            const variant =
              step.variant ||
              STEP_VARIANTS[step.id] ||
              STEP_VARIANTS[step.label] ||
              "teal";
            const color = VARIANT_COLORS[variant] || VARIANT_COLORS.neutral;

            const nextStep = steps[index + 1];
            const nextVariant =
              nextStep?.variant ||
              STEP_VARIANTS[nextStep?.id] ||
              STEP_VARIANTS[nextStep?.label] ||
              "neutral";
            const nextColor =
              VARIANT_COLORS[nextVariant] || VARIANT_COLORS.neutral;
            const nextPassed =
              index + 1 < currentIndex ||
              nextStep?.state === "completed" ||
              nextStep?.completed;

            return (
              <div
                key={step.id || step.label || index}
                className="flex flex-1 items-start"
              >
                {/* Step node */}
                <div
                  className="relative z-10 flex flex-col items-center gap-3"
                  style={{ width: 88 }}
                >
                  {/* Glowing ring for current step */}
                  <div
                    className="relative flex items-center justify-center rounded-full transition-all duration-500"
                    style={{
                      width: isCurrent ? 60 : 52,
                      height: isCurrent ? 60 : 52,
                      boxShadow: isCurrent
                        ? `0 0 0 4px color-mix(in srgb, ${color} 18%, transparent), 0 8px 24px color-mix(in srgb, ${color} 30%, transparent)`
                        : isStepActive
                          ? `0 4px 12px color-mix(in srgb, ${color} 15%, transparent)`
                          : "none",
                    }}
                  >
                    <IconWrapper
                      icon={Icon}
                      variant={isStepActive ? variant : "neutral"}
                      sizeClassName={`${
                        isCurrent ? "h-[60px] w-[60px]" : "h-[52px] w-[52px]"
                      } shrink-0`}
                      roundedClassName="rounded-full"
                      iconSize={isCurrent ? 24 : 20}
                      className={`transition-all duration-500 ${
                        !isStepActive ? "opacity-35" : ""
                      }`}
                    />

                    {/* Pulsing dot for current step */}
                    {isCurrent && (
                      <span
                        className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-(--theme-surface)"
                        style={{
                          background: color,
                          boxShadow: `0 0 10px ${color}`,
                          animation: "pulse 2s infinite",
                        }}
                      />
                    )}
                  </div>

                  {/* Step Label & Time */}
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={`text-center text-[11px] font-bold leading-tight transition-colors duration-300 ${
                        isCurrent
                          ? "text-(--theme-text-primary)"
                          : isStepActive
                            ? "text-(--theme-text-secondary)"
                            : "text-(--theme-text-muted) opacity-50"
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="text-center text-[11px] font-medium text-(--theme-text-muted)">
                      {step.time && step.time !== "-" ? step.time : "—"}
                    </span>
                  </div>
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div className="relative mt-6.5 flex flex-1 items-center px-1">
                    {/* Track background */}
                    <div className="h-0.75 w-full rounded-full bg-(--theme-border) overflow-hidden">
                      {/* Filled portion */}
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width:
                            isPassed && nextPassed
                              ? "100%"
                              : isCurrent
                                ? "50%"
                                : "0%",
                          background: isPassed
                            ? `linear-gradient(90deg, ${color}, ${
                                nextPassed ? nextColor : color
                              })`
                            : isCurrent
                              ? color
                              : "transparent",
                        }}
                      />
                    </div>

                    {/* Animated glowing dot on active connector */}
                    {isCurrent && (
                      <div
                        className="absolute h-2 w-2 rounded-full"
                        style={{
                          background: color,
                          boxShadow: `0 0 8px ${color}`,
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                          animation:
                            "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default BatchLifecycle;

import { Box, LogIn, Truck } from "lucide-react";
import Card from "../../../Components/UI/Card";

const stages = [
  { id: "expected", label: "Expected Incoming", value: "4", color: "var(--theme-text-muted)", iconBg: "var(--theme-surface-strong)", iconColor: "var(--theme-text-muted)", Icon: Truck },
  { id: "checked-in", label: "Checked In", value: "142", color: "var(--color-sky-blue)", iconBg: "var(--color-sky-blue)", iconColor: "#fff", Icon: LogIn },
  { id: "sent", label: "Sent to Business", value: "1,003", color: "var(--color-super-admin-light)", iconBg: "var(--color-super-admin-light)", iconColor: "#fff", Icon: Box },
  { id: "returned", label: "Returned", value: "388", color: "var(--color-seafoam)", iconBg: "var(--color-seafoam)", iconColor: "#fff", Icon: Box },
];

const ProcessingLifecycle = () => (
  <Card padding="20px 24px">
    <div className="mb-8">
      <h2 className="text-base font-bold" style={{ color: "var(--theme-text-primary)" }}>
        Processing Lifecycle
      </h2>
      <p className="mt-0.5 text-xs" style={{ color: "var(--theme-text-muted)" }}>
        Real-time item flow across all stages
      </p>
    </div>

    <div className="flex items-center justify-between px-4 pb-4 sm:px-8">
      {stages.map((stage, i) => {
        const { Icon } = stage;
        return (
          <div key={stage.id} className="relative flex flex-1 flex-col items-center">
            {i !== stages.length - 1 && (
              <div className="absolute top-6 left-[60%] right-[-40%] z-0 hidden h-px sm:block" style={{ background: "var(--theme-border-soft)" }} />
            )}
            <div
              className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-full shadow-sm"
              style={{ background: stage.iconBg }}
            >
              <Icon size={20} style={{ color: stage.iconColor }} />
            </div>
            <span className="text-center text-xs font-bold" style={{ color: "var(--theme-text-primary)" }}>{stage.label}</span>
            <span className="mt-1 text-xl font-black" style={{ color: stage.color }}>{stage.value}</span>
          </div>
        );
      })}
    </div>
  </Card>
);
export default ProcessingLifecycle;

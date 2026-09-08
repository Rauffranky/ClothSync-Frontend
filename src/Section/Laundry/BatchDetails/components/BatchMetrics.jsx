import { AlertTriangle, Clock3, Package, PackageCheck } from "lucide-react";
import Card from "../../../../Components/UI/Card";

const BatchMetrics = ({ counters, batch, checkoutMode }) => {
  const total = counters?.totalCount ?? batch?.totalCount ?? batch?.total ?? 0;
  const received = counters?.receivedCount ?? batch?.receivedCount ?? batch?.checkedIn ?? 0;
  const missing = counters?.missingCount ?? batch?.missingCount ?? 0;
  const pending = counters?.pendingCount ?? batch?.pendingCount ?? 0;

  const cards = [
    {
      label: "Total Items",
      value: total,
      icon: Package,
      color: "var(--color-aurora-teal)",
      bg: "color-mix(in srgb, var(--color-aurora-teal) 10%, var(--theme-surface))",
    },
    {
      label: checkoutMode ? "Checked Out" : "Received",
      value: received,
      icon: PackageCheck,
      color: "var(--theme-accent, #10b981)",
      bg: "color-mix(in srgb, #10b981 10%, var(--theme-surface))",
    },
    {
      label: "Missing Items",
      value: missing,
      icon: AlertTriangle,
      color: "var(--color-overdue, #ef4444)",
      bg: "color-mix(in srgb, #ef4444 10%, var(--theme-surface))",
    },
    {
      label: "Pending Scan",
      value: pending,
      icon: Clock3,
      color: "var(--color-pending, #f59e0b)",
      bg: "color-mix(in srgb, #f59e0b 10%, var(--theme-surface))",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <Card key={label} padding="18px 20px" rounded="18px">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-(--theme-text-muted)">{label}</p>
              <p className="mt-1 text-2xl font-black text-(--theme-text-primary) sm:text-3xl">
                {value}
              </p>
            </div>
            <div
              className="grid h-12 w-12 place-items-center rounded-2xl"
              style={{ backgroundColor: bg, color }}
            >
              <Icon size={24} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default BatchMetrics;

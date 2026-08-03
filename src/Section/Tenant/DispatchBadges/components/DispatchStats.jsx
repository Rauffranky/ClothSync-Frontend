import {
  Layers,
  Truck,
  Building2,
  PackageCheck,
  AlertCircle,
} from "lucide-react";
import Card from "../../../../Components/UI/Card";
import IconWrapper from "../../../../Components/UI/IconWrapper";

const DispatchStats = ({ summary = {} }) => {
  const cards = [
    {
      id: "total",
      label: "Total Batches",
      value: summary.totalBatches ?? 0,
      icon: Layers,
      color: "var(--theme-text-primary)",
      iconVariant: "neutral",
    },
    {
      id: "sent",
      label: "Sent to laundry",
      value: summary.sentToLaundry ?? 0,
      icon: Truck,
      color: "var(--color-aurora-teal)",
      iconVariant: "teal",
    },
    {
      id: "in_laundry",
      label: "In Laundry",
      value: summary.inLaundry ?? 0,
      icon: Building2,
      color: "var(--color-purple-accent, #9333ea)",
      iconVariant: "purple",
    },
    {
      id: "returned",
      label: "Returned",
      value: summary.returned ?? 0,
      icon: PackageCheck,
      color: "var(--color-ready)",
      iconVariant: "success",
    },
    {
      id: "delayed",
      label: "Delayed",
      value: summary.delayed ?? 0,
      icon: AlertCircle,
      color: "var(--color-overdue)",
      iconVariant: "danger",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
      {cards.map((item) => (
        <Card
          key={item.id}
          className="transition-all duration-200 hover:-translate-y-0.5"
          padding="18px 20px"
        >
          <div className="flex flex-col gap-3">
            <IconWrapper
              icon={item.icon}
              variant={item.iconVariant}
              sizeClassName="h-10 w-10"
              iconSize={20}
              roundedClassName="rounded-xl"
            />
            <div>
              <div
                className="text-2xl font-bold leading-none tracking-tight mb-1"
                style={{ color: item.color }}
              >
                {item.value}
              </div>
              <div className="text-xs font-medium text-(--theme-text-secondary)">
                {item.label}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DispatchStats;

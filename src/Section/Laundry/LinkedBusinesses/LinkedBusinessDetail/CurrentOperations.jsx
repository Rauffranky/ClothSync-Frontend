import {
  Boxes,
  CircleAlert,
  CircleCheck,
  Clock3,
  Timer,
  Truck,
} from "lucide-react";
import Card from "../../../../Components/UI/Card";
import IconWrapper from "../../../../Components/UI/IconWrapper";
import { formatDateTime } from "../../../../Utils/date";

const operationItems = [
  {
    key: "incomingBatches",
    label: "Incoming Batches",
    icon: Truck,
    variant: "info",
  },
  {
    key: "itemsInLaundry",
    label: "Items In Laundry",
    icon: Boxes,
    variant: "purple",
  },
  {
    key: "sentToBusiness",
    label: "Sent To Business",
    icon: CircleCheck,
    variant: "success",
  },
  {
    key: "delayedItems",
    label: "Delayed Items",
    icon: Timer,
    variant: "warning",
  },
  {
    key: "openExceptions",
    label: "Open Exceptions",
    icon: CircleAlert,
    variant: "danger",
  },
  {
    key: "lastActivity",
    label: "Last Activity",
    icon: Clock3,
    variant: "neutral",
  },
];

const CurrentOperations = ({ business }) => {
  const values = {
    ...business,
    lastActivity:
      business.lastActivityLabel ||
      (business.lastActivityAt
        ? formatDateTime(business.lastActivityAt)
        : "-"),
  };

  return (
    <section aria-labelledby="current-operations-heading">
      <h2
        className="m-0 mb-4 text-sm font-black uppercase tracking-[0.14em] text-(--theme-text-muted)"
        id="current-operations-heading"
      >
        Current Operations
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {operationItems.map((item) => (
          <Card key={item.key} padding="20px" rounded="18px">
            <div className="flex items-center gap-4">
              <IconWrapper
                icon={item.icon}
                iconSize={20}
                roundedClassName="rounded-xl"
                sizeClassName="h-11 w-11 shrink-0"
                variant={item.variant}
              />
              <div className="min-w-0">
                <p className="m-0 wrap-break-word text-2xl font-black text-(--theme-text-primary)">
                  {values[item.key] ?? 0}
                </p>
                <p className="m-0 mt-1 text-sm font-semibold text-(--theme-text-muted)">
                  {item.label}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default CurrentOperations;

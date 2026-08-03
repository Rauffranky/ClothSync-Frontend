import { Link2, Plus, Scan, Unlink } from "lucide-react";
import Card from "../../../Components/UI/Card";
import CardSkeleton from "../../../Components/UI/CardSkeleton";
import IconWrapper from "../../../Components/UI/IconWrapper";

const summaryItems = [
  { key: "totalTags", label: "Total Tags", icon: Scan, variant: "primary" },
  {
    key: "existingLinked",
    label: "Existing Linked",
    icon: Link2,
    variant: "laundry",
  },
  { key: "newUnlinked", label: "New Unlinked", icon: Plus, variant: "laundry" },
  { key: "detached", label: "Detached", icon: Unlink, variant: "danger" },
];

const SummaryCards = ({ counts, loading = false }) => {
  if (loading && !counts) {
    return (
      <div className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-4">
        {summaryItems.map((item) => <CardSkeleton key={item.key} />)}
      </div>
    );
  }

  return (
    <div className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-4">
      {summaryItems.map(({ key, label, icon, variant }) => (
        <Card key={key} bodyClassName="flex items-center gap-4 py-4 px-5 h-full">
          <IconWrapper
            icon={icon}
            iconSize={24}
            roundedClassName="rounded-[12px]"
            sizeClassName="h-12 w-12 shrink-0"
            variant={variant}
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-2xl font-black leading-none text-(--theme-text-primary)">
              {counts?.[key] ?? 0}
            </h3>
            <p className="mt-1 text-sm font-bold leading-tight text-(--theme-text-secondary)">
              {label}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default SummaryCards;

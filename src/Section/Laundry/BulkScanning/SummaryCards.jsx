import { Building2, Link2, Plus, Scan } from "lucide-react";
import Card from "../../../Components/UI/Card";
import CardSkeleton from "../../../Components/UI/CardSkeleton";
import IconWrapper from "../../../Components/UI/IconWrapper";

const summaryItems = [
  { key: "totalTags", label: "Total Scanned Tags", icon: Scan, variant: "primary" },
  { key: "newUnlinked", label: "New Unlinked", icon: Plus, variant: "warning" },
  {
    key: "existingLinked",
    label: "Existing Linked",
    icon: Building2,
    variant: "info",
  },
  { key: "detached", label: "Detached", icon: Link2, variant: "success" },
];

const SummaryCards = ({ counts, loading = false }) => {
  if (loading && !counts) {
    return (
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {summaryItems.map((item) => (
          <CardSkeleton key={item.key} />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
      {summaryItems.map(({ key, label, icon, variant }) => (
        <Card key={key} padding="18px">
          <IconWrapper icon={icon} variant={variant} />
          <p className="m-0 mt-4 text-3xl font-black leading-none text-(--theme-text-primary)">
            {counts?.[key] ?? 0}
          </p>
          <p className="m-0 mt-2 text-sm font-medium leading-5 text-(--theme-text-primary)">
            {label}
          </p>
        </Card>
      ))}
    </div>
  );
};

export default SummaryCards;

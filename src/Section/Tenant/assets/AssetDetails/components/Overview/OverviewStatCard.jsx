import Card from "../../../../../../Components/UI/Card";
import IconWrapper from "../../../../../../Components/UI/IconWrapper";

const OverviewStatCard = ({ stat }) => {
  return (
    <Card bodyClassName="flex flex-col gap-4">
      <IconWrapper
        icon={stat.icon}
        variant={stat.variant}
        sizeClassName="h-8 w-8 rounded-lg"
        iconSize={16}
      />
      <div className="space-y-1">
        <div
          className={`text-lg font-black text-(--theme-text-primary) ${stat.isMono ? "font-mono" : ""}`}
        >
          {stat.value}
        </div>
        <div className="text-sm font-bold text-(--theme-text-primary)">
          {stat.label}
        </div>
        <div className="text-xs font-medium text-(--theme-text-muted)">
          {stat.subtext}
        </div>
      </div>
    </Card>
  );
};

export default OverviewStatCard;

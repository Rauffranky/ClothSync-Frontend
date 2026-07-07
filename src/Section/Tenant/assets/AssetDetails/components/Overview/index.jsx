import DescriptionCard from "./DescriptionCard";
import OverviewStatsGrid from "./OverviewStatsGrid";
import WashProgressCard from "./WashProgressCard";

const OverviewTab = ({ data }) => {
  return (
    <div className="space-y-4">
      <OverviewStatsGrid data={data} />
      <WashProgressCard data={data} />
      <DescriptionCard description={data.description} />
    </div>
  );
};

export default OverviewTab;

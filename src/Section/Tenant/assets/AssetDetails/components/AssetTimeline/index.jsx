import Card from "../../../../../../Components/UI/Card";
import TimelineEventCard from "./TimelineEventCard";

const AssetTimelineTab = ({ data }) => {
  return (
    <Card bodyClassName="space-y-5">
      {data.timeline.map((event, index) => (
        <TimelineEventCard
          event={event}
          isLast={index === data.timeline.length - 1}
          key={event.id}
        />
      ))}
    </Card>
  );
};

export default AssetTimelineTab;

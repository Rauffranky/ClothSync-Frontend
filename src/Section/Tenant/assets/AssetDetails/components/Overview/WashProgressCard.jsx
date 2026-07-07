import Card from "../../../../../../Components/UI/Card";
import ProgressBar from "../../../../../../Components/UI/ProgressBar";

const WashProgressCard = ({ data }) => {
  return (
    <Card bodyClassName="flex flex-col gap-4">
      <h3 className="m-0 text-xs font-bold uppercase tracking-wider text-(--theme-text-muted)">
        Wash Cycle Progress
      </h3>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <ProgressBar
            value={data.washCount}
            max={data.maxWash}
            variant="success"
            heightClass="h-3"
          />
        </div>
        <div className="font-mono text-sm font-bold text-(--theme-text-primary)">
          {data.washCount}{" "}
          <span className="text-xs font-semibold text-(--theme-text-muted)">
            / {data.maxWash}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default WashProgressCard;

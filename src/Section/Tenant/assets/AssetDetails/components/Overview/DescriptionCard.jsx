import Card from "../../../../../../Components/UI/Card";

const DescriptionCard = ({ description }) => {
  return (
    <Card bodyClassName="flex flex-col gap-4">
      <h3 className="m-0 text-xs font-bold uppercase tracking-wider text-(--theme-text-muted)">
        Description
      </h3>
      <p className="m-0 text-sm font-medium text-(--theme-text-primary)">
        {description}
      </p>
    </Card>
  );
};

export default DescriptionCard;

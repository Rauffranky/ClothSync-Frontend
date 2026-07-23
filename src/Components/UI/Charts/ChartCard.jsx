import Card from "../Card";

const ChartCard = ({
  title,
  description,
  children,
  className = "",
  contentClassName = "",
}) => (
  <Card
    as="section"
    className={`min-w-0 ${className}`}
  >
    {(title || description) && (
      <header className="mb-4">
        {title && (
          <h2 className="font-bold! text-(--theme-text-primary)">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-xs! text-(--theme-text-muted)">{description}</p>
        )}
      </header>
    )}
    <div className={contentClassName}>{children}</div>
  </Card>
);

export default ChartCard;

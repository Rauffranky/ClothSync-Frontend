import Card from "../Card";

const ChartCard = ({
  title,
  description,
  children,
  className = "",
  contentClassName = "",
  padding = "20px 24px",
}) => (
  <Card
    as="section"
    className={`min-w-0 ${className}`}
    padding={padding}
  >
    {(title || description) && (
      <header className="mb-4">
        {title && (
          <h2 className="text-base font-black text-(--theme-text-primary)">
            {title}
          </h2>
        )}
        {description && (
          <p className="mt-1 text-xs text-(--theme-text-muted)">{description}</p>
        )}
      </header>
    )}
    <div className={contentClassName}>{children}</div>
  </Card>
);

export default ChartCard;

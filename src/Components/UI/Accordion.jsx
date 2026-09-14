import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Card from "./Card";

/**
 * AccordionItem Component
 * Can be used inside <Accordion> or as a standalone collapsible card item.
 */
export const AccordionItem = ({
  id,
  isExpanded: controlledExpanded,
  defaultExpanded = false,
  onToggle,
  header,
  title,
  subtitle,
  icon,
  badges,
  actions,
  expandLabel = "Expand",
  collapseLabel = "Collapse",
  showActionLabels = true,
  children,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  disabled = false,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    if (disabled) return;
    if (!isControlled) {
      setInternalExpanded((prev) => !prev);
    }
    onToggle?.(id);
  };

  return (
    <Card
      className={`overflow-hidden transition-all duration-200 ${className}`}
      padding="0px"
    >
      {/* Header Button Trigger */}
      <button
        type="button"
        aria-expanded={isExpanded}
        disabled={disabled}
        onClick={handleToggle}
        className={`w-full cursor-pointer text-left p-5 md:p-6 transition-colors hover:bg-(--theme-surface-hover)/40 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${headerClassName}`}
        style={{
          borderBottom: isExpanded ? "1px solid var(--theme-border)" : "none",
        }}
      >
        {/* Custom Header Render Prop or Built-in Standard Header */}
        {typeof header === "function" ? (
          header({ isExpanded, toggle: handleToggle })
        ) : header ? (
          header
        ) : (
          <div className="flex items-start gap-3.5 min-w-0">
            {icon && (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--color-aurora-teal)/10 text-(--color-aurora-teal) shadow-sm">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {title && (
                  <h3 className="text-base font-bold text-(--theme-text-primary)">
                    {title}
                  </h3>
                )}
                {badges}
              </div>
              {subtitle && (
                <div className="mt-1 text-xs text-(--theme-text-secondary)">
                  {subtitle}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right side Actions / Indicator */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          {actions}
          {showActionLabels && (
            <span className="text-xs font-semibold text-(--color-aurora-teal)">
              {isExpanded ? collapseLabel : expandLabel}
            </span>
          )}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--theme-surface-strong) text-(--theme-text-secondary) transition-colors">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </button>

      {/* Accordion Content Body */}
      {isExpanded && (
        <div
          className={`p-5 md:p-6 space-y-5 bg-(--theme-surface)/50 ${bodyClassName}`}
        >
          {children}
        </div>
      )}
    </Card>
  );
};

/**
 * Generic Accordion Container Component
 * Supports item-list data driven usage or wrapping <AccordionItem> children.
 */
const Accordion = ({
  items = [],
  expandedIds = {},
  onToggle,
  allowMultiple = true,
  children,
  className = "space-y-4",
  itemClassName = "",
  emptyMessage = "No items available",
}) => {
  const [internalExpandedMap, setInternalExpandedMap] = useState({});
  const isControlled = onToggle !== undefined;

  const getIsExpanded = (id) => {
    if (isControlled) {
      if (Array.isArray(expandedIds)) return expandedIds.includes(id);
      return Boolean(expandedIds[id]);
    }
    return Boolean(internalExpandedMap[id]);
  };

  const handleToggle = (id) => {
    if (isControlled) {
      onToggle?.(id);
      return;
    }

    setInternalExpandedMap((prev) => {
      if (allowMultiple) {
        return { ...prev, [id]: !prev[id] };
      }
      return { [id]: !prev[id] };
    });
  };

  // If children are passed directly, render children wrapped in container
  if (children) {
    return <div className={className}>{children}</div>;
  }

  // If no items, show empty message
  if (!items || items.length === 0) {
    return (
      <Card className="flex items-center justify-center p-8 text-center text-sm text-(--theme-text-secondary)">
        {emptyMessage}
      </Card>
    );
  }

  // Data-driven list rendering
  return (
    <div className={className}>
      {items.map((item) => {
        const itemId = item.id || item._id || item.key;
        const isExpanded = getIsExpanded(itemId);

        return (
          <AccordionItem
            key={itemId}
            id={itemId}
            isExpanded={isExpanded}
            onToggle={() => handleToggle(itemId)}
            title={item.title}
            subtitle={item.subtitle}
            icon={item.icon}
            badges={item.badges}
            actions={item.actions}
            header={item.header}
            expandLabel={item.expandLabel}
            collapseLabel={item.collapseLabel}
            showActionLabels={item.showActionLabels}
            disabled={item.disabled}
            className={itemClassName || item.className}
            headerClassName={item.headerClassName}
            bodyClassName={item.bodyClassName}
          >
            {item.content || item.children}
          </AccordionItem>
        );
      })}
    </div>
  );
};

Accordion.Item = AccordionItem;

export default Accordion;

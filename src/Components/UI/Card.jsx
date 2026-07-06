const Card = ({
  as: Component = "div",
  children,
  border = "card-glass-border",
  rounded = "16px",
  bg = "card-glass-inner",
  shadow = "",
  padding = "15px 21px",
  bodyClassName = "",
  bodyStyle,
  className = "",
  style,
  ...rest
}) => {
  return (
    <Component
      className={`${border} ${shadow} ${className}`}
      style={{ borderRadius: rounded, ...style }}
      {...rest}
    >
      <div
        className={`${bg} ${bodyClassName}`}
        style={{ borderRadius: rounded, padding, ...bodyStyle }}
      >
        {children}
      </div>
    </Component>
  );
};

export default Card;

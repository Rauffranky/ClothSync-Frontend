import logoSvg from "../assets/logo.svg";

const Logo = ({
  width,
  height,
  className = "",
  style = {},
  alt = "ClothSync",
  onClick,
  ...props
}) => {
  return (
    <img
      src={logoSvg}
      alt={alt}
      className={`object-contain select-none transition-opacity ${className || "h-9 w-auto"}`}
      style={{
        ...(width ? { width } : {}),
        ...(height ? { height } : {}),
        ...style,
      }}
      onClick={onClick}
      {...props}
    />
  );
};

export default Logo;


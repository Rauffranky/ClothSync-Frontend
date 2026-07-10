const DEFAULT_DATE_FORMAT = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

export const formatDate = (
  value,
  options = DEFAULT_DATE_FORMAT,
  locale = "en-US",
  fallback = "-",
) => {
  if (!value) return fallback;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat(locale, options).format(date);
};

export default formatDate;

import { getAuthSessionUser } from "../axios/auth/authSession";

const DEFAULT_TIMEZONE = "UTC";
const DEFAULT_DATE_FORMAT = "MM/DD/YYYY";
const DEFAULT_INTL_DATE_OPTIONS = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

const SUPPORTED_DATE_FORMATS = new Set([
  "MM/DD/YYYY",
  "DD/MM/YYYY",
  "YYYY-MM-DD",
  "DD MMM YYYY",
  "MMM DD, YYYY",
  "MMMM DD, YYYY",
  "DD MMMM YYYY",
]);

export const getUserDatePreferences = () => {
  const user = getAuthSessionUser();

  return {
    timezone: user?.timezone || DEFAULT_TIMEZONE,
    dateFormat: user?.dateFormat || DEFAULT_DATE_FORMAT,
  };
};

const getValidDate = (value) => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getSafeTimezone = (timezone) => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format();
    return timezone;
  } catch {
    return DEFAULT_TIMEZONE;
  }
};

const getZonedDateParts = (date, timezone) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: timezone,
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return {
    day: values.day,
    month: values.month,
    year: values.year,
  };
};

const getMonthName = (date, timezone, length) =>
  new Intl.DateTimeFormat("en-US", {
    month: length,
    timeZone: timezone,
  }).format(date);

const formatConfiguredDate = (date, timezone, dateFormat) => {
  if (!SUPPORTED_DATE_FORMATS.has(dateFormat)) {
    return new Intl.DateTimeFormat("en-US", {
      ...DEFAULT_INTL_DATE_OPTIONS,
      timeZone: timezone,
    }).format(date);
  }

  const { day, month, year } = getZonedDateParts(date, timezone);
  const shortMonth = () => getMonthName(date, timezone, "short");
  const longMonth = () => getMonthName(date, timezone, "long");

  switch (dateFormat) {
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    case "DD MMM YYYY":
      return `${day} ${shortMonth()} ${year}`;
    case "MMM DD, YYYY":
      return `${shortMonth()} ${day}, ${year}`;
    case "MMMM DD, YYYY":
      return `${longMonth()} ${day}, ${year}`;
    case "DD MMMM YYYY":
      return `${day} ${longMonth()} ${year}`;
    case "MM/DD/YYYY":
    default:
      return `${month}/${day}/${year}`;
  }
};

export const formatDateWithUserPreferences = (
  value,
  timezone = null,
  dateFormat = null,
  fallback = "-",
) => {
  const date = getValidDate(value);
  if (!date) return value ? String(value) : fallback;

  const preferences = getUserDatePreferences();
  const finalTimezone = getSafeTimezone(timezone || preferences.timezone);
  const finalDateFormat = dateFormat || preferences.dateFormat;

  return formatConfiguredDate(date, finalTimezone, finalDateFormat);
};

/**
 * Generic formatter retained for places that intentionally provide their own
 * locale/options. Tenant portal dates should use the preference-aware helpers.
 */
export const formatDate = (
  value,
  options = DEFAULT_INTL_DATE_OPTIONS,
  locale = "en-US",
  fallback = "-",
) => {
  const date = getValidDate(value);
  if (!date) return value ? String(value) : fallback;

  return new Intl.DateTimeFormat(locale, options).format(date);
};

export const formatDateTime = (
  value,
  includeTime = true,
  includeSeconds = false,
  fallback = "-",
) => {
  const date = getValidDate(value);
  if (!date) return value ? String(value) : fallback;

  const { timezone, dateFormat } = getUserDatePreferences();
  const safeTimezone = getSafeTimezone(timezone);
  const formattedDate = formatConfiguredDate(date, safeTimezone, dateFormat);

  if (!includeTime) return formattedDate;

  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    ...(includeSeconds ? { second: "2-digit" } : {}),
    timeZone: safeTimezone,
  }).format(date);

  return `${formattedDate}, ${formattedTime}`;
};

export default formatDate;

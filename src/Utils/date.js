import { getTenantSessionUser } from "../axios/auth/tenantSession";

const DEFAULT_DATE_FORMAT = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

// Map custom dateFormat strings to Intl.DateTimeFormat options
const DATE_FORMAT_MAP = {
  "MM/DD/YYYY": { month: "2-digit", day: "2-digit", year: "numeric" },
  "DD/MM/YYYY": { day: "2-digit", month: "2-digit", year: "numeric" },
  "YYYY-MM-DD": { year: "numeric", month: "2-digit", day: "2-digit" },
  "DD MMM YYYY": { day: "numeric", month: "short", year: "numeric" },
  "MMM DD, YYYY": { month: "short", day: "numeric", year: "numeric" },
  "MMMM DD, YYYY": { month: "long", day: "numeric", year: "numeric" },
  "DD MMMM YYYY": { day: "numeric", month: "long", year: "numeric" },
};

/**
 * Get user's date format preferences from session storage
 * @returns {{ timezone: string, dateFormat: string }}
 */
const getUserDatePreferences = () => {
  const user = getTenantSessionUser();
  return {
    timezone: user?.timezone || "UTC",
    dateFormat: user?.dateFormat || "MM/DD/YYYY",
  };
};

/**
 * Convert UTC date to user's timezone and format according to user's preference
 * @param {string|Date} value - UTC date string or Date object
 * @param {string} timezone - Optional timezone override. Defaults to user's timezone
 * @param {string} dateFormat - Optional dateFormat override. Defaults to user's dateFormat
 * @param {string} fallback - Fallback value if date is invalid
 * @returns {string} Formatted date in user's timezone
 */
export const formatDateWithUserPreferences = (
  value,
  timezone = null,
  dateFormat = null,
  fallback = "-",
) => {
  if (!value) return fallback;

  const { timezone: userTimezone, dateFormat: userDateFormat } = getUserDatePreferences();
  const finalTimezone = timezone || userTimezone;
  const finalDateFormat = dateFormat || userDateFormat;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  // Get format options from map, default to a sensible format
  const formatOptions = DATE_FORMAT_MAP[finalDateFormat] || DEFAULT_DATE_FORMAT;

  // Add timezone to options
  const optionsWithTimezone = {
    ...formatOptions,
    timeZone: finalTimezone,
  };

  return new Intl.DateTimeFormat("en-US", optionsWithTimezone).format(date);
};

/**
 * Format date with optional timezone conversion (original function, preserved for backwards compatibility)
 * Use formatDateWithUserPreferences for user-aware formatting
 * @param {string|Date} value - Date string or Date object
 * @param {Object} options - Intl.DateTimeFormat options
 * @param {string} locale - Locale string
 * @param {string} fallback - Fallback value if date is invalid
 * @returns {string} Formatted date
 */
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

/**
 * Format date and time with user's timezone and preferences
 * @param {string|Date} value - UTC date/time string or Date object
 * @param {boolean} includeTime - Whether to include time in output
 * @param {boolean} includeSeconds - Whether to include seconds in time
 * @returns {string} Formatted date and optional time
 */
export const formatDateTime = (
  value,
  includeTime = true,
  includeSeconds = false,
  fallback = "-",
) => {
  if (!value) return fallback;

  const { timezone, dateFormat } = getUserDatePreferences();
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  const dateFormatOptions = DATE_FORMAT_MAP[dateFormat] || DEFAULT_DATE_FORMAT;

  const options = {
    ...dateFormatOptions,
    timeZone: timezone,
    ...(includeTime && {
      hour: "2-digit",
      minute: "2-digit",
      ...(includeSeconds && { second: "2-digit" }),
    }),
  };

  return new Intl.DateTimeFormat("en-US", options).format(date);
};

export default formatDate;

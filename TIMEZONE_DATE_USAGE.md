/**
 * Timezone and Date Format Conversion - Usage Guide
 * 
 * This guide demonstrates how to use the new timezone-aware date formatting
 * throughout the application.
 */

// ============================================================
// 1. IN COMPONENTS (WITH HOOKS)
// ============================================================

// Option A: Using the hook to get preferences
import { useUserDatePreferences } from "../Hooks/useUserDatePreferences";
import { formatDateWithUserPreferences } from "../Utils/date";

function MyComponent() {
  const { timezone, dateFormat } = useUserDatePreferences();
  
  // Automatically uses user's timezone and dateFormat
  const displayDate = formatDateWithUserPreferences("2026-07-14T10:06:16.000Z");
  
  return <div>{displayDate}</div>; // Example: "07/14/2026" (depends on user's dateFormat)
}

// ============================================================
// 2. DIRECT FUNCTION USAGE (WITH AUTOMATIC PREFERENCES)
// ============================================================

import { formatDateWithUserPreferences, formatDateTime } from "../Utils/date";

// Format date only (auto-uses user's timezone & dateFormat)
const linkedDate = formatDateWithUserPreferences(record.linkedAt);
// Result: "07/14/2026" (if user's format is MM/DD/YYYY)

// Format date with time (auto-uses user's timezone & dateFormat)
const createdWithTime = formatDateTime(record.createdAt, true, false);
// Result: "07/14/2026, 03:06 PM" (includes time in user's timezone)

// ============================================================
// 3. OVERRIDE USER PREFERENCES (IF NEEDED)
// ============================================================

// Force a specific timezone
const karmachiTime = formatDateWithUserPreferences(
  "2026-07-14T10:06:16.000Z",
  "Asia/Karachi"
);

// Force a specific dateFormat
const ddmmyyyyFormat = formatDateWithUserPreferences(
  "2026-07-14T10:06:16.000Z",
  null, // Use user's timezone
  "DD/MM/YYYY"
);

// Force both
const customFormat = formatDateWithUserPreferences(
  "2026-07-14T10:06:16.000Z",
  "America/New_York",
  "MMMM DD, YYYY"
);
// Result: "July 14, 2026"

// ============================================================
// 4. REAL-WORLD EXAMPLES FROM THE CODEBASE
// ============================================================

// Example 1: In LinkedLaundryDetail component
linkedSince: rawData?.createdAt 
  ? formatDateWithUserPreferences(rawData.createdAt) 
  : prev.contact.linkedSince

// Example 2: In Categories table normalization
created: formatDateWithUserPreferences(category.createdAt || category.created),
updated: formatDateWithUserPreferences(category.updatedAt || category.lastUpdated),

// Example 3: In pending invites table
{
  key: "sentAt",
  label: "Sent On",
  render: (value) => (
    <span>{value ? formatDateWithUserPreferences(value) : "-"}</span>
  ),
}

// ============================================================
// 5. SUPPORTED DATE FORMATS
// ============================================================

const SUPPORTED_FORMATS = [
  "MM/DD/YYYY",      // 07/14/2026
  "DD/MM/YYYY",      // 14/07/2026
  "YYYY-MM-DD",      // 2026-07-14
  "DD MMM YYYY",     // 14 Jul 2026
  "MMM DD, YYYY",    // Jul 14, 2026
  "MMMM DD, YYYY",   // July 14, 2026
  "DD MMMM YYYY",    // 14 July 2026
];

// ============================================================
// 6. USER PREFERENCES (FROM LOGIN)
// ============================================================

// User profile after login contains:
const userProfile = {
  timezone: "Asia/Karachi",    // IANA timezone identifier
  dateFormat: "DD/MM/YYYY",    // One of the supported formats
  // ... other user fields
};

// These are automatically retrieved from sessionStorage by:
// - formatDateWithUserPreferences()
// - useUserDatePreferences() hook
// - getTenantSessionUser() (from tenantSession.js)

// ============================================================
// 7. TIMEZONE EXAMPLES (COMMON ZONES)
// ============================================================

const COMMON_TIMEZONES = [
  "Asia/Karachi",          // Pakistan
  "Asia/Dubai",            // UAE
  "Europe/London",         // UK
  "Europe/Paris",          // France/Europe
  "America/New_York",      // US East Coast
  "America/Chicago",       // US Central
  "America/Los_Angeles",   // US West Coast
  "Australia/Sydney",      // Australia
  "Asia/Singapore",        // Singapore
  "Asia/Tokyo",            // Japan
  "UTC",                   // UTC/Zulu time
];

// ============================================================
// 8. MIGRATION GUIDE: FROM OLD formatDate() TO NEW
// ============================================================

// OLD (still works, but doesn't respect user preferences):
import { formatDate } from "../Utils/date";
const oldWay = formatDate(someDate);

// NEW (respects user's timezone and dateFormat):
import { formatDateWithUserPreferences } from "../Utils/date";
const newWay = formatDateWithUserPreferences(someDate);

// If custom Intl options are needed, use original formatDate():
const customWay = formatDate(someDate, {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

// ============================================================
// IMPORTANT NOTES:
// ============================================================
// 
// 1. All dates from API should be in UTC ISO format (e.g., "2026-07-14T10:06:16.000Z")
// 2. The conversion happens CLIENT-SIDE using browser's Intl API
// 3. No additional dependencies required (uses native JS Intl API)
// 4. Invalid dates return "-" by default
// 5. User preferences come from sessionStorage (set during login)
// 6. Timezone defaults to "UTC" if user doesn't have one set
// 7. DateFormat defaults to "MM/DD/YYYY" if user doesn't have one set

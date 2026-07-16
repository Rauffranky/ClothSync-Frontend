import {
  Bell,
  Settings as SettingsIcon,
  Shield,
} from "lucide-react";

export const settingsTabs = [
  { value: "general", label: "General", icon: SettingsIcon },
  { value: "notifications", label: "Notifications", icon: Bell },
  { value: "security", label: "Security", icon: Shield },
];

export const languageOptions = [
  { label: "English", value: "en" },
  { label: "Arabic", value: "ar" },
];

const unwrapData = (response) => response?.data ?? response;

const getCollection = (response, keys) => {
  const payload = unwrapData(response);
  if (Array.isArray(payload)) return payload;

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }

  return [];
};

const normalizeOption = (item, valueKeys) => {
  if (typeof item === "string") return { label: item, value: item };

  const value = valueKeys.map((key) => item?.[key]).find(Boolean);
  if (!value) return null;

  const label =
    item.label || item.displayName || item.formatted || item.name || String(value);

  return {
    label,
    searchLabel: Object.values(item).filter(Boolean).join(" "),
    value,
  };
};

export const getTimeZoneOptions = (response) =>
  getCollection(response, ["timezones", "timeZones", "items"])
    .map((item) => normalizeOption(item, ["value", "timezone", "timeZone", "name", "id"]))
    .filter(Boolean);

export const getDateFormatOptions = (response) =>
  getCollection(response, ["dateFormats", "formats", "items"])
    .map((item) => normalizeOption(item, ["value", "format", "name", "id"]))
    .filter(Boolean);

export const getSettingsProfile = (response) => {
  const payload = unwrapData(response);
  return payload?.profile || payload || null;
};

export const getNotificationPreferences = (response) => {
  const payload = unwrapData(response);
  const preferences = Array.isArray(payload)
    ? payload
    : payload?.preferences || payload?.items || [];

  if (!Array.isArray(preferences)) return [];

  return preferences
    .filter((preference) => preference?.notificationKey)
    .map((preference) => ({
      id: preference.id || preference.notificationKey,
      notificationKey: preference.notificationKey,
      title:
        preference.title ||
        String(preference.notificationKey)
          .replace(/_/g, " ")
          .replace(/\b\w/g, (character) => character.toUpperCase()),
      description: preference.description || "",
      inAppEnabled: Boolean(preference.inAppEnabled),
      emailEnabled: Boolean(preference.emailEnabled),
      sortOrder: Number(preference.sortOrder) || 0,
    }))
    .sort((first, second) => first.sortOrder - second.sortOrder);
};

export const getUploadedFileValue = (response) => {
  const payload = unwrapData(response);
  if (typeof payload === "string") return payload;

  const directValue =
    payload?.url ||
    payload?.fileUrl ||
    payload?.path ||
    payload?.location ||
    (typeof payload?.file === "string" ? payload.file : null);

  if (directValue) return directValue;

  const nestedFile = payload?.file;
  const nestedValue =
    nestedFile?.url || nestedFile?.fileUrl || nestedFile?.path || nestedFile?.location;
  if (nestedValue) return nestedValue;

  const firstFile = payload?.files?.[0];
  if (typeof firstFile === "string") return firstFile;

  return firstFile?.url || firstFile?.fileUrl || firstFile?.path || null;
};

export const getCurrentDeviceName = () => {
  const userAgent = navigator.userAgent;
  const browser = userAgent.includes("Edg/")
    ? "Edge"
    : userAgent.includes("Firefox/")
      ? "Firefox"
      : userAgent.includes("Chrome/")
        ? "Chrome"
        : userAgent.includes("Safari/")
          ? "Safari"
          : "Current browser";
  const platform = userAgent.includes("Windows")
    ? "Windows"
    : userAgent.includes("Mac OS")
      ? "macOS"
      : userAgent.includes("Android")
        ? "Android"
        : userAgent.includes("iPhone") || userAgent.includes("iPad")
          ? "iOS"
          : "Device";

  return `${browser} — ${platform}`;
};

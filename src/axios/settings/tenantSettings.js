import api from "../api";
import { TENANT_SETTINGS_ENDPOINTS } from "../endpoint";

export const getTenantSettingsTimeZones = () =>
  api.get(TENANT_SETTINGS_ENDPOINTS.TIMEZONES);

export const getTenantSettingsDateFormats = () =>
  api.get(TENANT_SETTINGS_ENDPOINTS.DATE_FORMATS);

export const getTenantSettingsProfile = () =>
  api.get(TENANT_SETTINGS_ENDPOINTS.PROFILE);

export const updateTenantSettingsProfile = (data) =>
  api.put(TENANT_SETTINGS_ENDPOINTS.PROFILE, data);

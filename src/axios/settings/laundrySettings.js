import api from "../api";
import { LAUNDRY_SETTINGS_ENDPOINTS } from "../endpoint";

export const getLaundrySettingsTimeZones = () =>
  api.get(LAUNDRY_SETTINGS_ENDPOINTS.TIMEZONES);

export const getLaundrySettingsDateFormats = () =>
  api.get(LAUNDRY_SETTINGS_ENDPOINTS.DATE_FORMATS);

export const getLaundrySettingsProfile = () =>
  api.get(LAUNDRY_SETTINGS_ENDPOINTS.PROFILE);

export const updateLaundrySettingsProfile = (data) =>
  api.put(LAUNDRY_SETTINGS_ENDPOINTS.PROFILE, data);

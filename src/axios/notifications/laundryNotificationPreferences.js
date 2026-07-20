import api from "../api";
import { LAUNDRY_NOTIFICATION_PREFERENCE_ENDPOINTS } from "../endpoint";

export const getLaundryNotificationPreferences = () =>
  api.get(LAUNDRY_NOTIFICATION_PREFERENCE_ENDPOINTS.SHOW);

export const updateLaundryNotificationPreferences = (preferences) =>
  api.put(LAUNDRY_NOTIFICATION_PREFERENCE_ENDPOINTS.UPDATE, { preferences });

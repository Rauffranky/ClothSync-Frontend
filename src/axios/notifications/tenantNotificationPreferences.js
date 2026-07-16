import api from "../api";
import { TENANT_NOTIFICATION_PREFERENCE_ENDPOINTS } from "../endpoint";

export const getTenantNotificationPreferences = () =>
  api.get(TENANT_NOTIFICATION_PREFERENCE_ENDPOINTS.SHOW);

export const updateTenantNotificationPreferences = (preferences) =>
  api.put(TENANT_NOTIFICATION_PREFERENCE_ENDPOINTS.UPDATE, { preferences });

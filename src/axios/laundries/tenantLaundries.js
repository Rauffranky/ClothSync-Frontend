import api from "../api";
import { TENANT_LAUNDRY_ENDPOINTS } from "../endpoint";

export const getTenantLaundries = (params) =>
  api.get(TENANT_LAUNDRY_ENDPOINTS.LIST, { params });

export const getPendingTenantLaundryInvites = (params) =>
  api.get(TENANT_LAUNDRY_ENDPOINTS.PENDING_INVITES, { params });

import api from "../api";
import { LAUNDRY_TENANT_ENDPOINTS } from "../endpoint";

export const getLaundryTenants = (params) =>
  api.get(LAUNDRY_TENANT_ENDPOINTS.LIST, {
    params,
    timeout: 15000,
  });

export const getLaundryTenantDetails = (id) =>
  api.get(LAUNDRY_TENANT_ENDPOINTS.DETAILS(id), {
    timeout: 15000,
  });

export const getLaundryTenantPendingRequests = (params) =>
  api.get(LAUNDRY_TENANT_ENDPOINTS.PENDING_REQUESTS, {
    params,
    timeout: 15000,
  });

export const acceptLaundryTenantRequest = (id) =>
  api.put(LAUNDRY_TENANT_ENDPOINTS.ACCEPT_REQUEST(id));

export const rejectLaundryTenantRequest = (id, rejectionReason = "") =>
  api.put(LAUNDRY_TENANT_ENDPOINTS.REJECT_REQUEST(id), {
    rejectionReason: rejectionReason.trim() || null,
  });

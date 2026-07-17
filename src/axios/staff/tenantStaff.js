import api from "../api";
import { TENANT_STAFF_ENDPOINTS } from "../endpoint";

export const createTenantStaff = (payload) =>
  api.post(TENANT_STAFF_ENDPOINTS.CREATE, payload, { timeout: 15000 });

export const getTenantStaff = (params = {}) =>
  api.get(TENANT_STAFF_ENDPOINTS.LIST, { params, timeout: 15000 });

export const getTenantStaffDetails = (id) =>
  api.get(TENANT_STAFF_ENDPOINTS.DETAILS(id), { timeout: 15000 });

export const updateTenantStaff = (id, payload) =>
  api.put(TENANT_STAFF_ENDPOINTS.UPDATE(id), payload, { timeout: 15000 });

export const updateTenantStaffStatus = (id, status) =>
  api.put(
    TENANT_STAFF_ENDPOINTS.UPDATE_STATUS(id),
    { status },
    { timeout: 15000 },
  );

export const verifyTenantStaffEmail = (token) =>
  api.get(TENANT_STAFF_ENDPOINTS.VERIFY_EMAIL, {
    params: { token },
    timeout: 15000,
  });

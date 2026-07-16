import api from "../api";
import {
  TENANT_ACCESS_SECTION_ENDPOINTS,
  TENANT_STAFF_ROLE_ENDPOINTS,
} from "../endpoint";

export const createTenantStaffRole = (payload) =>
  api.post(TENANT_STAFF_ROLE_ENDPOINTS.CREATE, payload, { timeout: 15000 });

export const getTenantStaffRoles = (params = {}) =>
  api.get(TENANT_STAFF_ROLE_ENDPOINTS.LIST, { params, timeout: 15000 });

export const getTenantStaffRoleDetails = (id) =>
  api.get(TENANT_STAFF_ROLE_ENDPOINTS.DETAILS(id), { timeout: 15000 });

export const getTenantStaffRoleSummary = () =>
  api.get(TENANT_STAFF_ROLE_ENDPOINTS.SUMMARY, { timeout: 15000 });

export const updateTenantStaffRole = (id, payload) =>
  api.put(TENANT_STAFF_ROLE_ENDPOINTS.UPDATE(id), payload, {
    timeout: 15000,
  });

export const updateTenantStaffRoleStatus = (id, status) =>
  api.put(
    TENANT_STAFF_ROLE_ENDPOINTS.UPDATE_STATUS(id),
    { status },
    { timeout: 15000 },
  );

export const getTenantAccessSections = () =>
  api.get(TENANT_ACCESS_SECTION_ENDPOINTS.LIST, { timeout: 15000 });

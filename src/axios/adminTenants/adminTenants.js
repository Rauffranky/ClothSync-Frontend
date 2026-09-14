import api from "../api";
import { ADMIN_TENANT_ENDPOINTS } from "../endpoint";

export const getAdminTenants = (params, language = "en") =>
  api.get(ADMIN_TENANT_ENDPOINTS.LIST, {
    params,
    headers: { "x-language": language },
  });

export const getAdminTenantDetails = (id, language = "en") =>
  api.get(ADMIN_TENANT_ENDPOINTS.DETAILS(id), {
    headers: { "x-language": language },
  });

export const createAdminTenant = (data, language = "en") =>
  api.post(ADMIN_TENANT_ENDPOINTS.CREATE, data, {
    headers: { "x-language": language },
  });

export const updateAdminTenant = (id, data, language = "en") =>
  api.put(ADMIN_TENANT_ENDPOINTS.UPDATE(id), data, {
    headers: { "x-language": language },
  });

export const updateAdminTenantStatus = (id, status, language = "en") =>
  api.put(
    ADMIN_TENANT_ENDPOINTS.UPDATE_STATUS(id),
    { status },
    { headers: { "x-language": language } },
  );

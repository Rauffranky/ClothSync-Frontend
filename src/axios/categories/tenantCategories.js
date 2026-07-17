import api from "../api";
import { TENANT_CATEGORY_ENDPOINTS } from "../endpoint";

export const getTenantCategories = (params, language = "en") =>
  api.get(TENANT_CATEGORY_ENDPOINTS.LIST, {
    params,
    headers: { "x-language": language },
  });

export const createTenantCategory = (data, language = "en") =>
  api.post(TENANT_CATEGORY_ENDPOINTS.CREATE, data, {
    headers: { "x-language": language },
  });

export const getTenantCategoryDetails = (id, language = "en") =>
  api.get(TENANT_CATEGORY_ENDPOINTS.DETAILS(id), {
    headers: { "x-language": language },
  });

export const updateTenantCategory = (id, data, language = "en") =>
  api.put(TENANT_CATEGORY_ENDPOINTS.UPDATE(id), data, {
    headers: { "x-language": language },
  });

export const updateTenantCategoryStatus = (id, status, language = "en") =>
  api.put(
    TENANT_CATEGORY_ENDPOINTS.UPDATE_STATUS(id),
    { status },
    { headers: { "x-language": language } },
  );

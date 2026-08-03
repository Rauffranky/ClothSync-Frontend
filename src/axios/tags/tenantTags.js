import api from "../api";
import { TENANT_TAG_ENDPOINTS } from "../endpoint";

export const getTenantTags = (params, language = "en") =>
  api.get(TENANT_TAG_ENDPOINTS.LIST, {
    params,
    headers: { "x-language": language },
  });

export const getTenantTagDetails = (id, language = "en") =>
  api
    .get(TENANT_TAG_ENDPOINTS.DETAILS(id), {
      headers: { "x-language": language },
      timeout: 15000,
    })
    .catch(() => null);

export const getTenantTagScanLogs = (id, params = {}, language = "en") =>
  api
    .get(TENANT_TAG_ENDPOINTS.SCAN_LOGS(id), {
      params,
      headers: { "x-language": language },
      timeout: 15000,
    })
    .catch(() => null);

export const getTenantTagMappingHistory = (id, params = {}, language = "en") =>
  api
    .get(TENANT_TAG_ENDPOINTS.MAPPING_HISTORY(id), {
      params,
      headers: { "x-language": language },
      timeout: 15000,
    })
    .catch(() => null);

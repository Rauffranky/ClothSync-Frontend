import api from "../api";
import { TENANT_ASSET_ENDPOINTS } from "../endpoint";

export const getTenantAssets = (params, language = "en") =>
  api.get(TENANT_ASSET_ENDPOINTS.LIST, {
    params,
    headers: { "x-language": language },
  });

export const getTenantAssetSummary = () =>
  api.get(TENANT_ASSET_ENDPOINTS.SUMMARY);

export const getTenantAssetDetails = (id, language = "en") =>
  api.get(TENANT_ASSET_ENDPOINTS.DETAILS(id), {
    headers: { "x-language": language },
  });

export const getTenantAssetBatchHistory = (id, params, language = "en") =>
  api.get(TENANT_ASSET_ENDPOINTS.BATCH_HISTORY(id), {
    params,
    headers: { "x-language": language },
  });

export const getTenantAssetLifecycleHistory = (id, params, language = "en") =>
  api.get(TENANT_ASSET_ENDPOINTS.LIFECYCLE_HISTORY(id), {
    params,
    headers: { "x-language": language },
  });

export const getTenantAssetAuditLogs = (id, params, language = "en") =>
  api.get(TENANT_ASSET_ENDPOINTS.AUDIT_LOGS(id), {
    params,
    headers: { "x-language": language },
  });

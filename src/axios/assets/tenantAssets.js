import api from "../api";
import { TENANT_ASSET_ENDPOINTS } from "../endpoint";

export const getTenantAssets = (params, language = "en") =>
  api.get(TENANT_ASSET_ENDPOINTS.LIST, {
    params,
    headers: { "x-language": language },
  });

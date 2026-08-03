import api from "../api";
import { TENANT_TAG_ENDPOINTS } from "../endpoint";

export const getTenantTags = (params, language = "en") =>
  api.get(TENANT_TAG_ENDPOINTS.LIST, {
    params,
    headers: { "x-language": language },
  });

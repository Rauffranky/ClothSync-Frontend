import api from "../api";
import { ADMIN_BUSINESS_TYPE_ENDPOINTS } from "../endpoint";

export const getPublicBusinessTypes = (language = "en") =>
  api.get(ADMIN_BUSINESS_TYPE_ENDPOINTS.PUBLIC_LIST, {
    headers: { "x-language": language },
  });

export const getAdminBusinessTypes = (params, language = "en") =>
  api.get(ADMIN_BUSINESS_TYPE_ENDPOINTS.LIST, {
    params,
    headers: { "x-language": language },
  });

export const createAdminBusinessType = (data, language = "en") =>
  api.post(ADMIN_BUSINESS_TYPE_ENDPOINTS.CREATE, data, {
    headers: { "x-language": language },
  });

export const updateAdminBusinessTypeStatus = (id, status, language = "en") =>
  api.put(
    ADMIN_BUSINESS_TYPE_ENDPOINTS.UPDATE_STATUS(id),
    { status },
    { headers: { "x-language": language } },
  );

export const deleteAdminBusinessType = (id, language = "en") =>
  api.delete(ADMIN_BUSINESS_TYPE_ENDPOINTS.DELETE(id), {
    headers: { "x-language": language },
  });

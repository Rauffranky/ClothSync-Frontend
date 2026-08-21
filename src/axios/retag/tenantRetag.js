import api from "../api";
import { TENANT_RETAG_ENDPOINTS } from "../endpoint";

export const changeTenantItem = (data, config = {}) =>
  api.post(TENANT_RETAG_ENDPOINTS.ITEM_CHANGE, data, config);

export const changeTenantTag = (data, config = {}) =>
  api.post(TENANT_RETAG_ENDPOINTS.TAG_CHANGE, data, config);

export const retireTenantTag = (data, config = {}) =>
  api.post(TENANT_RETAG_ENDPOINTS.RETIRE_DISCARD, data, config);

export const markTenantTagLost = (data, config = {}) =>
  api.post(TENANT_RETAG_ENDPOINTS.MARK_LOST, data, config);

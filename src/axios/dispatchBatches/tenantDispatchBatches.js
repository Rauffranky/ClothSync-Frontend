import api from "../api";
import { TENANT_DISPATCH_BATCH_ENDPOINTS } from "../endpoint";

export const getTenantDispatchBatches = (params) =>
  api.get(TENANT_DISPATCH_BATCH_ENDPOINTS.LIST, { params });

export const getTenantDispatchBatchActivityLogs = (batchId, params) =>
  api.get(TENANT_DISPATCH_BATCH_ENDPOINTS.ACTIVITY_LOGS(batchId), { params });

export const updateTenantDispatchBatchItemsStatus = (batchId, data) =>
  api.put(TENANT_DISPATCH_BATCH_ENDPOINTS.UPDATE_ITEMS_STATUS(batchId), data);

export const returnTenantDispatchBatch = (batchId, data) =>
  api.put(TENANT_DISPATCH_BATCH_ENDPOINTS.RETURN(batchId), data);

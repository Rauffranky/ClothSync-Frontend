import api from "../api";
import { LAUNDRY_BATCH_ENDPOINTS } from "../endpoint";

export const getIncomingBatches = (params = {}) =>
  api.get(LAUNDRY_BATCH_ENDPOINTS.INCOMING, { params, timeout: 15000 });

export const getIncomingBatchDetails = (batchId) =>
  api.get(LAUNDRY_BATCH_ENDPOINTS.INCOMING_DETAILS(batchId), {
    timeout: 15000,
  });

export const receiveLaundryDispatchBatch = (batchId, data) =>
  api.post(LAUNDRY_BATCH_ENDPOINTS.RECEIVE(batchId), data, {
    timeout: 15000,
  });

export const getCompletedLaundryDispatchBatches = (params = {}) =>
  api.get(LAUNDRY_BATCH_ENDPOINTS.COMPLETED, {
    params,
    timeout: 15000,
  });

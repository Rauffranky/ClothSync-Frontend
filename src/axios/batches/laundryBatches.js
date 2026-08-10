import api from "../api";
import {
  LAUNDRY_BATCH_ENDPOINTS,
  LAUNDRY_SCANNER_ENDPOINTS,
} from "../endpoint";

export const getIncomingBatches = (params = {}) =>
  api.get(LAUNDRY_BATCH_ENDPOINTS.INCOMING, { params, timeout: 15000 });

export const getIncomingBatchDetails = (batchId) =>
  api.get(LAUNDRY_BATCH_ENDPOINTS.INCOMING_DETAILS(batchId), {
    timeout: 15000,
  });

export const scanIncomingBatchTags = (data) =>
  api.post(LAUNDRY_SCANNER_ENDPOINTS.TEST_SCANNER_SCAN, data, {
    timeout: 15000,
  });

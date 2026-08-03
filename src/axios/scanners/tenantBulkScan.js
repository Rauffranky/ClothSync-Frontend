import api from "../api";
import { TENANT_BULK_SCAN_ENDPOINTS } from "../endpoint";

export const testTenantScannerScan = (data) =>
  api.post(TENANT_BULK_SCAN_ENDPOINTS.TEST_SCANNER_SCAN, data, {
    timeout: 15_000,
  });

export const testTenantBulkAdd = (sessionId, data) =>
  api.post(TENANT_BULK_SCAN_ENDPOINTS.BULK_ADD(sessionId), data, {
    timeout: 15_000,
  });

export const testTenantBulkAddUndo = (sessionId, undoId) =>
  api.post(TENANT_BULK_SCAN_ENDPOINTS.UNDO_BULK_ADD(sessionId, undoId), undefined, {
    timeout: 15_000,
  });

export const clearTenantBulkScanSession = (sessionId) =>
  api.put(TENANT_BULK_SCAN_ENDPOINTS.CLEAR_SESSION(sessionId), undefined, {
    timeout: 15_000,
  });

export const getTenantBulkScanEntries = (sessionId, params) =>
  api.get(TENANT_BULK_SCAN_ENDPOINTS.ENTRIES(sessionId), {
    params,
    timeout: 15_000,
  });

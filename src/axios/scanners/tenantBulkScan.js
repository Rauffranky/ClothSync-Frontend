import api from "../api";
import { TENANT_BULK_SCAN_ENDPOINTS } from "../endpoint";

export const testTenantScannerScan = (data, config = {}) =>
  api.post(TENANT_BULK_SCAN_ENDPOINTS.TEST_SCANNER_SCAN, data, {
    timeout: 15_000,
    ...config,
  });

export const startTenantBulkScanSession = (scannerId) =>
  api.post(TENANT_BULK_SCAN_ENDPOINTS.START_SESSION, { scannerId }, {
    timeout: 15_000,
  });

export const getActiveTenantBulkScanSession = (params = {}) =>
  api.get(TENANT_BULK_SCAN_ENDPOINTS.ACTIVE_SESSION, {
    params,
    timeout: 15_000,
  });

export const scanBulkTag = (sessionId, data, config = {}) =>
  api.post(TENANT_BULK_SCAN_ENDPOINTS.SCAN(sessionId), data, {
    timeout: 15_000,
    ...config,
  });

export const getTenantBulkScanSummary = (sessionId) =>
  api.get(TENANT_BULK_SCAN_ENDPOINTS.SUMMARY(sessionId), { timeout: 15_000 });

export const testTenantBulkAdd = (sessionId, data) =>
  api.post(TENANT_BULK_SCAN_ENDPOINTS.BULK_ADD(sessionId), data, {
    timeout: 120_000,
  });

export const testTenantBulkAddUndo = (sessionId, undoId) =>
  api.post(TENANT_BULK_SCAN_ENDPOINTS.UNDO_BULK_ADD(sessionId, undoId), undefined, {
    timeout: 15_000,
  });

export const clearTenantBulkScanSession = (sessionId) =>
  api.put(TENANT_BULK_SCAN_ENDPOINTS.CLEAR_SESSION(sessionId), undefined, {
    timeout: 15_000,
  });

export const clearSelectedTenantBulkScanEntries = (sessionId, tempTagIds) =>
  api.put(
    TENANT_BULK_SCAN_ENDPOINTS.CLEAR_SELECTED(sessionId),
    { tempTagIds },
    { timeout: 15_000 },
  );

export const ignoreSelectedTenantBulkScanEntries = (sessionId, tempTagIds) =>
  api.put(
    TENANT_BULK_SCAN_ENDPOINTS.IGNORE_SELECTED(sessionId),
    { tempTagIds },
    { timeout: 15_000 },
  );

export const finishTenantBulkScanSession = (sessionId) =>
  api.put(TENANT_BULK_SCAN_ENDPOINTS.FINISH_SESSION(sessionId), undefined, {
    timeout: 15_000,
  });

export const getTenantBulkScanEntries = (sessionId, params) =>
  api.get(TENANT_BULK_SCAN_ENDPOINTS.ENTRIES(sessionId), {
    params,
    timeout: 15_000,
  });

export const previewBulkScanAction = (sessionId, data, config = {}) =>
  api.post(TENANT_BULK_SCAN_ENDPOINTS.ACTION_PREVIEW(sessionId), data, {
    timeout: 15_000,
    ...config,
  });

export const confirmBulkScanAction = (sessionId, data, config = {}) =>
  api.post(TENANT_BULK_SCAN_ENDPOINTS.ACTION_CONFIRM(sessionId), data, {
    timeout: 15_000,
    ...config,
  });

export const undoBulkScanAction = (sessionId, undoId, config = {}) =>
  api.post(
    TENANT_BULK_SCAN_ENDPOINTS.ACTION_UNDO(sessionId, undoId),
    undefined,
    { timeout: 15_000, ...config },
  );

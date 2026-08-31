import api from "../api";
import { TENANT_SCANNER_ENDPOINTS } from "../endpoint";

export const getTenantScanners = (params = {}) =>
  api.get(TENANT_SCANNER_ENDPOINTS.LIST, { params, timeout: 15000 });

export const getTenantScannerDetails = (id) =>
  api.get(TENANT_SCANNER_ENDPOINTS.DETAILS(id), { timeout: 15000 });

export const configureTenantScanner = (id, data) =>
  api.put(TENANT_SCANNER_ENDPOINTS.CONFIGURE(id), data, { timeout: 15000 });

export const getTenantScannerWarnings = (params = {}) =>
  api.get(TENANT_SCANNER_ENDPOINTS.WARNINGS, { params, timeout: 15000 });

export const updateTenantScanner = (id, data) =>
  api.put(TENANT_SCANNER_ENDPOINTS.UPDATE(id), data, { timeout: 15000 });

export const updateTenantScannerStatus = (id, status) =>
  api.put(
    TENANT_SCANNER_ENDPOINTS.UPDATE_STATUS(id),
    { status },
    { timeout: 15000 },
  );

export const reconnectTenantScannerDevice = (id, data) =>
  api.put(TENANT_SCANNER_ENDPOINTS.RECONNECT_DEVICE(id), data, {
    timeout: 15000,
  });

export const replaceTenantScannerDevice = (id, data) =>
  api.put(TENANT_SCANNER_ENDPOINTS.REPLACE_DEVICE(id), data, {
    timeout: 15000,
  });

export const updateTenantScannerAccess = (id, data) =>
  api.put(TENANT_SCANNER_ENDPOINTS.ACCESS(id), data, { timeout: 15000 });

export const rotateTenantScannerKey = (id) =>
  api.put(TENANT_SCANNER_ENDPOINTS.ROTATE_KEY(id), undefined, {
    timeout: 15000,
  });

export const revokeTenantScannerKey = (id) =>
  api.put(TENANT_SCANNER_ENDPOINTS.REVOKE_KEY(id), undefined, {
    timeout: 15000,
  });

export const getTenantScannerLogs = (id, params = {}) =>
  api.get(TENANT_SCANNER_ENDPOINTS.LOGS(id), {
    params,
    timeout: 15000,
  });

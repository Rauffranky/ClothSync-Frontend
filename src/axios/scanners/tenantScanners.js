import api from "../api";
import { TENANT_SCANNER_ENDPOINTS } from "../endpoint";

export const createTenantScanner = (data) =>
  api.post(TENANT_SCANNER_ENDPOINTS.CREATE, data);

export const getTenantScanners = (params = {}) =>
  api.get(TENANT_SCANNER_ENDPOINTS.LIST, { params, timeout: 15000 });

export const getTenantScannerDetails = (id) =>
  api.get(TENANT_SCANNER_ENDPOINTS.DETAILS(id), { timeout: 15000 });

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

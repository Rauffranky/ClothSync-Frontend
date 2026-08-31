import api from "../api";
import { LAUNDRY_SCANNER_ENDPOINTS } from "../endpoint";

export const getLaundryScanners = (params = {}) =>
  api.get(LAUNDRY_SCANNER_ENDPOINTS.LIST, { params, timeout: 15000 });

export const getLaundryScannerDetails = (id) =>
  api.get(LAUNDRY_SCANNER_ENDPOINTS.DETAILS(id), { timeout: 15000 });

export const configureLaundryScanner = (id, data) =>
  api.put(LAUNDRY_SCANNER_ENDPOINTS.CONFIGURE(id), data, { timeout: 15000 });

export const reconnectLaundryScannerDevice = (id, data) =>
  api.put(LAUNDRY_SCANNER_ENDPOINTS.RECONNECT_DEVICE(id), data, { timeout: 15000 });

export const replaceLaundryScannerDevice = (id, data) =>
  api.put(LAUNDRY_SCANNER_ENDPOINTS.REPLACE_DEVICE(id), data, { timeout: 15000 });

export const updateLaundryScannerAccess = (id, data) =>
  api.put(LAUNDRY_SCANNER_ENDPOINTS.ACCESS(id), data, { timeout: 15000 });

export const getLaundryScannerWarnings = (params = {}) =>
  api.get(LAUNDRY_SCANNER_ENDPOINTS.WARNINGS, { params, timeout: 15000 });

export const updateLaundryScanner = (id, data) =>
  api.put(LAUNDRY_SCANNER_ENDPOINTS.UPDATE(id), data, { timeout: 15000 });

export const updateLaundryScannerStatus = (id, status) =>
  api.put(
    LAUNDRY_SCANNER_ENDPOINTS.UPDATE_STATUS(id),
    { status },
    { timeout: 15000 },
  );

export const clearLaundryScannerSession = (sessionId) =>
  api.put(LAUNDRY_SCANNER_ENDPOINTS.CLEAR_SESSION(sessionId), undefined, {
    timeout: 15000,
  });

export const undoLaundryScanAction = (sessionId, undoId, config = {}) =>
  api.post(
    LAUNDRY_SCANNER_ENDPOINTS.ACTION_UNDO(sessionId, undoId),
    undefined,
    { timeout: 15000, ...config },
  );

const ACTIVE_BULK_SCAN_SESSION_KEY = "active-tenant-bulk-scan-session-id";
const ACTIVE_BULK_SCAN_GROUP_KEY = "active-tenant-bulk-scan-group";

export const getActiveBulkScanSessionId = () => {
  try {
    return sessionStorage.getItem(ACTIVE_BULK_SCAN_SESSION_KEY);
  } catch {
    return null;
  }
};

export const setActiveBulkScanSessionId = (sessionId) => {
  try {
    if (sessionId) {
      sessionStorage.setItem(ACTIVE_BULK_SCAN_SESSION_KEY, sessionId);
    } else {
      sessionStorage.removeItem(ACTIVE_BULK_SCAN_SESSION_KEY);
    }
  } catch {
    // The active screen can still use its in-memory session when storage is unavailable.
  }
};

export const getActiveBulkScanGroup = () => {
  try {
    return sessionStorage.getItem(ACTIVE_BULK_SCAN_GROUP_KEY);
  } catch {
    return null;
  }
};

export const setActiveBulkScanGroup = (scanGroup) => {
  try {
    if (scanGroup) sessionStorage.setItem(ACTIVE_BULK_SCAN_GROUP_KEY, scanGroup);
    else sessionStorage.removeItem(ACTIVE_BULK_SCAN_GROUP_KEY);
  } catch {
    // The screen can still use its in-memory active group when storage is unavailable.
  }
};

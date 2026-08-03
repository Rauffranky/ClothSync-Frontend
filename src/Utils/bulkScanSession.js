const ACTIVE_BULK_SCAN_SESSION_KEY = "active-tenant-bulk-scan-session-id";

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

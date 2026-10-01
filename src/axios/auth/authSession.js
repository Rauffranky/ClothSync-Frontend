const AUTH_SESSION_KEYS = Object.freeze({
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  SESSION_ID: "sessionId",
  ACCESS_TOKEN_EXPIRES_AT: "accessTokenExpiresAt",
  TOKEN: "token",
  USER: "authUser",
});

export const AUTH_SESSION_USER_UPDATED_EVENT = "auth-session-user-updated";
export const AUTH_SESSION_CHANGED_EVENT = "auth-session-changed";

const notifyAuthSessionChanged = () => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
};

const notifyAuthSessionUserUpdated = (user) => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(AUTH_SESSION_USER_UPDATED_EVENT, { detail: user }),
  );
};

const clearLegacyAuthLocalStorage = () => {
  Object.values(AUTH_SESSION_KEYS).forEach((key) => localStorage.removeItem(key));
};

// Auth data used to be persisted across browser sessions. Remove those legacy
// values as soon as the auth layer loads instead of silently reusing them.
clearLegacyAuthLocalStorage();

export const getAuthAccessToken = () =>
  sessionStorage.getItem(AUTH_SESSION_KEYS.ACCESS_TOKEN);

export const getAuthSessionUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem(AUTH_SESSION_KEYS.USER)) || null;
  } catch {
    return null;
  }
};

export const setAuthSessionUser = (user) => {
  if (user) {
    sessionStorage.setItem(AUTH_SESSION_KEYS.USER, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(AUTH_SESSION_KEYS.USER);
  }

  notifyAuthSessionUserUpdated(user || null);
};

export const storeAuthSessionFromResponse = (response) => {
  const payload = response?.data ?? response;
  const authData =
    payload?.data && typeof payload.data === "object" && !Array.isArray(payload.data)
      ? payload.data
      : payload;

  const accessToken =
    authData?.accessToken ??
    authData?.access_token ??
    authData?.token ??
    payload?.accessToken ??
    payload?.token;

  if (accessToken) {
    sessionStorage.setItem(AUTH_SESSION_KEYS.ACCESS_TOKEN, accessToken);
  }

  const refreshToken =
    authData?.refreshToken ??
    authData?.refresh_token ??
    payload?.refreshToken;

  if (refreshToken) {
    sessionStorage.setItem(AUTH_SESSION_KEYS.REFRESH_TOKEN, refreshToken);
  }

  const sessionId =
    authData?.sessionId ??
    authData?.session_id ??
    payload?.sessionId;

  if (sessionId) {
    sessionStorage.setItem(AUTH_SESSION_KEYS.SESSION_ID, String(sessionId));
  }

  const accessTokenExpiresAt =
    authData?.accessTokenExpiresAt ??
    payload?.accessTokenExpiresAt;

  if (accessTokenExpiresAt) {
    sessionStorage.setItem(
      AUTH_SESSION_KEYS.ACCESS_TOKEN_EXPIRES_AT,
      accessTokenExpiresAt,
    );
  }

  if (accessToken) localStorage.setItem("token", accessToken);

  const user =
    authData?.user ??
    authData?.tenant ??
    authData?.laundry ??
    authData?.superAdmin ??
    payload?.user;

  if (user) setAuthSessionUser(user);

  notifyAuthSessionChanged();

  return accessToken || null;
};

const IMPERSONATOR_BACKUP_KEY = "impersonatorBackup";

export const getImpersonationSession = () => {
  try {
    return JSON.parse(sessionStorage.getItem(IMPERSONATOR_BACKUP_KEY)) || null;
  } catch {
    return null;
  }
};

export const isImpersonating = () => Boolean(sessionStorage.getItem(IMPERSONATOR_BACKUP_KEY));

export const startImpersonation = (response, returnPath) => {
  const backup = {
    accessToken: sessionStorage.getItem(AUTH_SESSION_KEYS.ACCESS_TOKEN),
    refreshToken: sessionStorage.getItem(AUTH_SESSION_KEYS.REFRESH_TOKEN),
    sessionId: sessionStorage.getItem(AUTH_SESSION_KEYS.SESSION_ID),
    accessTokenExpiresAt: sessionStorage.getItem(AUTH_SESSION_KEYS.ACCESS_TOKEN_EXPIRES_AT),
    user: sessionStorage.getItem(AUTH_SESSION_KEYS.USER),
    returnPath:
      returnPath ||
      (typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : "/superadmin/businesses"),
  };

  sessionStorage.setItem(IMPERSONATOR_BACKUP_KEY, JSON.stringify(backup));
  return storeAuthSessionFromResponse(response);
};

export const exitImpersonation = () => {
  try {
    const rawBackup = sessionStorage.getItem(IMPERSONATOR_BACKUP_KEY);
    if (!rawBackup) return null;
    const backup = JSON.parse(rawBackup);
    sessionStorage.removeItem(IMPERSONATOR_BACKUP_KEY);

    if (backup.accessToken) {
      sessionStorage.setItem(AUTH_SESSION_KEYS.ACCESS_TOKEN, backup.accessToken);
      localStorage.setItem("token", backup.accessToken);
    } else {
      sessionStorage.removeItem(AUTH_SESSION_KEYS.ACCESS_TOKEN);
      localStorage.removeItem("token");
    }

    if (backup.refreshToken) {
      sessionStorage.setItem(AUTH_SESSION_KEYS.REFRESH_TOKEN, backup.refreshToken);
    } else {
      sessionStorage.removeItem(AUTH_SESSION_KEYS.REFRESH_TOKEN);
    }

    if (backup.sessionId) {
      sessionStorage.setItem(AUTH_SESSION_KEYS.SESSION_ID, backup.sessionId);
    } else {
      sessionStorage.removeItem(AUTH_SESSION_KEYS.SESSION_ID);
    }

    if (backup.accessTokenExpiresAt) {
      sessionStorage.setItem(
        AUTH_SESSION_KEYS.ACCESS_TOKEN_EXPIRES_AT,
        backup.accessTokenExpiresAt,
      );
    } else {
      sessionStorage.removeItem(AUTH_SESSION_KEYS.ACCESS_TOKEN_EXPIRES_AT);
    }

    let restoredUser = null;
    if (backup.user) {
      sessionStorage.setItem(AUTH_SESSION_KEYS.USER, backup.user);
      try {
        restoredUser = JSON.parse(backup.user);
      } catch {
        restoredUser = null;
      }
    } else {
      sessionStorage.removeItem(AUTH_SESSION_KEYS.USER);
    }

    notifyAuthSessionUserUpdated(restoredUser);
    notifyAuthSessionChanged();

    return backup.returnPath || "/superadmin/businesses";
  } catch {
    sessionStorage.removeItem(IMPERSONATOR_BACKUP_KEY);
    return "/superadmin/businesses";
  }
};

export const clearAuthSession = () => {
  Object.values(AUTH_SESSION_KEYS).forEach((key) => sessionStorage.removeItem(key));
  sessionStorage.removeItem(IMPERSONATOR_BACKUP_KEY);
  clearLegacyAuthLocalStorage();
  notifyAuthSessionUserUpdated(null);
  notifyAuthSessionChanged();
};

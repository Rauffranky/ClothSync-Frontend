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
  const authData = response?.data ?? response;
  const accessToken =
    authData?.accessToken ?? authData?.access_token ?? authData?.token;

  if (accessToken) {
    sessionStorage.setItem(AUTH_SESSION_KEYS.ACCESS_TOKEN, accessToken);
  }

  if (authData?.refreshToken) {
    sessionStorage.setItem(
      AUTH_SESSION_KEYS.REFRESH_TOKEN,
      authData.refreshToken,
    );
  }

  if (authData?.sessionId) sessionStorage.setItem(AUTH_SESSION_KEYS.SESSION_ID, authData.sessionId);
  if (authData?.accessTokenExpiresAt) sessionStorage.setItem(AUTH_SESSION_KEYS.ACCESS_TOKEN_EXPIRES_AT, authData.accessTokenExpiresAt);
  if (accessToken) localStorage.setItem("token", accessToken);

  const user =
    authData?.user ??
    authData?.tenant ??
    authData?.laundry ??
    authData?.superAdmin;
  if (user) setAuthSessionUser(user);

  notifyAuthSessionChanged();

  return accessToken || null;
};

export const clearAuthSession = () => {
  Object.values(AUTH_SESSION_KEYS).forEach((key) => sessionStorage.removeItem(key));
  clearLegacyAuthLocalStorage();
  notifyAuthSessionUserUpdated(null);
  notifyAuthSessionChanged();
};

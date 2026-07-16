const TENANT_SESSION_KEYS = Object.freeze({
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER: "authUser",
});

export const TENANT_SESSION_USER_UPDATED_EVENT =
  "tenant-session-user-updated";

const notifyTenantSessionUserUpdated = (user) => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(TENANT_SESSION_USER_UPDATED_EVENT, { detail: user }),
  );
};

const clearLegacyTenantLocalStorage = () => {
  Object.values(TENANT_SESSION_KEYS).forEach((key) => localStorage.removeItem(key));
};

// Auth data used to be persisted across browser sessions. Remove those legacy
// values as soon as the auth layer loads instead of silently reusing them.
clearLegacyTenantLocalStorage();

export const getTenantAccessToken = () =>
  sessionStorage.getItem(TENANT_SESSION_KEYS.ACCESS_TOKEN);

export const getTenantSessionUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem(TENANT_SESSION_KEYS.USER)) || null;
  } catch {
    return null;
  }
};

export const setTenantSessionUser = (user) => {
  if (user) {
    sessionStorage.setItem(TENANT_SESSION_KEYS.USER, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(TENANT_SESSION_KEYS.USER);
  }

  notifyTenantSessionUserUpdated(user || null);
};

export const storeTenantSessionFromResponse = (response) => {
  const authData = response?.data ?? response;
  const accessToken =
    authData?.accessToken ?? authData?.access_token ?? authData?.token;

  if (accessToken) {
    sessionStorage.setItem(TENANT_SESSION_KEYS.ACCESS_TOKEN, accessToken);
  }

  if (authData?.refreshToken) {
    sessionStorage.setItem(
      TENANT_SESSION_KEYS.REFRESH_TOKEN,
      authData.refreshToken,
    );
  }

  const user = authData?.user ?? authData?.tenant;
  if (user) setTenantSessionUser(user);

  return accessToken || null;
};

export const clearTenantSession = () => {
  Object.values(TENANT_SESSION_KEYS).forEach((key) => sessionStorage.removeItem(key));
  clearLegacyTenantLocalStorage();
  notifyTenantSessionUserUpdated(null);
};

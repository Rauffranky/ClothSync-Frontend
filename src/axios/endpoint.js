export const AUTH_ENDPOINTS = Object.freeze({
  TENANT_LOGIN: "/tenant-auth/login",
  TENANT_LOGOUT: "/tenant-auth/logout",
  TENANT_PROFILE: "/tenant-auth/me",
});

// Kept as a named export for simple imports and backwards compatibility.
export const TENANT_LOGIN = AUTH_ENDPOINTS.TENANT_LOGIN;

export const TENANT_CATEGORY_ENDPOINTS = Object.freeze({
  LIST: "/tenant-categories/show",
  CREATE: "/tenant-categories/create",
  DETAILS: (id) => `/tenant-categories/show/${id}`,
  UPDATE: (id) => `/tenant-categories/update/${id}`,
  UPDATE_STATUS: (id) => `/tenant-categories/update-status/${id}`,
});

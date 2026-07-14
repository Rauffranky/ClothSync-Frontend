export const AUTH_ENDPOINTS = Object.freeze({
  TENANT_LOGIN: "/tenant-auth/login",
  TENANT_LOGOUT: "/tenant-auth/logout",
  TENANT_PROFILE: "/tenant-auth/me",
  TENANT_SIGNUP: "/tenant-auth/signup",
  TENANT_VERIFY_OTP: "/tenant-auth/verify-otp",
  TENANT_RESEND_OTP: "/tenant-auth/resend-otp",
  TENANT_COMPLETE_PROFILE: "/tenant-auth/complete-profile",
  TENANT_FORGOT_PASSWORD: "/tenant-auth/forgot-password",
  TENANT_VERIFY_FORGOT_PASSWORD_OTP: "/tenant-auth/verify-forgot-password-otp",
  TENANT_RESET_PASSWORD: "/tenant-auth/reset-password",
  TENANT_CHANGE_PASSWORD: "/tenant-auth/change-password",
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

export const TENANT_SCANNER_ENDPOINTS = Object.freeze({
  CREATE: "/tenant-scanners/create",
});

export const TENANT_LAUNDRY_ENDPOINTS = Object.freeze({
  LIST: "/tenant-laundries/show",
  DETAILS: (id) => `/tenant-laundries/show/${id}`,
  PENDING_INVITES: "/tenant-laundries/pending-invites",
  SUMMARY: "/tenant-laundries/summary",
  SEND_INVITE: "/tenant-laundries/send-invite",
  RESEND_INVITE: (id) => `/tenant-laundries/resend-invite/${id}`,
  CANCEL_INVITE: (id) => `/tenant-laundries/cancel-invite/${id}`,
  INVITE_DETAILS: "/tenant-laundries/invite-details",
  SET_DEFAULT: (id) => `/tenant-laundries/set-default/${id}`,
});

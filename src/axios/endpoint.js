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

export const LAUNDRY_AUTH_ENDPOINTS = Object.freeze({
  LOGIN: "/laundry-auth/login",
  LOGOUT: "/laundry-auth/logout",
  SIGNUP: "/laundry-auth/signup",
  VERIFY_OTP: "/laundry-auth/verify-otp",
  RESEND_OTP: "/laundry-auth/resend-otp",
  COMPLETE_PROFILE: "/laundry-auth/complete-profile",
  FORGOT_PASSWORD: "/laundry-auth/forgot-password",
  VERIFY_FORGOT_PASSWORD_OTP: "/laundry-auth/verify-forgot-password-otp",
  RESET_PASSWORD: "/laundry-auth/reset-password",
  CHANGE_PASSWORD: "/laundry-auth/change-password",
});

// Kept as a named export for simple imports and backwards compatibility.
export const TENANT_LOGIN = AUTH_ENDPOINTS.TENANT_LOGIN;

export const TENANT_CATEGORY_ENDPOINTS = Object.freeze({
  LIST: "/tenant-categories/show",
  SUMMARY: "/tenant-categories/summary",
  CREATE: "/tenant-categories/create",
  DETAILS: (id) => `/tenant-categories/show/${id}`,
  UPDATE: (id) => `/tenant-categories/update/${id}`,
  UPDATE_STATUS: (id) => `/tenant-categories/update-status/${id}`,
});

export const TENANT_SCANNER_ENDPOINTS = Object.freeze({
  CREATE: "/tenant-scanners/create",
  LIST: "/tenant-scanners/show",
  DETAILS: (id) => `/tenant-scanners/show/${id}`,
  WARNINGS: "/tenant-scanners/warnings",
  UPDATE: (id) => `/tenant-scanners/update/${id}`,
  UPDATE_STATUS: (id) => `/tenant-scanners/update-status/${id}`,
});

export const TENANT_STAFF_ROLE_ENDPOINTS = Object.freeze({
  CREATE: "/tenant-staff-roles/create",
  LIST: "/tenant-staff-roles/show",
  DETAILS: (id) => `/tenant-staff-roles/show/${id}`,
  UPDATE: (id) => `/tenant-staff-roles/update/${id}`,
  UPDATE_STATUS: (id) => `/tenant-staff-roles/update-status/${id}`,
  SUMMARY: "/tenant-staff-roles/summary",
});

export const TENANT_ACCESS_SECTION_ENDPOINTS = Object.freeze({
  LIST: "/tenant-access-sections/show",
});

export const TENANT_STAFF_ENDPOINTS = Object.freeze({
  CREATE: "/tenant-staff/create",
  LIST: "/tenant-staff/show",
  SUMMARY: "/tenant-staff/summary",
  DETAILS: (id) => `/tenant-staff/show/${id}`,
  UPDATE: (id) => `/tenant-staff/update/${id}`,
  UPDATE_STATUS: (id) => `/tenant-staff/update-status/${id}`,
  VERIFY_EMAIL: "/tenant-staff/verify-email",
});

export const TENANT_LAUNDRY_ENDPOINTS = Object.freeze({
  LIST: "/tenant-laundries/show",
  DETAILS: (id) => `/tenant-laundries/show/${id}`,
  PENDING_INVITES: "/tenant-laundries/pending-invites",
  CLOSED_INVITES: "/tenant-laundries/closed-invites",
  SUMMARY: "/tenant-laundries/summary",
  SEND_INVITE: "/tenant-laundries/send-invite",
  RESEND_INVITE: (id) => `/tenant-laundries/resend-invite/${id}`,
  CANCEL_INVITE: (id) => `/tenant-laundries/cancel-invite/${id}`,
  INVITE_DETAILS: "/tenant-laundries/invite-details",
  SET_DEFAULT: (id) => `/tenant-laundries/set-default/${id}`,
  UNLINK: (id) => `/tenant-laundries/unlink/${id}`,
});

export const TENANT_SETTINGS_ENDPOINTS = Object.freeze({
  TIMEZONES: "/tenant-settings/timezones",
  DATE_FORMATS: "/tenant-settings/date-formats",
  PROFILE: "/tenant-settings/profile",
});

export const TENANT_NOTIFICATION_PREFERENCE_ENDPOINTS = Object.freeze({
  SHOW: "/tenant-notification-preferences/show",
  UPDATE: "/tenant-notification-preferences/update",
});

export const FILE_UPLOAD_ENDPOINTS = Object.freeze({
  SINGLE: "/file-upload/single",
});

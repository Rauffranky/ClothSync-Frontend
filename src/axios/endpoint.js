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

export const TENANT_TAG_ENDPOINTS = Object.freeze({
  LIST: "/tenant-tags/show",
});

export const TENANT_ASSET_ENDPOINTS = Object.freeze({
  LIST: "/tenant-assets/show",
});

export const TENANT_BULK_SCAN_ENDPOINTS = Object.freeze({
  TEST_SCANNER_SCAN: "/tenant-bulk-scan/test-scanner-scan",
  BULK_ADD: (sessionId) =>
    `/tenant-bulk-scan/sessions/${sessionId}/bulk-add`,
  UNDO_BULK_ADD: (sessionId, undoId) =>
    `/tenant-bulk-scan/sessions/${sessionId}/bulk-add/${undoId}/undo`,
  CLEAR_SESSION: (sessionId) =>
    `/tenant-bulk-scan/sessions/${sessionId}/clear`,
  ENTRIES: (sessionId) =>
    `/tenant-bulk-scan/sessions/${sessionId}/entries`,
});

export const LAUNDRY_SCANNER_ENDPOINTS = Object.freeze({
  CREATE: "/laundry-scanners/create",
  LIST: "/laundry-scanners/show",
  DETAILS: (id) => `/laundry-scanners/show/${id}`,
  WARNINGS: "/laundry-scanners/warnings",
  UPDATE: (id) => `/laundry-scanners/update/${id}`,
  UPDATE_STATUS: (id) => `/laundry-scanners/update-status/${id}`,
});

export const TENANT_STAFF_ROLE_ENDPOINTS = Object.freeze({
  CREATE: "/tenant-staff-roles/create",
  LIST: "/tenant-staff-roles/show",
  DETAILS: (id) => `/tenant-staff-roles/show/${id}`,
  UPDATE: (id) => `/tenant-staff-roles/update/${id}`,
  UPDATE_STATUS: (id) => `/tenant-staff-roles/update-status/${id}`,
});

export const TENANT_ACCESS_SECTION_ENDPOINTS = Object.freeze({
  LIST: "/tenant-access-sections/show",
});

export const TENANT_STAFF_ENDPOINTS = Object.freeze({
  CREATE: "/tenant-staff/create",
  LIST: "/tenant-staff/show",
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
  SEND_INVITE: "/tenant-laundries/send-invite",
  RESEND_INVITE: (id) => `/tenant-laundries/resend-invite/${id}`,
  CANCEL_INVITE: (id) => `/tenant-laundries/cancel-invite/${id}`,
  INVITE_DETAILS: "/tenant-laundries/invite-details",
  HANDLE_INVITE: "/tenant-laundries/handle-invite",
  ACCEPT_INVITE: "/tenant-laundries/accept-invite",
  SET_DEFAULT: (id) => `/tenant-laundries/set-default/${id}`,
  UNLINK: (id) => `/tenant-laundries/unlink/${id}`,
});

export const LAUNDRY_TENANT_ENDPOINTS = Object.freeze({
  LIST: "/laundry-tenants/show",
  DETAILS: (id) => `/laundry-tenants/show/${id}`,
  PENDING_REQUESTS: "/laundry-tenants/pending-requests",
  ACCEPT_REQUEST: (id) => `/laundry-tenants/pending-requests/${id}/accept`,
  REJECT_REQUEST: (id) => `/laundry-tenants/pending-requests/${id}/reject`,
});

export const LAUNDRY_STAFF_ENDPOINTS = Object.freeze({
  CREATE: "/laundry-staff/create",
  LIST: "/laundry-staff/show",
  DETAILS: (id) => `/laundry-staff/show/${id}`,
  UPDATE: (id) => `/laundry-staff/update/${id}`,
  UPDATE_STATUS: (id) => `/laundry-staff/update-status/${id}`,
  VERIFY_EMAIL: "/laundry-staff/verify-email",
});

export const LAUNDRY_STAFF_ROLE_ENDPOINTS = Object.freeze({
  CREATE: "/laundry-staff-roles/create",
  LIST: "/laundry-staff-roles/show",
  DETAILS: (id) => `/laundry-staff-roles/show/${id}`,
  UPDATE: (id) => `/laundry-staff-roles/update/${id}`,
  UPDATE_STATUS: (id) => `/laundry-staff-roles/update-status/${id}`,
});

export const LAUNDRY_ACCESS_SECTION_ENDPOINTS = Object.freeze({
  LIST: "/laundry-access-sections/show",
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

export const LAUNDRY_SETTINGS_ENDPOINTS = Object.freeze({
  TIMEZONES: "/laundry-settings/timezones",
  DATE_FORMATS: "/laundry-settings/date-formats",
  PROFILE: "/laundry-settings/profile",
});

export const LAUNDRY_NOTIFICATION_PREFERENCE_ENDPOINTS = Object.freeze({
  SHOW: "/laundry-notification-preferences/show",
  UPDATE: "/laundry-notification-preferences/update",
});

export const FILE_UPLOAD_ENDPOINTS = Object.freeze({
  SINGLE: "/file-upload/single",
});

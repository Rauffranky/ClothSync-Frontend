import api from "../api";
import { AUTH_ENDPOINTS } from "../endpoint";
export {
  clearTenantSession,
  getTenantAccessToken,
  getTenantSessionUser,
  setTenantSessionUser,
  storeTenantSessionFromResponse,
} from "./tenantSession";

export const loginTenant = ({ email, password }) =>
  api.post(AUTH_ENDPOINTS.TENANT_LOGIN, {
    email: email.trim(),
    password,
  });

export const signupTenant = ({ fullName, email, password, confirmPassword }) =>
  api.post(AUTH_ENDPOINTS.TENANT_SIGNUP, {
    fullName: fullName.trim(),
    email: email.trim(),
    password,
    confirmPassword,
  });

export const verifyTenantSignupOtp = ({ email, otp }) =>
  api.post(AUTH_ENDPOINTS.TENANT_VERIFY_OTP, {
    email: email.trim(),
    otp,
  });

export const resendTenantSignupOtp = ({ email }) =>
  api.post(AUTH_ENDPOINTS.TENANT_RESEND_OTP, {
    email: email.trim(),
  });

export const completeTenantProfile = ({
  userId,
  businessName,
  businessType,
  phone,
  address,
  city,
  state,
  country,
  postalCode,
  timezone,
  // avatar,
}) =>
  api.post(AUTH_ENDPOINTS.TENANT_COMPLETE_PROFILE, {
    userId,
    businessName: businessName.trim(),
    businessType,
    phone,
    address: address.trim(),
    city: city.trim(),
    state: state.trim(),
    country,
    postalCode: postalCode.trim(),
    timezone,
    // avatar,
  });

export const getAuthenticatedTenant = () =>
  api.get(AUTH_ENDPOINTS.TENANT_PROFILE);

export const logoutTenant = () => api.get(AUTH_ENDPOINTS.TENANT_LOGOUT);

export const forgotTenantPassword = ({ email }) =>
  api.post(AUTH_ENDPOINTS.TENANT_FORGOT_PASSWORD, {
    email: email.trim(),
  });

export const verifyTenantForgotPasswordOtp = ({ email, otp }) =>
  api.post(AUTH_ENDPOINTS.TENANT_VERIFY_FORGOT_PASSWORD_OTP, {
    email: email.trim(),
    otp,
  });

export const resetTenantPassword = ({ email, otp, password, confirmPassword }) =>
  api.post(AUTH_ENDPOINTS.TENANT_RESET_PASSWORD, {
    email: email.trim(),
    otp,
    password,
    confirmPassword,
  });

export const changeTenantPassword = ({ currentPassword, newPassword, confirmNewPassword }) =>
  api.post(AUTH_ENDPOINTS.TENANT_CHANGE_PASSWORD, {
    currentPassword,
    newPassword,
    confirmNewPassword,
  });

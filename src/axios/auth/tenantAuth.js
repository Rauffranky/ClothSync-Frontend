import api from "../api";
import { AUTH_ENDPOINTS } from "../endpoint";

export const loginTenant = ({ email, password }) =>
  api.post(AUTH_ENDPOINTS.TENANT_LOGIN, {
    email: email.trim(),
    password,
  });

export const getAuthenticatedTenant = () =>
  api.get(AUTH_ENDPOINTS.TENANT_PROFILE);

export const logoutTenant = () => api.get(AUTH_ENDPOINTS.TENANT_LOGOUT);

export const clearTenantSession = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("authUser");
};

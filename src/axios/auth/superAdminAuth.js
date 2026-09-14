import api from "../api";

export const SUPER_ADMIN_AUTH_ENDPOINTS = Object.freeze({
  LOGIN: "/admin-auth/login",
  LOGOUT: "/admin-auth/logout",
  ME: "/admin-auth/me",
});

export const loginSuperAdmin = ({ email, password }) =>
  api.post(SUPER_ADMIN_AUTH_ENDPOINTS.LOGIN, {
    email: email.trim(),
    password,
  });

export const logoutSuperAdmin = () => {
  const sessionId = sessionStorage.getItem("sessionId");
  return api.get(SUPER_ADMIN_AUTH_ENDPOINTS.LOGOUT, {
    params: sessionId ? { sessionId } : {},
    headers: sessionId ? { "x-session-id": sessionId } : {},
  });
};

export const getAuthenticatedSuperAdmin = () =>
  api.get(SUPER_ADMIN_AUTH_ENDPOINTS.ME);


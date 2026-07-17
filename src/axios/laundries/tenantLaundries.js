import api from "../api";
import { TENANT_LAUNDRY_ENDPOINTS } from "../endpoint";

export const getTenantLaundries = (params) =>
  api.get(TENANT_LAUNDRY_ENDPOINTS.LIST, { params, timeout: 15000 });

export const getPendingTenantLaundryInvites = (params) =>
  api.get(TENANT_LAUNDRY_ENDPOINTS.PENDING_INVITES, { params });

export const getClosedTenantLaundryInvites = (params) =>
  api.get(TENANT_LAUNDRY_ENDPOINTS.CLOSED_INVITES, {
    params,
    timeout: 15000,
  });

export const sendTenantLaundryInvite = ({ email, message = "", locale = "en" }) =>
  api.post(TENANT_LAUNDRY_ENDPOINTS.SEND_INVITE, { email: email.trim(), message, locale });

export const resendTenantLaundryInvite = (id) =>
  api.put(TENANT_LAUNDRY_ENDPOINTS.RESEND_INVITE(id));

export const cancelTenantLaundryInvite = (id) =>
  api.put(TENANT_LAUNDRY_ENDPOINTS.CANCEL_INVITE(id));

export const getTenantLaundryInviteDetails = (token) =>
  api.get(TENANT_LAUNDRY_ENDPOINTS.INVITE_DETAILS, { params: { token } });

export const handleTenantLaundryInvite = (token) =>
  api.get(TENANT_LAUNDRY_ENDPOINTS.HANDLE_INVITE, {
    params: { token },
    timeout: 15000,
  });

export const acceptTenantLaundryInvite = (token, payload) =>
  api.post(TENANT_LAUNDRY_ENDPOINTS.ACCEPT_INVITE, payload, {
    params: { token },
    timeout: 15000,
  });

export const getTenantLaundryDetails = (id) =>
  api.get(TENANT_LAUNDRY_ENDPOINTS.DETAILS(id));

export const setTenantLaundryAsDefault = (id) =>
  api.put(TENANT_LAUNDRY_ENDPOINTS.SET_DEFAULT(id));

export const unlinkTenantLaundry = (id) =>
  api.put(TENANT_LAUNDRY_ENDPOINTS.UNLINK(id));

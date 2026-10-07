import api from "../api";
import {
  SUBSCRIPTION_ENDPOINTS,
  ADMIN_SUBSCRIPTION_ENDPOINTS,
} from "../endpoint";

// User-facing (Laundry / Tenant)
export const getMySubscription = (language = "en") =>
  api.get(SUBSCRIPTION_ENDPOINTS.MY_SUBSCRIPTION, {
    headers: { "x-language": language },
  });

export const requestSubscription = (data, language = "en") =>
  api.post(SUBSCRIPTION_ENDPOINTS.SUBSCRIBE, data, {
    headers: { "x-language": language },
  });

export const getAvailableSubscriptionPlans = (params = {}, language = "en") => {
  const queryParams = typeof params === "string" ? { targetType: params } : params;
  return api.get(SUBSCRIPTION_ENDPOINTS.PLANS, {
    params: queryParams,
    headers: { "x-language": language },
  });
};

// Super Admin
export const getAdminSubscriptionsList = (params, language = "en") =>
  api.get(ADMIN_SUBSCRIPTION_ENDPOINTS.LIST, {
    params,
    headers: { "x-language": language },
  });

export const approveAdminSubscription = (id, language = "en") =>
  api.put(
    ADMIN_SUBSCRIPTION_ENDPOINTS.APPROVE(id),
    {},
    { headers: { "x-language": language } },
  );

export const rejectAdminSubscription = (id, data, language = "en") =>
  api.put(ADMIN_SUBSCRIPTION_ENDPOINTS.REJECT(id), data, {
    headers: { "x-language": language },
  });

export const assignAdminSubscription = (data, language = "en") =>
  api.post(ADMIN_SUBSCRIPTION_ENDPOINTS.ASSIGN, data, {
    headers: { "x-language": language },
  });

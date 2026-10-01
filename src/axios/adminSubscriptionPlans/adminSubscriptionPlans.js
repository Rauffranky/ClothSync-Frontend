import api from "../api";
import { ADMIN_SUBSCRIPTION_PLAN_ENDPOINTS } from "../endpoint";

export const getPublicSubscriptionPlans = (language = "en") =>
  api.get(ADMIN_SUBSCRIPTION_PLAN_ENDPOINTS.PUBLIC_LIST, {
    headers: { "x-language": language },
  });

export const getAdminSubscriptionPlans = (params, language = "en") =>
  api.get(ADMIN_SUBSCRIPTION_PLAN_ENDPOINTS.LIST, {
    params,
    headers: { "x-language": language },
  });

export const getAdminSubscriptionPlanDetails = (id, language = "en") =>
  api.get(ADMIN_SUBSCRIPTION_PLAN_ENDPOINTS.DETAILS(id), {
    headers: { "x-language": language },
  });

export const createAdminSubscriptionPlan = (data, language = "en") =>
  api.post(ADMIN_SUBSCRIPTION_PLAN_ENDPOINTS.CREATE, data, {
    headers: { "x-language": language },
  });

export const updateAdminSubscriptionPlan = (id, data, language = "en") =>
  api.put(ADMIN_SUBSCRIPTION_PLAN_ENDPOINTS.UPDATE(id), data, {
    headers: { "x-language": language },
  });

export const updateAdminSubscriptionPlanStatus = (id, status, language = "en") =>
  api.put(
    ADMIN_SUBSCRIPTION_PLAN_ENDPOINTS.UPDATE_STATUS(id),
    { status },
    { headers: { "x-language": language } },
  );

export const deleteAdminSubscriptionPlan = (id, language = "en") =>
  api.delete(ADMIN_SUBSCRIPTION_PLAN_ENDPOINTS.DELETE(id), {
    headers: { "x-language": language },
  });

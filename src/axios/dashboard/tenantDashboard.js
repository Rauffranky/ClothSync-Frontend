import api from "../api";
import { TENANT_DASHBOARD_ENDPOINTS } from "../endpoint";

export const getTenantDashboardOverview = (params = {}) =>
  api.get(TENANT_DASHBOARD_ENDPOINTS.OVERVIEW, { params, timeout: 20000 });

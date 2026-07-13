import api from "../api";
import { TENANT_SCANNER_ENDPOINTS } from "../endpoint";

export const createTenantScanner = (data) =>
  api.post(TENANT_SCANNER_ENDPOINTS.CREATE, data);

import api from "../api";
import { ADMIN_LAUNDRY_ENDPOINTS } from "../endpoint";

export const getAdminLaundries = (params) =>
  api.get(ADMIN_LAUNDRY_ENDPOINTS.LIST, { params });

export const getAdminLaundryDetails = (id) =>
  api.get(ADMIN_LAUNDRY_ENDPOINTS.DETAILS(id));

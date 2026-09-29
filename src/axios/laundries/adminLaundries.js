import api from "../api";
import { ADMIN_LAUNDRY_ENDPOINTS } from "../endpoint";

export const getAdminLaundries = (params) =>
  api.get(ADMIN_LAUNDRY_ENDPOINTS.LIST, { params });

export const getAdminLaundryDetails = (id) =>
  api.get(ADMIN_LAUNDRY_ENDPOINTS.DETAILS(id));

export const createAdminLaundry = (payload) =>
  api.post(ADMIN_LAUNDRY_ENDPOINTS.CREATE, payload);

export const updateAdminLaundryStatus = (id, payload) =>
  api.put(ADMIN_LAUNDRY_ENDPOINTS.UPDATE_STATUS(id), payload);

export const updateAdminLaundry = (id, payload) =>
  api.put(ADMIN_LAUNDRY_ENDPOINTS.UPDATE(id), payload);

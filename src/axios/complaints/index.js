import api from "../api";
import { COMPLAINT_ENDPOINTS } from "../endpoint";

// Super Admin
export const getAdminComplaints = async (params = {}) => {
  const response = await api.get(COMPLAINT_ENDPOINTS.ADMIN_LIST, { params });
  return response.data;
};

export const getAdminComplaintDetails = async (id) => {
  const response = await api.get(COMPLAINT_ENDPOINTS.ADMIN_DETAILS(id));
  return response.data;
};

export const updateAdminComplaintStatus = async (id, payload) => {
  const response = await api.patch(COMPLAINT_ENDPOINTS.ADMIN_UPDATE_STATUS(id), payload);
  return response.data;
};

// Tenant / Business Portal
export const getTenantComplaints = async (params = {}) => {
  const response = await api.get(COMPLAINT_ENDPOINTS.TENANT_LIST, { params });
  return response.data;
};

export const createTenantComplaint = async (payload) => {
  const response = await api.post(COMPLAINT_ENDPOINTS.TENANT_CREATE, payload);
  return response.data;
};

export const getTenantComplaintDetails = async (id) => {
  const response = await api.get(COMPLAINT_ENDPOINTS.TENANT_DETAILS(id));
  return response.data;
};

export const updateTenantComplaintStatus = async (id, payload) => {
  const response = await api.patch(COMPLAINT_ENDPOINTS.TENANT_UPDATE_STATUS(id), payload);
  return response.data;
};

// Laundry Portal
export const getLaundryComplaints = async (params = {}) => {
  const response = await api.get(COMPLAINT_ENDPOINTS.LAUNDRY_LIST, { params });
  return response.data;
};

export const createLaundryComplaint = async (payload) => {
  const response = await api.post(COMPLAINT_ENDPOINTS.LAUNDRY_CREATE, payload);
  return response.data;
};

export const getLaundryComplaintDetails = async (id) => {
  const response = await api.get(COMPLAINT_ENDPOINTS.LAUNDRY_DETAILS(id));
  return response.data;
};

export const updateLaundryComplaintStatus = async (id, payload) => {
  const response = await api.patch(COMPLAINT_ENDPOINTS.LAUNDRY_UPDATE_STATUS(id), payload);
  return response.data;
};

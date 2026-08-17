import api from "../api";
import {
  LAUNDRY_ACCESS_SECTION_ENDPOINTS,
  LAUNDRY_STAFF_ENDPOINTS,
  LAUNDRY_STAFF_ROLE_ENDPOINTS,
} from "../endpoint";

export const createLaundryStaff = (payload) =>
  api.post(LAUNDRY_STAFF_ENDPOINTS.CREATE, payload, { timeout: 15000 });

export const getLaundryStaff = (params = {}) =>
  api.get(LAUNDRY_STAFF_ENDPOINTS.LIST, { params, timeout: 15000 });

export const getLaundryStaffOptions = (params = {}) =>
  api.get(LAUNDRY_STAFF_ENDPOINTS.OPTIONS, { params, timeout: 15000 });

export const getLaundryStaffDetails = (id) =>
  api.get(LAUNDRY_STAFF_ENDPOINTS.DETAILS(id), { timeout: 15000 });

export const updateLaundryStaff = (id, payload) =>
  api.put(LAUNDRY_STAFF_ENDPOINTS.UPDATE(id), payload, { timeout: 15000 });

export const updateLaundryStaffStatus = (id, status) =>
  api.put(
    LAUNDRY_STAFF_ENDPOINTS.UPDATE_STATUS(id),
    { status },
    { timeout: 15000 },
  );

export const verifyLaundryStaffEmail = (token) =>
  api.get(LAUNDRY_STAFF_ENDPOINTS.VERIFY_EMAIL, {
    params: { token },
    timeout: 15000,
  });

export const createLaundryStaffRole = (payload) =>
  api.post(LAUNDRY_STAFF_ROLE_ENDPOINTS.CREATE, payload, { timeout: 15000 });

export const getLaundryStaffRoles = (params = {}) => {
  const { keywords, status, accessLevel } = params;

  return api.get(LAUNDRY_STAFF_ROLE_ENDPOINTS.LIST, {
    params: {
      ...(keywords ? { keywords } : {}),
      ...(status ? { status } : {}),
      ...(accessLevel ? { accessLevel } : {}),
    },
    timeout: 15000,
  });
};

export const getLaundryStaffRoleDetails = (id) =>
  api.get(LAUNDRY_STAFF_ROLE_ENDPOINTS.DETAILS(id), { timeout: 15000 });

export const updateLaundryStaffRole = (id, payload) =>
  api.put(LAUNDRY_STAFF_ROLE_ENDPOINTS.UPDATE(id), payload, {
    timeout: 15000,
  });

export const updateLaundryStaffRoleStatus = (id, status) =>
  api.put(
    LAUNDRY_STAFF_ROLE_ENDPOINTS.UPDATE_STATUS(id),
    { status },
    { timeout: 15000 },
  );

export const getLaundryAccessSections = () =>
  api.get(LAUNDRY_ACCESS_SECTION_ENDPOINTS.LIST, { timeout: 15000 });

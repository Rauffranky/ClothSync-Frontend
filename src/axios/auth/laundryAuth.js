import api from "../api";
import { LAUNDRY_AUTH_ENDPOINTS } from "../endpoint";

export const loginLaundry = ({ email, password }) =>
  api.post(LAUNDRY_AUTH_ENDPOINTS.LOGIN, {
    email: email.trim(),
    password,
  });

export const logoutLaundry = () => api.get(LAUNDRY_AUTH_ENDPOINTS.LOGOUT);

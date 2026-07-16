import api from "../api";
import { LAUNDRY_AUTH_ENDPOINTS } from "../endpoint";

export const loginLaundry = ({ email, password }) =>
  api.post(LAUNDRY_AUTH_ENDPOINTS.LOGIN, {
    email: email.trim(),
    password,
  });

export const logoutLaundry = () => api.get(LAUNDRY_AUTH_ENDPOINTS.LOGOUT);

export const signupLaundry = ({ fullName, email, password, confirmPassword }) =>
  api.post(LAUNDRY_AUTH_ENDPOINTS.SIGNUP, {
    fullName: fullName.trim(),
    email: email.trim(),
    password,
    confirmPassword,
  });

export const verifyLaundrySignupOtp = ({ email, otp }) =>
  api.post(LAUNDRY_AUTH_ENDPOINTS.VERIFY_OTP, {
    email: email.trim(),
    otp: otp.trim(),
  });

export const resendLaundrySignupOtp = ({ email }) =>
  api.post(LAUNDRY_AUTH_ENDPOINTS.RESEND_OTP, {
    email: email.trim(),
  });

export const completeLaundryProfile = ({
  userId,
  companyName,
  contactPersonName,
  password,
  confirmPassword,
  phone,
  address,
  city,
  state,
  country,
  postalCode,
  avatar,
}) =>
  api.post(LAUNDRY_AUTH_ENDPOINTS.COMPLETE_PROFILE, {
    userId,
    companyName: companyName.trim(),
    contactPersonName: contactPersonName.trim(),
    password,
    confirmPassword,
    phone: phone.trim(),
    address: address.trim(),
    city: city.trim(),
    state: state.trim(),
    country: country.trim(),
    postalCode: postalCode.trim(),
    ...(avatar && { avatar }),
  });

export const forgotLaundryPassword = ({ email }) =>
  api.post(LAUNDRY_AUTH_ENDPOINTS.FORGOT_PASSWORD, {
    email: email.trim(),
  });

export const verifyLaundryForgotPasswordOtp = ({ email, otp }) =>
  api.post(LAUNDRY_AUTH_ENDPOINTS.VERIFY_FORGOT_PASSWORD_OTP, {
    email: email.trim(),
    otp: otp.trim(),
  });

export const resetLaundryPassword = ({ email, otp, password, confirmPassword }) =>
  api.post(LAUNDRY_AUTH_ENDPOINTS.RESET_PASSWORD, {
    email: email.trim(),
    otp: otp.trim(),
    password,
    confirmPassword,
  });

export const changeLaundryPassword = ({ currentPassword, newPassword, confirmNewPassword }) =>
  api.post(LAUNDRY_AUTH_ENDPOINTS.CHANGE_PASSWORD, {
    currentPassword,
    newPassword,
    confirmNewPassword,
  });

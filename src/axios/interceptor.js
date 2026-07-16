import axios from "axios";
import {
  clearTenantSession,
  getTenantAccessToken,
} from "./auth/tenantSession";

const getPortalLoginPath = (pathname) => {
  if (pathname.startsWith("/laundry")) return "/laundry/login";
  if (pathname.startsWith("/superadmin")) return "/superadmin/login";
  return "/business/login";
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const isLaundryApi = config.url?.includes("/laundry");
    const token = isLaundryApi 
      ? localStorage.getItem("laundry_access_token") // Replace with actual laundry token getter when available
      : getTenantAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isUnauthorized = error?.response?.status === 401;
    const hasActiveSession = Boolean(getTenantAccessToken());

    if (isUnauthorized && hasActiveSession) {
      clearTenantSession();

      if (typeof window !== "undefined") {
        const loginPath = getPortalLoginPath(window.location.pathname);

        if (window.location.pathname !== loginPath) {
          window.location.replace(loginPath);
        }
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;

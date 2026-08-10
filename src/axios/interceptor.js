import axios from "axios";
import {
  clearAuthSession,
  getAuthAccessToken,
} from "./auth/authSession";

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
    const token = getAuthAccessToken();

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
    const responseMessage = String(
      error?.response?.data?.message ?? error?.response?.data?.error ?? "",
    ).toLowerCase();
    const hasUnauthorizedMessage = responseMessage.includes(
      "unauthorized access",
    );
    const hasActiveSession = Boolean(getAuthAccessToken());

    if ((isUnauthorized || hasUnauthorizedMessage) && hasActiveSession) {
      clearAuthSession();

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

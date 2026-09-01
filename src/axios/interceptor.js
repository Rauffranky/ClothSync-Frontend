import axios from "axios";
import {
  clearAuthSession,
  getAuthAccessToken,
  storeAuthSessionFromResponse,
} from "./auth/authSession";
import { AUTH_ENDPOINTS } from "./endpoint";

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

let refreshRequest = null;

const refreshAccessToken = async () => {
  const sessionId = sessionStorage.getItem("sessionId");
  const refreshToken = sessionStorage.getItem("refreshToken");
  if (!sessionId || !refreshToken) throw new Error("Refresh session is missing");

  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL || ""}${AUTH_ENDPOINTS.REFRESH}`,
    { sessionId, refreshToken },
    { headers: { "Content-Type": "application/json" } },
  );
  const accessToken = storeAuthSessionFromResponse(response.data);
  if (!accessToken) throw new Error("Refresh response did not contain an access token");
  return accessToken;
};

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
  async (error) => {
    const isUnauthorized = error?.response?.status === 401;
    const responseMessage = String(
      error?.response?.data?.message ?? error?.response?.data?.error ?? "",
    ).toLowerCase();
    const hasUnauthorizedMessage = responseMessage.includes(
      "unauthorized access",
    );
    const hasActiveSession = Boolean(getAuthAccessToken());

    if ((isUnauthorized || hasUnauthorizedMessage) && hasActiveSession && error.config && !error.config._retry && sessionStorage.getItem("refreshToken")) {
      error.config._retry = true;
      try {
        if (!refreshRequest) refreshRequest = refreshAccessToken().finally(() => { refreshRequest = null; });
        const newToken = await refreshRequest;
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient.request(error.config);
      } catch (refreshError) {
        clearAuthSession();
        if (typeof window !== "undefined") window.location.replace(getPortalLoginPath(window.location.pathname));
        return Promise.reject(refreshError);
      }
    }

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

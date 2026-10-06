import apiClient from "./interceptor";
import { getAuthAccessToken } from "./auth/authSession";

const request = async (config) => {
  const response = await apiClient.request(config);
  const correlationId = response.headers?.["x-correlation-id"];
  if (!correlationId || !response.data || typeof response.data !== "object" || Array.isArray(response.data)) {
    return response.data;
  }
  return { ...response.data, correlationId };
};

const pendingGetRequests = new Map();

const getRequestKey = (url, config) =>
  JSON.stringify({
    url,
    params: config.params || {},
    headers: config.headers || {},
    responseType: config.responseType || "json",
    accessToken: getAuthAccessToken() || "",
  });

const get = (url, config = {}) => {
  const requestConfig = { ...config };
  delete requestConfig.dedupe;

  if (config.signal || config.dedupe === false) {
    return request({ ...requestConfig, method: "GET", url });
  }

  const requestKey = getRequestKey(url, config);
  const pendingRequest = pendingGetRequests.get(requestKey);
  if (pendingRequest) return pendingRequest;

  const nextRequest = request({ ...requestConfig, method: "GET", url }).finally(
    () => {
      pendingGetRequests.delete(requestKey);
    },
  );

  pendingGetRequests.set(requestKey, nextRequest);
  return nextRequest;
};

export const api = {
  get,
  post: (url, data, config = {}) =>
    request({ ...config, method: "POST", url, data }),
  put: (url, data, config = {}) =>
    request({ ...config, method: "PUT", url, data }),
  patch: (url, data, config = {}) =>
    request({ ...config, method: "PATCH", url, data }),
  delete: (url, config = {}) => request({ ...config, method: "DELETE", url }),
};

export const getApiErrorMessage = (error, fallbackMessage = "Something went wrong") => {
  const data = error?.response?.data;

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    const firstErr = data.errors[0];
    const errMsg = typeof firstErr === "string" ? firstErr : firstErr?.message;
    if (errMsg) {
      return errMsg.replace(/^"([^"]+)"/, (_, field) => field.charAt(0).toUpperCase() + field.slice(1));
    }
  }

  if (data?.errors && typeof data.errors === "object" && !Array.isArray(data.errors)) {
    const firstKey = Object.keys(data.errors)[0];
    const val = data.errors[firstKey];
    if (typeof val === "string") return val;
    if (Array.isArray(val) && val[0]) return String(val[0]);
  }

  return (
    data?.message ||
    data?.error ||
    error?.message ||
    fallbackMessage
  );
};

export default api;

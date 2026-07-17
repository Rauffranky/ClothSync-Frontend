import apiClient from "./interceptor";
import { getAuthAccessToken } from "./auth/authSession";

const request = async (config) => {
  const response = await apiClient.request(config);
  return response.data;
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

export const getApiErrorMessage = (error, fallbackMessage = "Something went wrong") =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallbackMessage;

export default api;

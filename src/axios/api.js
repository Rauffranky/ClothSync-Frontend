import apiClient from "./interceptor";

const request = async (config) => {
  const response = await apiClient.request(config);
  return response.data;
};

export const api = {
  get: (url, config = {}) => request({ ...config, method: "GET", url }),
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

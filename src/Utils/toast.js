const listeners = new Set();

export function subscribeToast(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitToast(payload) {
  listeners.forEach((listener) => listener(payload));
}

function createToast(type, message, options = {}) {
  const toastItem = {
    id: options.id || `${Date.now()}-${Math.random()}`,
    type,
    message,
    description: options.description,
    duration: options.duration ?? 3500,
    ...options,
  };

  emitToast(toastItem);
  return toastItem.id;
}

export const toast = {
  show: (message, options) => createToast(options?.type || "default", message, options),
  success: (message, options) => createToast("success", message, options),
  error: (message, options) => createToast("error", message, options),
  warning: (message, options) => createToast("warning", message, options),
  info: (message, options) => createToast("info", message, options),
  loading: (message, options) => createToast("loading", message, { duration: 0, ...options }),
  scannerStart: (options = {}) =>
    createToast("scanner-start", options.message || "Scanner Active & Scanning", {
      id: options.id || "scanner-session-toast",
      duration: 0,
      startTime: options.startTime || new Date().toISOString(),
      formattedTime: options.formattedTime || "",
      scannerName: options.scannerName || "",
      description: options.description,
      ...options,
    }),
  scannerStop: (options = {}) =>
    createToast("scanner-stop", options.message || "Scanner Stopped", {
      id: options.id || "scanner-session-toast",
      duration: 5000,
      stopTime: options.stopTime || new Date().toISOString(),
      formattedTime: options.formattedTime || "",
      totalDuration: options.totalDuration || "",
      scannerName: options.scannerName || "",
      description: options.description,
      ...options,
    }),
  dismiss: (id) => emitToast({ id, dismiss: true }),
};

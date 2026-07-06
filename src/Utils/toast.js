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
  dismiss: (id) => emitToast({ id, dismiss: true }),
};

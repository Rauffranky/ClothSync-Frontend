import { io } from "socket.io-client";
import {
  AUTH_SESSION_CHANGED_EVENT,
  getAuthAccessToken,
  getAuthSessionUser,
  clearAuthSession,
} from "../axios/auth/authSession";
import { toast } from "../Utils/toast";

const getSocketUrl = () => {
  const configuredUrl = import.meta.env.VITE_SOCKET_URL?.trim();
  if (configuredUrl) return configuredUrl;

  const apiUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!apiUrl) return undefined;

  try {
    return new URL(apiUrl, window.location.origin).origin;
  } catch {
    return apiUrl.replace(/\/api\/?$/, "");
  }
};

const parseJwt = (token) => {
  if (!token || typeof token !== "string") return null;
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const isSocketAllowed = () => {
  const token = getAuthAccessToken();
  if (!token) return false;

  const user = getAuthSessionUser();
  const decoded = parseJwt(token);
  const role = user?.role || decoded?.role;

  // Realtime sockets are only for tenant and laundry portals; super_admin handshakes are rejected with 400
  if (role === "super_admin" || role === "admin_sub_admin") {
    return false;
  }

  return true;
};

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(getSocketUrl(), {
      autoConnect: false,
      transports: ["websocket", "polling"],
      auth: (callback) => {
        const token = getAuthAccessToken();
        callback(token ? { token, accessToken: token } : {});
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 5_000,
      timeout: 10_000,
    });

    socket.on("connect_error", (err) => {
      if (
        err?.message === "common.unauthorized" ||
        err?.message === "auth.invalidToken" ||
        err?.message === "auth.tokenMissing" ||
        err?.message === "auth.sessionRevoked"
      ) {
        socket.disconnect();
      }
    });

    socket.on("auth.session_revoked", (payload) => {
      const currentSessionId = sessionStorage.getItem("sessionId");
      if (payload?.all || (payload?.sessionId && String(payload.sessionId) === String(currentSessionId))) {
        clearAuthSession();
        toast.error("Your session was terminated from another device");
        const path = typeof window !== "undefined" ? window.location.pathname : "";
        const loginPath = path.startsWith("/laundry")
          ? "/laundry/login"
          : path.startsWith("/superadmin")
          ? "/superadmin/login"
          : "/business/login";
        if (typeof window !== "undefined" && window.location.pathname !== loginPath) {
          window.location.replace(loginPath);
        }
      }
    });
  }

  return socket;
};

export const connectSocket = () => {
  const activeSocket = getSocket();

  if (!isSocketAllowed()) {
    if (activeSocket.connected) activeSocket.disconnect();
    return activeSocket;
  }

  if (!activeSocket.connected) activeSocket.connect();
  return activeSocket;
};

export const disconnectSocket = () => {
  if (socket?.connected) socket.disconnect();
};

export const startSocketConnection = () => {
  connectSocket();

  const syncConnectionWithAuth = () => {
    if (getAuthAccessToken()) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  };

  window.addEventListener(
    AUTH_SESSION_CHANGED_EVENT,
    syncConnectionWithAuth,
  );

  let lastCheckTime = 0;
  const handleWindowFocus = () => {
    if (!getAuthAccessToken()) return;
    connectSocket();

    const now = Date.now();
    if (now - lastCheckTime < 3000) return; // Debounce checks within 3 seconds
    lastCheckTime = now;

    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    let endpoint = "";
    if (pathname.startsWith("/laundry")) endpoint = "/laundry-auth/me";
    else if (pathname.startsWith("/superadmin")) endpoint = "/admin-auth/me";
    else if (pathname.startsWith("/business")) endpoint = "/tenant-auth/me";

    if (endpoint) {
      import("../axios/interceptor").then(({ default: apiClient }) => {
        apiClient.get(endpoint).catch(() => {});
      });
    }
  };

  window.addEventListener("focus", handleWindowFocus);
  document.addEventListener("visibilitychange", handleWindowFocus);

  return () => {
    window.removeEventListener(
      AUTH_SESSION_CHANGED_EVENT,
      syncConnectionWithAuth,
    );
    window.removeEventListener("focus", handleWindowFocus);
    document.removeEventListener("visibilitychange", handleWindowFocus);
    disconnectSocket();
  };
};

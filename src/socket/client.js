import { io } from "socket.io-client";
import {
  AUTH_SESSION_CHANGED_EVENT,
  getAuthAccessToken,
  getAuthSessionUser,
} from "../axios/auth/authSession";

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
        err?.message === "auth.tokenMissing"
      ) {
        socket.disconnect();
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

  return () => {
    window.removeEventListener(
      AUTH_SESSION_CHANGED_EVENT,
      syncConnectionWithAuth,
    );
    disconnectSocket();
  };
};

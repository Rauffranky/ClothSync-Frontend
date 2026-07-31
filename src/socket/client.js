import { io } from "socket.io-client";
import {
  AUTH_SESSION_CHANGED_EVENT,
  getAuthAccessToken,
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

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(getSocketUrl(), {
      autoConnect: false,
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
  }

  return socket;
};

export const connectSocket = () => {
  const token = getAuthAccessToken();
  const activeSocket = getSocket();

  if (!token) {
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

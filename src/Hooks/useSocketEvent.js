import { useEffect } from "react";
import { getSocket } from "../socket/client";

const useSocketEvent = (eventName, handler, enabled = true) => {
  useEffect(() => {
    if (!enabled || !eventName || typeof handler !== "function") {
      return undefined;
    }

    const socket = getSocket();
    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
    };
  }, [enabled, eventName, handler]);
};

export default useSocketEvent;

export const useSocketEvents = (eventNames, handler, enabled = true) => {
  useEffect(() => {
    if (
      !enabled ||
      !Array.isArray(eventNames) ||
      eventNames.length === 0 ||
      typeof handler !== "function"
    ) {
      return undefined;
    }

    const socket = getSocket();
    eventNames.forEach((eventName) => socket.on(eventName, handler));

    return () => {
      eventNames.forEach((eventName) => socket.off(eventName, handler));
    };
  }, [enabled, eventNames, handler]);
};

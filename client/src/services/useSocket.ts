import { useEffect } from "react";
import { connectSocket, disconnectSocket } from "./socket";
import { useAuth } from "@/modules/auth/hooks/useAuth";

export function useSocket() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const socket = connectSocket(token);
        return () => {
          socket.disconnect();
        };
      }
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated]);
}

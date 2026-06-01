import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectSocket, disconnectSocket, getSocket } from "./socket";
import { useAuth } from "@/modules/auth/hooks/useAuth";

export function useSocket() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("social_access_token");
      if (token) {
        const socket = connectSocket(token);

        socket.on("notification", () => {
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
        });

        socket.on("message", () => {
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        });

        return () => {
          socket.off("notification");
          socket.off("message");
          socket.disconnect();
        };
      }
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated]);
}

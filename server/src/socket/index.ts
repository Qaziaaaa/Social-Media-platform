import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { prisma } from "../database/prisma";

let io: Server;

export function setupSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, cb) => {
        const allowed = !origin || /^http:\/\/localhost:51(7[3-9]|8[0-2])$/.test(origin);
        cb(null, allowed);
      },
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const secret = process.env.JWT_SECRET || "dev-secret";
      const payload = jwt.verify(token, secret) as { userId: string };
      (socket as any).userId = payload.userId;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = (socket as any).userId;
    socket.join(`user:${userId}`);

    const conversations = await prisma.conversationParticipant.findMany({
      where: { userId },
      select: { conversationId: true },
    });

    for (const c of conversations) {
      socket.join(`conversation:${c.conversationId}`);
    }

    socket.on("disconnect", () => {
      // cleanup handled automatically
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

export function emitNotification(userId: string, notification: any) {
  if (io) {
    io.to(`user:${userId}`).emit("notification", notification);
  }
}

export function emitMessage(conversationId: string, message: any, participantIds: string[]) {
  if (io) {
    for (const pid of participantIds) {
      io.to(`user:${pid}`).emit("message", { conversationId, message });
    }
  }
}

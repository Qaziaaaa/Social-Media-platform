import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";
import { createServer } from "http";
import { errorHandler } from "./middleware/errorHandler";
import { setupSocket } from "./socket";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import updateRoutes from "./modules/updates/update.routes";
import commentRoutes from "./modules/comments/comment.routes";
import likeRoutes from "./modules/likes/like.routes";
import followRoutes from "./modules/follows/follow.routes";
import uploadRoutes from "./modules/upload/upload.routes";
import searchRoutes from "./modules/search/search.routes";
import hashtagRoutes from "./modules/hashtags/hashtag.routes";
import bookmarkRoutes from "./modules/bookmarks/bookmark.routes";
import notificationRoutes from "./modules/notifications/notification.routes";
import messageRoutes from "./modules/messages/message.routes";
import reportRoutes from "./modules/reports/report.routes";
import storyRoutes from "./modules/stories/story.routes";
import blockRoutes from "./modules/blocks/block.routes";
import projectRoutes from "./modules/projects/project.routes";
import milestoneRoutes from "./modules/milestones/milestone.routes";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
const devOrigins = Array.from({ length: 10 }, (_, i) => `http://localhost:${5173 + i}`);
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? process.env.CLIENT_URL
    : devOrigins,
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

app.get("/api/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/updates", updateRoutes);
app.use("/api", commentRoutes);
app.use("/api", likeRoutes);
app.use("/api", followRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/hashtags", hashtagRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api", reportRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api", blockRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/milestones", milestoneRoutes);

app.use(errorHandler);

setupSocket(httpServer);

import { cleanupExpiredStories } from "./modules/stories/story.service";
setInterval(() => {
  cleanupExpiredStories().catch(() => {});
}, 15 * 60 * 1000);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

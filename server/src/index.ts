import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import postRoutes from "./modules/posts/post.routes";
import commentRoutes from "./modules/comments/comment.routes";
import likeRoutes from "./modules/likes/like.routes";
import followRoutes from "./modules/follows/follow.routes";
import uploadRoutes from "./modules/upload/upload.routes";
import searchRoutes from "./modules/search/search.routes";
import hashtagRoutes from "./modules/hashtags/hashtag.routes";
import bookmarkRoutes from "./modules/bookmarks/bookmark.routes";

const app = express();
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
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

app.get("/api/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api", commentRoutes);
app.use("/api", likeRoutes);
app.use("/api", followRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/hashtags", hashtagRoutes);
app.use("/api/bookmarks", bookmarkRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./lib/env";
import { db } from "./lib/db";
import { errorHandler } from "./middleware/errorHandler";
import { generalLimiter } from "./middleware/rateLimiter";
import { requireAuth } from "./middleware/auth.middleware";
import { authRouter } from "./routes/auth.router";
import { sectionsRouter } from "./routes/sections.router";
import { stickersRouter } from "./routes/stickers.router";
import { statsRouter } from "./routes/stats.router";
import { ocrRouter } from "./routes/ocr.router";
import { matchesRouter } from "./routes/matches.router";

const app = express();

// Required behind reverse proxies (Render, Railway) for correct client IP in rate limiter
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(generalLimiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", ts: Date.now() });
});

app.use("/api/auth", authRouter);

app.use("/api/sections", requireAuth, sectionsRouter);
app.use("/api/stickers", requireAuth, stickersRouter);
app.use("/api/stats", requireAuth, statsRouter);
app.use("/api/ocr", requireAuth, ocrRouter);
app.use("/api/matches", requireAuth, matchesRouter);

app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
});

function shutdown() {
  console.log("Shutting down gracefully…");
  server.close(async () => {
    await db.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

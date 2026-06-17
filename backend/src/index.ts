import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./lib/env";
import { errorHandler } from "./middleware/errorHandler";
import { generalLimiter } from "./middleware/rateLimiter";
import { requireAuth } from "./middleware/auth.middleware";
import { authRouter } from "./routes/auth.router";
import { sectionsRouter } from "./routes/sections.router";
import { stickersRouter } from "./routes/stickers.router";
import { statsRouter } from "./routes/stats.router";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(generalLimiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", ts: Date.now() });
});

app.use("/api/auth", authRouter);

app.use("/api/sections", requireAuth, sectionsRouter);
app.use("/api/stickers", requireAuth, stickersRouter);
app.use("/api/stats", requireAuth, statsRouter);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});

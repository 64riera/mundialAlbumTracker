import express from "express";
import cors from "cors";
import { env } from "./lib/env";
import { errorHandler } from "./middleware/errorHandler";
import { sectionsRouter } from "./routes/sections.router";
import { stickersRouter } from "./routes/stickers.router";
import { statsRouter } from "./routes/stats.router";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", ts: Date.now() });
});

app.use("/api/sections", sectionsRouter);
app.use("/api/stickers", stickersRouter);
app.use("/api/stats", statsRouter);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});

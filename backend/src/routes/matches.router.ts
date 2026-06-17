import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  getMatches,
  getMatchesByDate,
  getTodayMatches,
  getStandings,
  hasLiveMatches,
} from "../services/matches.service";

export const matchesRouter = Router();

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

matchesRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dateParam = req.query.date as string | undefined;

      if (dateParam) {
        const parsed = dateSchema.safeParse(dateParam);
        if (!parsed.success) {
          res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
          return;
        }
        const matches = await getMatchesByDate(parsed.data);
        res.json({ matches, hasLive: hasLiveMatches() });
        return;
      }

      const matches = await getMatches();
      res.json({ matches, hasLive: hasLiveMatches() });
    } catch (err) {
      next(err);
    }
  }
);

matchesRouter.get(
  "/today",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const matches = await getTodayMatches();
      res.json({ matches, hasLive: hasLiveMatches() });
    } catch (err) {
      next(err);
    }
  }
);

matchesRouter.get(
  "/standings",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const standings = await getStandings();
      res.json({ standings });
    } catch (err) {
      next(err);
    }
  }
);

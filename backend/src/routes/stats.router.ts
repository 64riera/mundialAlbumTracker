import { Router, Request, Response, NextFunction } from "express";
import * as statsService from "../services/stats.service";

export const statsRouter = Router();

statsRouter.get("/overview", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await statsService.getOverview();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

statsRouter.get("/by-section", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await statsService.getBySection();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

statsRouter.get("/duplicates", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const duplicates = await statsService.getDuplicates();
    res.json(duplicates);
  } catch (err) {
    next(err);
  }
});

import { Router, Request, Response, NextFunction } from "express";
import * as statsService from "../services/stats.service";

export const statsRouter = Router();

statsRouter.get("/overview", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await statsService.getOverview(req.userId!);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

statsRouter.get("/by-section", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await statsService.getBySection(req.userId!);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

statsRouter.get("/duplicates", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const duplicates = await statsService.getDuplicates(req.userId!);
    res.json(duplicates);
  } catch (err) {
    next(err);
  }
});

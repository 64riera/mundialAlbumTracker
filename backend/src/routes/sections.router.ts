import { Router, Request, Response, NextFunction } from "express";
import * as sectionsService from "../services/sections.service";

export const sectionsRouter = Router();

sectionsRouter.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const sections = await sectionsService.getAllSections();
    res.json(sections);
  } catch (err) {
    next(err);
  }
});

sectionsRouter.get("/:code", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const section = await sectionsService.getSectionByCode(req.params.code.toUpperCase());
    if (!section) return res.status(404).json({ error: "Sección no encontrada" });
    res.json(section);
  } catch (err) {
    next(err);
  }
});

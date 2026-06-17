import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as stickersService from "../services/stickers.service";

export const stickersRouter = Router();

const statusSchema = z.enum(["all", "owned", "missing", "duplicate"]).default("all");
const collectSchema = z.object({ quantity: z.number().int().min(0) });
const bulkSchema = z.object({ numbers: z.array(z.number().int().positive()) });
const bulkCodesSchema = z.object({ codes: z.array(z.string().min(1)).min(1) });
const searchQuerySchema = z.string().min(1).max(50);

stickersRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = statusSchema.parse(req.query.status);
    const stickers = await stickersService.getStickers(req.userId!, status);
    res.json(stickers);
  } catch (err) {
    next(err);
  }
});

stickersRouter.get("/search", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = searchQuerySchema.parse(req.query.q);
    const results = await stickersService.searchStickers(q, req.userId!);
    res.json(results);
  } catch (err) {
    next(err);
  }
});

stickersRouter.get("/:number", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const number = z.coerce.number().int().positive().parse(req.params.number);
    const sticker = await stickersService.getStickerByNumber(number, req.userId!);
    res.json(sticker);
  } catch (err) {
    next(err);
  }
});

stickersRouter.patch("/:number/collect", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const number = z.coerce.number().int().positive().parse(req.params.number);
    const { quantity } = collectSchema.parse(req.body);
    const result = await stickersService.updateQuantity(number, quantity, req.userId!);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

stickersRouter.post("/bulk-collect", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { numbers } = bulkSchema.parse(req.body);
    const result = await stickersService.bulkCollect(numbers, req.userId!);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

const importSchema = z.object({
  codes: z.array(z.string().min(1)).min(1).max(2000),
});

stickersRouter.post("/import", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { codes } = importSchema.parse(req.body);
    const result = await stickersService.importAlbum(codes, req.userId!);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

stickersRouter.post("/bulk-collect-codes", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { codes } = bulkCodesSchema.parse(req.body);
    const result = await stickersService.bulkCollectByCodes(codes, req.userId!);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as stickersService from "../services/stickers.service";

export const stickersRouter = Router();

const statusSchema = z.enum(["all", "owned", "missing", "duplicate"]).default("all");
const collectSchema = z.object({ quantity: z.number().int().min(0) });
const bulkSchema = z.object({ numbers: z.array(z.number().int().positive()) });

stickersRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = statusSchema.parse(req.query.status);
    const stickers = await stickersService.getStickers(status);
    res.json(stickers);
  } catch (err) {
    next(err);
  }
});

stickersRouter.get("/:number", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const number = z.coerce.number().int().positive().parse(req.params.number);
    const sticker = await stickersService.getStickerByNumber(number);
    res.json(sticker);
  } catch (err) {
    next(err);
  }
});

stickersRouter.patch("/:number/collect", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const number = z.coerce.number().int().positive().parse(req.params.number);
    const { quantity } = collectSchema.parse(req.body);
    const result = await stickersService.updateQuantity(number, quantity);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

stickersRouter.post("/bulk-collect", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { numbers } = bulkSchema.parse(req.body);
    const result = await stickersService.bulkCollect(numbers);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

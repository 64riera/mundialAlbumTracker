import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { recognizeSticker } from "../services/ocr.service";
import rateLimit from "express-rate-limit";

export const ocrRouter = Router();

const ocrLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  message: { error: "Too many OCR requests" },
});

const bodySchema = z.object({
  image: z.string().min(100).max(10_000_000),
});

ocrRouter.post("/recognize", ocrLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { image } = bodySchema.parse(req.body);
    const result = await recognizeSticker(image);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

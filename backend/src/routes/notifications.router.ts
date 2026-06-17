import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  subscribe,
  unsubscribe,
  getPreferences,
  updatePreferences,
  getSubscriptionCount,
} from "../services/notification.service";
import { env } from "../lib/env";

export const notificationsRouter = Router();

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

const preferencesSchema = z.object({
  matchStart: z.boolean().optional(),
  goals: z.boolean().optional(),
  lang: z.enum(["es", "en"]).optional(),
});

notificationsRouter.get(
  "/vapid-key",
  (_req: Request, res: Response) => {
    const key = env.VAPID_PUBLIC_KEY ?? null;
    res.json({ vapidPublicKey: key });
  }
);

notificationsRouter.post(
  "/subscribe",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = subscriptionSchema.parse(req.body);
      await subscribe(req.userId!, data);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
);

notificationsRouter.post(
  "/unsubscribe",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { endpoint } = z.object({ endpoint: z.string() }).parse(req.body);
      await unsubscribe(req.userId!, endpoint);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
);

notificationsRouter.get(
  "/preferences",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const prefs = await getPreferences(req.userId!);
      const subCount = await getSubscriptionCount(req.userId!);
      res.json({ ...prefs, subscribed: subCount > 0 });
    } catch (err) {
      next(err);
    }
  }
);

notificationsRouter.patch(
  "/preferences",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = preferencesSchema.parse(req.body);
      const prefs = await updatePreferences(req.userId!, data);
      res.json(prefs);
    } catch (err) {
      next(err);
    }
  }
);

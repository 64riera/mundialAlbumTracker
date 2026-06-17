import { Router, Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { requireAuth } from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/rateLimiter";

export const authRouter = Router();

const REFRESH_COOKIE = "refresh_token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

authRouter.post("/register", authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = authService.registerSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await authService.register(input);
    res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
    res.status(201).json({ user, accessToken });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = authService.loginSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await authService.login(input);
    res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
    res.json({ user, accessToken });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/refresh", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) {
      return res.status(401).json({ error: "Refresh token no encontrado" });
    }
    const { accessToken } = authService.refreshAccessToken(token);
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie(REFRESH_COOKIE, { path: "/" });
  res.json({ message: "Sesión cerrada" });
});

authRouter.get("/me", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getProfile(req.userId!);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

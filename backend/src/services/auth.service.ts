import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "../lib/db";
import { env } from "../lib/env";
import { AppError } from "../middleware/errorHandler";

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export const registerSchema = z.object({
  email: z.string().email("Email inválido").max(255).toLowerCase(),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(128)
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100).trim(),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(100).trim(),
  phone: z
    .string()
    .min(7, "Teléfono inválido")
    .max(20)
    .regex(/^\+?[\d\s\-()]+$/, "Formato de teléfono inválido"),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido").toLowerCase(),
  password: z.string().min(1, "La contraseña es requerida"),
});

function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
  const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
  return { accessToken, refreshToken };
}

function sanitizeUser(user: { id: string; email: string; firstName: string; lastName: string; phone: string }) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
  };
}

export async function register(input: z.infer<typeof registerSchema>) {
  const existing = await db.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError(409, "Ya existe una cuenta con este email");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await db.user.create({
    data: {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
    },
  });

  const tokens = generateTokens(user.id);
  return { user: sanitizeUser(user), ...tokens };
}

export async function login(input: z.infer<typeof loginSchema>) {
  const user = await db.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AppError(401, "Credenciales inválidas");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, "Credenciales inválidas");
  }

  const tokens = generateTokens(user.id);
  return { user: sanitizeUser(user), ...tokens };
}

export function refreshAccessToken(refreshToken: string) {
  try {
    const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string };
    const accessToken = jwt.sign({ userId: payload.userId }, env.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
    return { accessToken };
  } catch {
    throw new AppError(401, "Refresh token inválido o expirado");
  }
}

export async function getProfile(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, "Usuario no encontrado");
  }
  return sanitizeUser(user);
}

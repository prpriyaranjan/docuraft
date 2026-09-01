import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

const authSecret = process.env.AUTH_SECRET || "docucraft-dev-secret";

export const AuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).optional(),
});

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: Record<string, unknown>) {
  return jwt.sign(payload, authSecret, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, authSecret) as { userId: string; email: string };
}

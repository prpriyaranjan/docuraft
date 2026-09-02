import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { allowFallbacks } from "@/lib/env";

const authSecret = process.env.AUTH_SECRET ?? (allowFallbacks ? "docucraft-dev-secret" : undefined);

// Delay throwing until the token functions are invoked so imports (e.g. during
// a build) don't fail when CI doesn't set AUTH_SECRET. Runtime callers will
// still get a clear error in production if the secret is missing.
const AUTH_SECRET = authSecret as string | undefined;

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
  if (!AUTH_SECRET) {
    throw new Error("AUTH_SECRET must be configured in production");
  }
  return jwt.sign(payload, AUTH_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  if (!AUTH_SECRET) {
    throw new Error("AUTH_SECRET must be configured in production");
  }
  return jwt.verify(token, AUTH_SECRET) as { userId: string; email: string };
}

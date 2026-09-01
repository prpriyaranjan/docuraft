import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signToken, verifyPassword } from "@/lib/auth";
import { authRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  // Apply rate limiting
  const rateLimitResult = authRateLimit(request as any);
  const headers = getRateLimitHeaders(rateLimitResult);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429, headers }
    );
  }

  try {
    const body = await request.json();
    const parsed = LoginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: parsed.email },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401, headers });
    }

    const valid = await verifyPassword(parsed.password, user.passwordHash);

    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401, headers });
    }

    const token = signToken({ userId: user.id, email: user.email });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    }, { headers });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 400, headers });
  }
}

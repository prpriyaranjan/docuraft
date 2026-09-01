import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthSchema, hashPassword, signToken } from "@/lib/auth";
import { authRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Apply rate limiting
  const rateLimitResult = authRateLimit(request as any);
  const headers = getRateLimitHeaders(rateLimitResult);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429, headers }
    );
  }

  try {
    const body = await request.json();
    const parsed = AuthSchema.parse(body);

    const DB_URL = process.env.DATABASE_URL ?? "";

    // If no DATABASE_URL is provided (preview/dev), don't fail — return a
    // transient in-memory user and token so previews remain usable.
    if (!DB_URL) {
      const user = {
        id: `dev_user_${Date.now()}`,
        email: parsed.email,
        name: parsed.name ?? parsed.email.split("@")[0],
      };

      const token = signToken({ userId: user.id, email: user.email });

      return NextResponse.json({ token, user }, { headers });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409, headers });
    }

    const passwordHash = await hashPassword(parsed.password);

    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        name: parsed.name ?? parsed.email.split("@")[0],
        passwordHash,
      },
    });

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
    return NextResponse.json({ error: "Registration failed" }, { status: 400, headers });
  }
}

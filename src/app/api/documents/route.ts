import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DocumentSchema = z.object({
  templateId: z.string().min(2),
  title: z.string().min(2),
  content: z.string().min(1),
  status: z.enum(["draft", "paid", "downloaded"]).default("draft").optional(),
  userId: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    const where = token
      ? (() => {
          const payload = verifyToken(token);
          return { userId: payload.userId };
        })()
      : {};

    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    return NextResponse.json({ documents });
  } catch {
    return NextResponse.json({ documents: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = DocumentSchema.parse(body);

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const userId = token ? verifyToken(token).userId : parsed.userId;

    const document = await prisma.document.create({
      data: {
        templateId: parsed.templateId,
        title: parsed.title,
        content: parsed.content,
        status: parsed.status ?? "draft",
        userId,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Document creation failed" }, { status: 400 });
  }
}

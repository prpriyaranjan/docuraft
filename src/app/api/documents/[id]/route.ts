import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const UpdateDocumentSchema = z.object({
  title: z.string().min(2).optional(),
  content: z.string().optional(),
  status: z.enum(["draft", "paid", "downloaded"]).optional(),
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const document = await prisma.document.findUnique({
    where: { id: params.id },
    include: { user: true },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json(document);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const parsed = UpdateDocumentSchema.parse(body);

    const document = await prisma.document.update({
      where: { id: params.id },
      data: parsed,
    });

    return NextResponse.json(document);
  } catch {
    return NextResponse.json({ error: "Document update failed" }, { status: 400 });
  }
}

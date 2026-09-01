import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const OrderSchema = z.object({
  userId: z.string().optional(),
  templateId: z.string().min(2),
  amount: z.number().positive(),
  paymentId: z.string().optional(),
  documentId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const payload = verifyToken(token);
    const body = await request.json();
    const parsed = OrderSchema.parse(body);

    const DB_URL = process.env.DATABASE_URL ?? "";

    // If no DB is configured (preview/dev), return a transient order object
    // instead of failing. If DB is present, persist as before.
    if (!DB_URL) {
      const order = {
        id: `dev_order_${Date.now()}`,
        userId: payload.userId,
        templateId: parsed.templateId,
        amount: parsed.amount,
        paymentId: parsed.paymentId ?? `dev_payment_${Date.now()}`,
        documentId: parsed.documentId ?? null,
        status: "paid",
      };

      return NextResponse.json(order, { status: 201 });
    }

    const order = await prisma.order.create({
      data: {
        userId: payload.userId,
        templateId: parsed.templateId,
        amount: parsed.amount,
        paymentId: parsed.paymentId,
        documentId: parsed.documentId,
        status: "paid",
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Order creation failed" }, { status: 400 });
  }
}

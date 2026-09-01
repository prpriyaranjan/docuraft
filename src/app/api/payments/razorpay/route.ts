import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createRazorpayOrder } from "@/lib/razorpay";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    verifyToken(token);

    const body = await request.json();
    const amount = Number(body?.amount ?? 0);
    const receipt = String(body?.receipt ?? `rcpt_${Date.now()}`);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Razorpay expects amount in paise
    const order = await createRazorpayOrder(Math.round(amount * 100), receipt);

    return NextResponse.json({ ok: true, order }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err ?? "Razorpay order failed");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

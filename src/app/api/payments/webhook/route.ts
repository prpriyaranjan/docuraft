import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const signature = request.headers.get("x-razorpay-signature") ?? "";

    if (!RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Razorpay secret not configured" }, { status: 500 });
    }

    const expected = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET).update(bodyText).digest("hex");

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(bodyText);

    // Handle payment captured events (simple scaffold)
    const data = payload?.payload ?? payload?.data ?? payload;

    // Attempt to extract payment/order ids
    const razorpayPayment = data?.payment?.entity ?? data?.payment ?? data?.order?.entity ?? data?.order ?? null;

    const paymentId = razorpayPayment?.id ?? razorpayPayment?.payment_id ?? null;
    const amount = razorpayPayment?.amount ?? null;
    const orderId = razorpayPayment?.order_id ?? null;

    if (paymentId) {
      // Create or update order record in the DB. Make DB errors non-fatal
      // so webhooks succeed even when the DB isn't reachable in some envs.
      try {
        await prisma.order.create({
          data: {
            paymentId: String(paymentId),
            templateId: orderId ?? "unknown",
            amount: Number(amount ?? 0) / 100,
            status: "paid",
          },
        });
      } catch (dbErr) {
        console.error('Failed to persist order from webhook:', dbErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }
}

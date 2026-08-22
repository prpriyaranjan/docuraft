import { NextResponse } from "next/server";
import { getTemplateById } from "@/data/templates";
import { verifyToken } from "@/lib/auth";
import { createDownloadToken } from "@/lib/security";
import { isValidTemplateId, sanitizeText, validateAmount } from "@/lib/validation";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    verifyToken(token);

    const payload = await request.json();
    const templateId = sanitizeText(payload?.templateId ?? "");
    const amount = Number(payload?.amount ?? 0);

    // Support two flows:
    // 1) Razorpay Checkout verification: client sends razorpay_* fields.
    // 2) Legacy/simpler flow where the client provides a paymentId (e.g., UPI flow).
    const paymentId = sanitizeText(payload?.paymentId ?? "");
    const razorpayPaymentId = sanitizeText(payload?.razorpay_payment_id ?? "");
    const razorpayOrderId = sanitizeText(payload?.razorpay_order_id ?? "");
    const razorpaySignature = sanitizeText(payload?.razorpay_signature ?? "");

    if (!isValidTemplateId(templateId)) {
      return NextResponse.json({ error: "Invalid template id" }, { status: 400 });
    }

    const template = getTemplateById(templateId);

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    if (!validateAmount(amount) || amount !== template.price) {
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    // If Razorpay fields are present, verify signature and confirm capture via Razorpay API.
    if (razorpayPaymentId && razorpayOrderId && razorpaySignature) {
      const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";

      if (!RAZORPAY_KEY_SECRET) {
        return NextResponse.json({ error: "Razorpay secret not configured" }, { status: 500 });
      }

      const expected = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest("hex");

      const sigBuf = Buffer.from(razorpaySignature);
      const expBuf = Buffer.from(expected);
      if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        return NextResponse.json({ error: "Invalid Razorpay signature" }, { status: 400 });
      }

      // Retrieve payment from Razorpay to ensure it's captured
      const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID ?? "";
      const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";
      const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_SECRET}`).toString("base64");
      const resp = await fetch(`https://api.razorpay.com/v1/payments/${razorpayPaymentId}`, {
        headers: { Authorization: `Basic ${auth}` },
      });

      if (!resp.ok) {
        const text = await resp.text();
        return NextResponse.json({ error: `Failed to fetch payment from Razorpay: ${text}` }, { status: 502 });
      }

      const paymentData = await resp.json();
      const status = paymentData?.status ?? "";

      if (status !== "captured") {
        return NextResponse.json({ error: `Payment not captured (status=${status})` }, { status: 400 });
      }

      // At this point, payment is verified. Create a download token and persist an order if possible.
      const downloadToken = createDownloadToken({ templateId: template.id, paymentId: razorpayPaymentId, amount });

      try {
        await prisma.order.create({
          data: {
            paymentId: String(razorpayPaymentId),
            templateId: template.id,
            amount: Number(amount ?? 0),
            status: "paid",
          },
        });
      } catch (dbErr) {
        console.error("Failed to persist order after Razorpay verification:", dbErr);
      }

      return NextResponse.json({ ok: true, verified: true, templateId: template.id, amount, paymentId: razorpayPaymentId, downloadToken, status: "paid" }, { status: 200 });
    }

    if (!paymentId) {
      return NextResponse.json({ error: "Missing payment identifier" }, { status: 400 });
    }

    const downloadToken = createDownloadToken({ templateId: template.id, paymentId, amount });

    return NextResponse.json({ ok: true, verified: true, templateId: template.id, amount, paymentId, downloadToken, status: "paid", message: "Payment verified on the server." });
  } catch {
    return NextResponse.json(
      { error: "Invalid payment payload" },
      { status: 400 },
    );
  }
}
